import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipientType: { type: String, enum: ['Admin', 'Tutor', 'Student'] },
  recipientId: { type: mongoose.Schema.Types.ObjectId },
  title: { type: String },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  studentName: { type: String },
  phoneNumber: { type: String },
  oldCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  oldBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  newCourseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  newBatchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  transferType: { type: String, enum: ['Temporary', 'Permanent', 'Redo', 'Auto Restore', 'Cancelled'] },
  
  // Legacy fields (kept for backward compatibility)
  name: { type: String, required: false }, // Made optional to not break new system if omitted
  phone: { type: String, default: '' },
  email: { type: String, required: false },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  notificationType: { type: String },
  purchaseAmount: { type: String },
  courseName: { type: String }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
