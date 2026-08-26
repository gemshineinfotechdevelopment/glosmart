import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  adminName: {
    type: String,
    required: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  oldCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  newCourseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  oldBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    index: true
  },
  oldBatchName: {
    type: String
  },
  newBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    index: true
  },
  newBatchName: {
    type: String
  },
  action: {
    type: String,
    enum: ['Temporary Transfer', 'Permanent Conversion', 'Cancelled', 'Completed'],
    required: true
  },
  ipAddress: {
    type: String,
    default: ''
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);
export default AuditLog;
