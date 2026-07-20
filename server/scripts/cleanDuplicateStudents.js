import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error('ERROR: MONGODB_URI is not defined in server/.env');
  process.exit(1);
}

async function cleanDuplicateStudents() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB successfully.');

    const allStudents = await Student.find().sort({ createdAt: 1 });
    console.log(`Found ${allStudents.length} total student records in database.`);

    // Group students by normalized email
    const groupedByEmail = new Map();

    for (const student of allStudents) {
      const emailKey = (student.email || '').toLowerCase().trim();
      if (!emailKey) continue;

      if (!groupedByEmail.has(emailKey)) {
        groupedByEmail.set(emailKey, []);
      }
      groupedByEmail.get(emailKey).push(student);
    }

    let duplicateGroupsFound = 0;
    let totalRemoved = 0;

    for (const [email, students] of groupedByEmail.entries()) {
      if (students.length <= 1) continue;

      duplicateGroupsFound++;
      console.log(`\nProcessing duplicate group for email: "${email}" (${students.length} records)`);

      // Sort: prefer record with most enrolledCourses, then oldest
      students.sort((a, b) => {
        const coursesA = a.enrolledCourses ? a.enrolledCourses.length : 0;
        const coursesB = b.enrolledCourses ? b.enrolledCourses.length : 0;
        if (coursesB !== coursesA) {
          return coursesB - coursesA; // descending
        }
        return a.createdAt - b.createdAt; // ascending (oldest first)
      });

      const primaryStudent = students[0];
      const duplicates = students.slice(1);

      console.log(`  -> Primary Student selected: ID=${primaryStudent._id}, Name="${primaryStudent.name}", Enrolled Courses=${primaryStudent.enrolledCourses ? primaryStudent.enrolledCourses.length : 0}`);

      // Merge data into primaryStudent
      let modified = false;

      // Ensure enrolledCourses array exists
      if (!primaryStudent.enrolledCourses) primaryStudent.enrolledCourses = [];

      const existingCourseIdentifiers = new Set(
        primaryStudent.enrolledCourses.map(ec => (ec.courseName || '').toLowerCase().trim())
      );

      for (const dup of duplicates) {
        console.log(`  -> Merging duplicate ID=${dup._id}, Name="${dup.name}"...`);

        // 1. Merge enrolledCourses
        if (dup.enrolledCourses && dup.enrolledCourses.length > 0) {
          for (const ec of dup.enrolledCourses) {
            const courseKey = (ec.courseName || '').toLowerCase().trim();
            if (courseKey && !existingCourseIdentifiers.has(courseKey)) {
              primaryStudent.enrolledCourses.push(ec.toObject ? ec.toObject() : ec);
              existingCourseIdentifiers.add(courseKey);
              modified = true;
              console.log(`     + Merged course "${ec.courseName}" into primary student.`);
            }
          }
        }

        // 2. Merge attendanceRecords
        if (dup.attendanceRecords && dup.attendanceRecords.length > 0) {
          if (!primaryStudent.attendanceRecords) primaryStudent.attendanceRecords = [];
          const existingDates = new Set(primaryStudent.attendanceRecords.map(a => a.date));
          for (const rec of dup.attendanceRecords) {
            if (!existingDates.has(rec.date)) {
              primaryStudent.attendanceRecords.push(rec.toObject ? rec.toObject() : rec);
              existingDates.add(rec.date);
              modified = true;
            }
          }
        }

        // 3. Merge assignments
        if (dup.assignments && dup.assignments.length > 0) {
          if (!primaryStudent.assignments) primaryStudent.assignments = [];
          const existingTitles = new Set(primaryStudent.assignments.map(a => (a.title || '').toLowerCase().trim()));
          for (const ass of dup.assignments) {
            const titleKey = (ass.title || '').toLowerCase().trim();
            if (titleKey && !existingTitles.has(titleKey)) {
              primaryStudent.assignments.push(ass.toObject ? ass.toObject() : ass);
              existingTitles.add(titleKey);
              modified = true;
            }
          }
        }

        // 4. Merge profile details if missing in primary
        const fieldsToCopy = ['phone', 'avatar', 'age', 'gender', 'address', 'parent', 'batch', 'batchId', 'course', 'courseId'];
        for (const field of fieldsToCopy) {
          if (!primaryStudent[field] && dup[field]) {
            primaryStudent[field] = dup[field];
            modified = true;
          }
        }

        // 5. Update linked User accounts
        const userUpdateRes = await User.updateMany(
          { profileId: dup._id },
          { $set: { profileId: primaryStudent._id } }
        );
        if (userUpdateRes.modifiedCount > 0) {
          console.log(`     + Updated ${userUpdateRes.modifiedCount} User account(s) to point to primary profile.`);
        }

        // 6. Update Batches referencing this duplicate student
        const batches = await Batch.find({ students: dup._id });
        for (const batch of batches) {
          // Remove dup._id, add primaryStudent._id
          batch.students = batch.students.filter(sId => sId.toString() !== dup._id.toString());
          if (!batch.students.some(sId => sId.toString() === primaryStudent._id.toString())) {
            batch.students.push(primaryStudent._id);
          }
          batch.enrolledStudents = batch.students.length;
          await batch.save();
          console.log(`     + Updated Batch "${batch.batchName}" students list.`);
        }

        // 7. Delete the duplicate student record
        await Student.findByIdAndDelete(dup._id);
        totalRemoved++;
        console.log(`     - Deleted duplicate Student record ID=${dup._id}`);
      }

      if (modified) {
        await primaryStudent.save();
        console.log(`  -> Saved updated primary Student record ID=${primaryStudent._id}`);
      }
    }

    console.log(`\n==============================================`);
    console.log(`Database Cleanup Completed Successfully!`);
    console.log(`Duplicate Email Groups Found: ${duplicateGroupsFound}`);
    console.log(`Total Duplicate Student Documents Removed: ${totalRemoved}`);
    const remainingCount = await Student.countDocuments();
    console.log(`Remaining Unique Student Records: ${remainingCount}`);
    console.log(`==============================================\n`);

  } catch (error) {
    console.error('Error during student database cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

cleanDuplicateStudents();
