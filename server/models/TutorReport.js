import mongoose from 'mongoose';

const tutorReportSchema = new mongoose.Schema({
  teacherName: { type: String, required: true },
  courseName: { type: String, default: 'Art Course' },
  batchName: { type: String, required: true },
  batchCode: { type: String, default: '' },
  zoomLink: { type: String, default: '' },
  activatedAt: { type: Date, required: true },
  deactivatedAt: { type: Date, required: true },
  durationMinutes: { type: Number, default: 0 },
  description: { type: String, default: '' }
}, {
  timestamps: true
});

const TutorReport = mongoose.model('TutorReport', tutorReportSchema);
export default TutorReport;
