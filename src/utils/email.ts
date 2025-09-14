export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const buildMailtoLink = ({ name, email, subject, message }: ContactFormData) => {
  const body = `Name: ${name}\nEmail: ${email}\n\n${message}`;
  return `mailto:hello@govividmedia.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

