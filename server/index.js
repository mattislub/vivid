import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

// Updated CORS configuration to allow your frontend domain
const corsOptions = {
  origin: [
    'https://govividmedia.70-60.com',
    'http://localhost:3000', // for local development
    'http://localhost:5173', // for Vite dev server
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json());

// Add a preflight handler for OPTIONS requests
app.options('*', cors(corsOptions));

app.post('/api/contact', async (req, res) => {
  console.log('Request reached server at', req.headers.host);
  console.log('Origin:', req.headers.origin);
  console.log('Received contact form submission', req.body);
  
  const { name, email, subject, message } = req.body;
  
  if (!name || !email || !subject || !message) {
    console.warn('Contact form missing fields', req.body);
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_RECIPIENT || process.env.SMTP_USER,
      replyTo: email,
      subject: subject || `New message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`
    });
    console.log('Email sent successfully');
    res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Error sending email', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 6001;
app.listen(PORT, () => {
  console.log(`Email server listening on port ${PORT}`);
  console.log('CORS origins:', corsOptions.origin);
});
