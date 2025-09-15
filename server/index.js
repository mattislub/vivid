import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();

// Very simple CORS setup - allows all origins for testing
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(cors(corsOptions));
app.use(express.json());

// Add explicit preflight handling
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request for:', req.path);
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    return res.sendStatus(200);
  }
  next();
});

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
