// server/index.js
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataFile = path.join(__dirname, 'portfolio.json');
const uploadsDir = path.join(process.cwd(), 'server', 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

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

const requireAdmin = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// ===== CORS (פשוט, ללא cookies) =====
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization','x-admin-secret'],
  credentials: false
}));
app.use(express.json({ limit: '8mb' }));
app.use('/uploads', express.static(uploadsDir));

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

app.post('/api/projects', requireAdmin, (req, res) => {
  const projects = readProjects();
  const nextId = projects.reduce((max, p) => Math.max(max, p.id), 0) + 1;
  const project = { id: nextId, ...(req.body || {}) };
  projects.push(project);
  writeProjects(projects);
  res.json(project);
});

app.delete('/api/projects/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  let projects = readProjects();
  projects = projects.filter(p => p.id !== id);
  writeProjects(projects);
  res.json({ ok: true });
});

app.post('/api/uploads', requireAdmin, (req, res) => {
  const { data, filename, mimeType } = req.body || {};

  if (!data || typeof data !== 'string') {
    return res.status(400).json({ error: 'Missing image data' });
  }

  if (mimeType && typeof mimeType === 'string' && !mimeType.startsWith('image/')) {
    return res.status(400).json({ error: 'Only image uploads are allowed' });
  }

  const sanitizedBase64 = data.replace(/^data:[^;]+;base64,/, '');

  let buffer;
  try {
    buffer = Buffer.from(sanitizedBase64, 'base64');
  } catch (err) {
    console.error('Failed to decode base64 image', err);
    return res.status(400).json({ error: 'Invalid image encoding' });
  }

  if (!buffer || buffer.length === 0) {
    return res.status(400).json({ error: 'Empty image payload' });
  }

  const sizeInMb = buffer.length / (1024 * 1024);
  if (sizeInMb > 5) {
    return res.status(413).json({ error: 'Image is too large. Maximum size is 5MB.' });
  }

  const safeOriginalName = typeof filename === 'string' && filename.length > 0
    ? filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase()
    : 'image';

  const extensionFromName = path.extname(safeOriginalName);
  const extensionFromMime = typeof mimeType === 'string' && mimeType.includes('/')
    ? `.${mimeType.split('/')[1].split('+')[0]}`
    : '';

  let extension = extensionFromName || extensionFromMime || '.png';
  if (!extension.startsWith('.')) {
    extension = `.${extension}`;
  }
  if (!['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(extension)) {
    extension = '.png';
  }

  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
  const filePath = path.join(uploadsDir, uniqueName);

  try {
    fs.writeFileSync(filePath, buffer);
  } catch (err) {
    console.error('Failed to save uploaded image', err);
    return res.status(500).json({ error: 'Failed to save image' });
  }

  const urlPath = `/uploads/${uniqueName}`;
  return res.json({ ok: true, url: urlPath, filename: uniqueName });
});

// ===== Error handler =====
app.use((err, _req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ===== Start =====
const PORT = Number(process.env.PORT || 6001);
app.listen(PORT, () => {
  console.log('=== EMAIL SERVER STARTED ===');
  console.log(`Server listening on port ${PORT}`);
  console.log('CORS: simple headers enabled for all origins');
});
