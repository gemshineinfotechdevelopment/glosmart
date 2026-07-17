import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  batchName: { type: String, required: true },
  batchCode: { type: String, unique: true },
  instructor: { type: String },
  instructorAvatar: { type: String },
  startDate: { type: String },
  endDate: { type: String },
  startTime: { type: String },
  endTime: { type: String },
  days: [{ type: String }],
  capacity: { type: Number, default: 30 },
  enrolledStudents: { type: Number, default: 0 },
  availableSeats: { type: Number, default: 30 },
  batchFee: { type: Number }, // Optional override
  classroom: { type: String },
  batchNotes: { type: String },
  status: { type: String, enum: ['ACTIVE', 'UPCOMING', 'COMPLETED', 'WEEKEND', 'INACTIVE'], default: 'UPCOMING' },
  statusColor: { type: String, default: "bg-teal-500" },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  assignments: [{
    title: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  // Keeping these for backwards compatibility with existing UI temporarily if needed
  courseName: { type: String },
  category: { type: String },
  courseIconBg: { type: String, default: "bg-teal-50" },
  image: { type: String }
}, {
  timestamps: true
});

// Pre-save hook to calculate availableSeats and auto-generate batchCode
batchSchema.pre('save', async function () {
  // Calculate available seats
  this.availableSeats = Math.max(0, this.capacity - this.enrolledStudents);

  if (!this.isNew) {
    return;
  }
  
  // Auto-generate batchCode
  const lastBatch = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
  
  let nextNumber = 1;
  if (lastBatch && lastBatch.batchCode && lastBatch.batchCode.startsWith('BAT')) {
    const lastNumberStr = lastBatch.batchCode.replace('BAT', '');
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  this.batchCode = `BAT${nextNumber.toString().padStart(3, '0')}`;
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
