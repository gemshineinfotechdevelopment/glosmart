import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  batchName: { type: String, required: true },
  status: { type: String, default: "UPCOMING" },
  statusColor: { type: String, default: "bg-teal-500" },
  batchCode: { type: String, required: true },
  courseName: { type: String, required: true },
  category: { type: String },
  courseIconBg: { type: String, default: "bg-teal-50" },
  time: { type: String, default: "TBD" },
  schedule: { type: String, default: "TBD" },
  startDate: { type: String },
  endDate: { type: String },
  progressLabel: { type: String, default: "LAUNCH TIMELINE" },
  progressText: { type: String, default: "Starts soon" },
  progressColor: { type: String, default: "text-teal-600" },
  progressWidth: { type: String, default: "w-0" },
  progressBg: { type: String, default: "bg-teal-500" },
  instructor: { type: String, required: true },
  instructorAvatar: { type: String },
  students: { type: Number, default: 0 },
  maxStudents: { type: Number, default: 30 },
  image: { type: String },
  price: { type: String }
}, {
  timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
