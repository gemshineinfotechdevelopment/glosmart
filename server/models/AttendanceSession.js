import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  enabledByUserId: { type: String, required: true },
  enabledByName: { type: String, required: true },
  enabledByRole: { type: String, enum: ['admin', 'teacher'], required: true },
  enabledAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['Enabled', 'Disabled'], default: 'Enabled' }
}, {
  timestamps: true
});

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);
export default AttendanceSession;
