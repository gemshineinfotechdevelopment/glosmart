import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, default: '' },
  email: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  notificationType: { type: String },
  purchaseAmount: { type: String },
  courseName: { type: String }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
