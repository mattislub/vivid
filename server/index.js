// server/index.js
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

// --- CORS פשוט: מתאים כשאין cookies/credentials בצד לקוח ---
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Origin','X-Requested-With','Content-Type','Accept','Authorization'],
  credentials: false
}));

app.use(express.json());

// עוזר: חובה משתני סביבה
const must = (k) => {
  const v = process.env[k];
  if (!v) throw new Error(`Missing required env: ${k}`);
  return v;
};

// --- יצירת טרנספורטר SMTP ---
let transporter;
try {
  transporter = nodemailer.createTransport({
    host: must('SMTP_HOST'),
    port: Number(must('SMTP_PORT')),         // 465 ל-secure=true, 587 ל-secure=false
    secure: must('SMTP_SECURE') === 'true',  // 'true' או 'false' במפורש
    auth: {
      user: must('SMTP_USER'),
      pass: must('SMTP_PASS'),
    },
    // אופציונלי: אם יש בעיות תעודה, ניתן לבטל אימות (עדיף שלא בפרודקשן)
    // tls: { rejectUnauthorized: false },
  });
  await transporter.verify();
  console.log('SMTP: ready');
} catch (err) {
  console.error('SMTP setup/verify failed:', err);
  // אל תזרוק — תן ל-/health לעבוד, אבל POST יחזיר 503 מסודר
}

// --- Health ---
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    cors: 'enabled',
    smtpReady: !!transporter
  });
});

// --- /api/contact ---
app.post('/api/contact', async (req, res) => {
  console.log('=== CONTACT FORM REQUEST ===');
  console.log('Host:', req.headers.host);
  console.log('Origin:', req.headers.origin);
  console.log('Body:', req.body);

  const { name, email, subject, message } = req.body || {};
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: 'Missing required fields' });
  }
  if (!transporter) {
    return res.status(503).json({ ok: false, error: 'Mail transport not ready' });
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  const to   = process.env.CONTACT_RECIPIENT || process.env.SMTP_USER;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    console.log('Email sent:', info.messageId);
    res.json({ ok: true, id: info.messageId });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ ok: false, error: 'Failed to send email' });
  }
});

const PORT = Number(process.env.PORT || 6001);
app.listen(PORT, () => {
  console.log('=== EMAIL SERVER STARTED ===');
  console.log(`Listening on port ${PORT}`);
  console.log('CORS: simple headers enabled for all origins');
});
