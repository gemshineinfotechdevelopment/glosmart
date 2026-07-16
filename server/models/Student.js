import mongoose from 'mongoose';

const enrolledCourseSchema = new mongoose.Schema({
  courseId: { type: String },
  courseName: { type: String, required: true },
  courseCode: { type: String },
  description: { type: String },
  skillLevel: { type: String },
  thumbnailImage: { type: String },
  progress: { type: Number, default: 0 },
  instructor: { type: String, default: 'TBD' },
  nextSession: { type: String, default: 'Schedule TBD' },
  lastAccessed: { type: String, default: 'Just Enrolled' },
  batchId: { type: String },
  batchName: { type: String }
});

const attendanceRecordSchema = new mongoose.Schema({
  date: { type: String, required: true },
  status: { type: String, required: true }, // Present, Absent, Late
  duration: { type: String },
  time: { type: String },
  activity: { type: String }
});

const assignmentSchema = new mongoose.Schema({
  id: { type: String },
  title: { type: String, required: true },
  course: { type: String, required: true },
  dueDate: { type: String },
  status: { type: String, default: 'Pending' }, // Pending, Submitted, Graded
  grade: { type: String },
  description: { type: String },
  submittedFile: { type: String },
  submittedAt: { type: String }
});

const leaveRequestSchema = new mongoose.Schema({
  id: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  type: { type: String, required: true }, // Excused, Unexcused, Sick
  reason: { type: String, required: true },
  status: { type: String, default: 'Pending' }, // Pending, Approved, Rejected
  appliedOn: { type: String }
});

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  avatar: { type: String },
  age: { type: String },
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
  address: { type: String },
  parent: { type: String },
  enrolledCourses: [enrolledCourseSchema],
  attendanceRecords: [attendanceRecordSchema],
  assignments: [assignmentSchema],
  leaveRequests: [leaveRequestSchema]
}, {
  timestamps: true
});

const Student = mongoose.model('Student', studentSchema);
export default Student;
