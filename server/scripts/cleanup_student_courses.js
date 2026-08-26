import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import Course from '../models/Course.js';

dotenv.config();

async function cleanupStaticStudentCourses() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/art_lms';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    const activeCourses = await Course.find({}, '_id courseName');
    const activeCourseIds = new Set(activeCourses.map(c => c._id.toString()));
    const activeCourseNames = new Set(activeCourses.map(c => c.courseName.toLowerCase()));

    const students = await Student.find({});
    for (const student of students) {
      if (student.enrolledCourses && student.enrolledCourses.length > 0) {
        const cleanedEnrolled = student.enrolledCourses.filter(ec => {
          // Remove fake static IDs
          if (['sculpt-101', 'draw-202', 'oil-303'].includes(ec.courseId)) {
            return false;
          }
          if (ec.courseId && activeCourseIds.has(ec.courseId.toString())) {
            return true;
          }
          if (ec.courseName && activeCourseNames.has(ec.courseName.toLowerCase())) {
            return true;
          }
          return false;
        });

        if (cleanedEnrolled.length !== student.enrolledCourses.length) {
          student.enrolledCourses = cleanedEnrolled;
          await student.save();
          console.log(`Cleaned up student ${student.name} (${student._id}): ${cleanedEnrolled.length} remaining.`);
        }
      }
    }

    console.log('Finished cleaning static student courses.');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
}

cleanupStaticStudentCourses();
