import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting contact form', formData);
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      console.log('Received response from server', response.status);

      if (!response.ok) {
        console.error('Form submission failed', response.status);
        throw new Error('Network response was not ok');
      }

      console.log('Form submission succeeded');
      alert('התודה! ההודעה נשלחה בהצלחה');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting contact form', error);
      alert('שליחת ההודעה נכשלה, נסה שוב מאוחר יותר');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-chewy text-white mb-6">
            <span className="text-white">Contact</span> Us
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            We'd love to hear from you and be part of your next project
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Info */}
          <div className="space-y-8">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                <MessageCircle className="mr-3 text-white animate-bounce" size={24} style={{animationDuration: '2s'}} />
                Let's Talk
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="bg-amber-500/20 p-3 rounded-full hover:scale-110 transition-transform duration-300 hover:rotate-12">
                    <Mail className="text-white animate-pulse" size={20} style={{animationDuration: '2.5s'}} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Email</h3>
                    <p className="text-slate-300">Shragy@govividmedia.com</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-blue-500/20 p-3 rounded-full hover:scale-110 transition-transform duration-300 hover:rotate-12">
                    <Phone className="text-blue-400 animate-pulse" size={20} style={{animationDuration: '3s'}} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Phone</h3>
                    <p className="text-slate-300">+1 (657) 888-4843</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="bg-green-500/20 p-3 rounded-full hover:scale-110 transition-transform duration-300 hover:rotate-12">
                    <MapPin className="text-green-400 animate-pulse" size={20} style={{animationDuration: '2.8s'}} />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">Location</h3>
                    <p className="text-slate-300">7 Perlman Dr<br />
                      unit 218 <br />Spring Valley, NY 10977</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-white/10 to-gray-100/10 rounded-2xl p-8 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-4">Business Hours</h3>
              <div className="space-y-2 text-slate-300">
                <p>Monday - Thursday: 9:00 AM - 6:00 PM</p>
                <p>Friday: 10:00 AM - 2:00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                    placeholder="Enter your name"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                    placeholder="example@email.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200"
                  placeholder="How can we help?"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200 resize-none"
                  placeholder="Tell us about your project..."
                  required
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="group w-full bg-gradient-to-r from-white to-gray-100 hover:from-gray-100 hover:to-gray-200 text-slate-900 font-semibold py-4 px-6 rounded-lg transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
              >
                <Send size={20} className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-300" />
                <span>Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
