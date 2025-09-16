// server/index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();

// ===== Simple file storage for portfolio projects =====
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'portfolio.json');

function readProjects() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeProjects(projects) {
  fs.writeFileSync(dataFile, JSON.stringify(projects, null, 2));
}

// ===== CORS (פשוט, ללא cookies) =====
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
  credentials: false
}));
app.use(express.json());

// ===== לוג קונפיג (ללא סיסמה) =====
const smtpCfgPublic = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  user: process.env.SMTP_USER,
  from: process.env.SMTP_FROM,
  to: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER,
};
console.log('SMTP cfg:', smtpCfgPublic);

// ===== Nodemailer Transport =====
let transporter = null;
async function initTransport() {
  try {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,                       // לדוגמה: smtp.hostinger.com
      port: Number(process.env.SMTP_PORT || 587),        // 465 עם secure=true, או 587 עם secure=false
      secure: String(process.env.SMTP_SECURE) === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,                     // אל תדפיס ללוגים
      },
    });
    await transporter.verify();
    console.log('SMTP: ready');
  } catch (err) {
    console.error('SMTP verify failed:', err);
    transporter = null;
  }
}
await initTransport();

// ===== Health =====
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    smtpReady: !!transporter
  });
});

// ===== /api/contact =====
app.post('/api/contact', async (req, res) => {
  console.log('=== CONTACT FORM REQUEST ===');
  console.log('Host:', req.headers.host);
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);

  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok:false, error: 'Missing required fields' });
  }

  if (!transporter) {
    // ניסיון חד-פעמי לאתחל מחדש בזמן ריצה
    await initTransport();
    if (!transporter) {
      return res.status(503).json({ ok:false, error: 'Mail transport not ready' });
    }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const to   = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER;

  try {
    const plain = `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\n${message}`;
    const html = `
    <div style="font-family:Arial, sans-serif; line-height:1.6; color:#1f2937;">
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;margin:auto;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#6366f1;color:#ffffff;padding:16px 24px;">
            <h2 style="margin:0;font-size:20px;">New Contact Message</h2>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${name}</p>
            <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${email}</p>
            <p style="margin:0 0 16px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin:16px 0 0 0; white-space:pre-wrap;">${message}</p>
          </td>
        </tr>
      </table>
    </div>
    `;

    const info = await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: plain,
      html,
    });
    console.log('Mail sent:', info.messageId);
    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ ok:false, error: 'Failed to send email' });
  }
});

// ===== Portfolio API =====
app.get('/api/projects', (_req, res) => {
  res.json(readProjects());
});

app.post('/api/projects', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const projects = readProjects();
  const nextId = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const project = { id: nextId, ...(req.body || {}) };
  projects.push(project);
  writeProjects(projects);
  res.json(project);
});

app.delete('/api/projects/:id', (req, res) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const id = Number(req.params.id);
  let projects = readProjects();
  projects = projects.filter(p => p.id !== id);
  writeProjects(projects);
  res.json({ ok: true });
});

// ===== Start =====
const PORT = Number(process.env.PORT || 6001);
app.listen(PORT, () => {
  console.log('=== EMAIL SERVER STARTED ===');
  console.log(`Server listening on port ${PORT}`);
  console.log('CORS: simple headers enabled for all origins');
});
