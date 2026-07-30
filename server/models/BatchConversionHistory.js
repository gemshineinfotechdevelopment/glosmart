import mongoose from 'mongoose';

const batchConversionHistorySchema = new mongoose.Schema({
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
  oldBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  newBatchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  reason: {
    type: String,
    default: ''
  },
  convertedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

const BatchConversionHistory = mongoose.model('BatchConversionHistory', batchConversionHistorySchema);
export default BatchConversionHistory;
