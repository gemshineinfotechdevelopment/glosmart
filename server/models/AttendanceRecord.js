import mongoose from 'mongoose';

const attendanceRecordSchema = new mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'AttendanceSession', required: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', required: true },
  attendanceDate: { type: String, required: true }, // Format: YYYY-MM-DD
  attendanceTime: { type: String, required: true }, // Format: HH:MM AM/PM
  status: { type: String, enum: ['Present'], default: 'Present' }
}, {
  timestamps: true
});

const AttendanceRecord = mongoose.model('AttendanceRecord', attendanceRecordSchema);
export default AttendanceRecord;
