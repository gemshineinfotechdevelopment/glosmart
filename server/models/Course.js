import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
  courseName: { type: String, required: true },
  courseCode: { type: String, unique: true },
  description: { type: String },
  skillLevel: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  thumbnailImage: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  maxStudents: { type: Number, default: 30 },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  batches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Batch' }]
}, {
  timestamps: true
});

// Pre-save hook to generate courseCode (e.g., ART001, ART002)
courseSchema.pre('save', async function () {
  if (!this.isNew) {
    return;
  }
  
  const lastCourse = await this.constructor.findOne({}, {}, { sort: { 'createdAt': -1 } });
  
  let nextNumber = 1;
  if (lastCourse && lastCourse.courseCode && lastCourse.courseCode.startsWith('ART')) {
    const lastNumberStr = lastCourse.courseCode.replace('ART', '');
    const lastNumber = parseInt(lastNumberStr, 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }
  
  this.courseCode = `ART${nextNumber.toString().padStart(3, '0')}`;
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
