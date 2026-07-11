import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  age: { type: Number },
  gender: { type: String },
  joiningDate: { type: String },
  feeStatus: { type: String, default: 'PENDING' },
  batchEnd: { type: String },
  remainingDays: { type: Number },
  attendanceRate: { type: Number, default: 100 },
  attendanceTrend: { type: String, default: '+0%' },
  batch: { type: String },
  batchId: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch' },
  course: { type: String },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  teacher: { type: String },
  admissionDate: { type: String },
  schedule: { type: String },
  address: { type: String }
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
