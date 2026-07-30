import mongoose from 'mongoose';

const temporaryBatchTransferSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  originalBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  temporaryBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['scheduled', 'active', 'completed', 'cancelled'],
    default: 'scheduled',
    required: true
  },
  scheduled: {
    type: Boolean,
    default: true
  },
  active: {
    type: Boolean,
    default: false
  },
  completed: {
    type: Boolean,
    default: false
  },
  cancelled: {
    type: Boolean,
    default: false
  },
  reason: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Dynamic query helpers or indices
temporaryBatchTransferSchema.index({ studentId: 1, status: 1 });
temporaryBatchTransferSchema.index({ startDate: 1, endDate: 1 });

const TemporaryBatchTransfer = mongoose.model('TemporaryBatchTransfer', temporaryBatchTransferSchema);
export default TemporaryBatchTransfer;
