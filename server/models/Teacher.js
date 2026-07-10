import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  subject: { type: String, required: true },
  qualification: { type: String },
  experience: { type: String },
  joiningDate: { type: String },
  status: { type: String, default: 'Active' },
  avatar: { type: String },
  address: { type: String }
}, {
  timestamps: true
});

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;
