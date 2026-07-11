import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  profile: {
    adminName: { type: String, default: 'Admin' },
    adminEmail: { type: String, default: 'admin@glosmart.com' },
    adminPhone: { type: String, default: '' },
    adminPassword: { type: String, default: '' },
  },
  contactInfo: {
    phone: { type: String, default: '+1 234 567 890' },
    email: { type: String, default: 'hello@glosmartacademy.com' },
    address: { type: String, default: '123 Art Avenue, Creative District, New York, NY 10001' },
  },
  socialLinks: {
    facebook: { type: String, default: 'https://facebook.com' },
    instagram: { type: String, default: 'https://instagram.com' },
    twitter: { type: String, default: 'https://twitter.com' },
    youtube: { type: String, default: 'https://youtube.com' },
  }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
