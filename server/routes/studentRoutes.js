import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';

const router = express.Router();

const defaultStudent = {
  name: 'Sarah Jenkins',
  email: 'sarah.jenkins@example.com',
  phone: '+1 (555) 012-3456',
  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  age: '10 yrs',
  gender: 'Female',
  joiningDate: 'Jan 12, 2024',
  admissionDate: 'Jan 12, 2024',
  feeStatus: 'PENDING',
  attendanceRate: 98,
  parent: 'Michael Jenkins',
  enrolledCourses: [
    {
      courseId: 'sculpt-101',
      courseName: 'Introduction to Sculpture',
      courseCode: 'ART-201',
      description: 'Explore the three-dimensional medium using clay, plaster, and wire. Learn form, volume, and proportions.',
      skillLevel: 'Beginner',
      thumbnailImage: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      progress: 68,
      instructor: 'Sophia Reed',
      nextSession: 'Tue 2:00 PM',
      lastAccessed: '2 days ago'
    },
    {
      courseId: 'draw-202',
      courseName: 'Anatomy Drawing & Sketching',
      courseCode: 'ART-305',
      description: 'Master human proportions, skeletal structure, and gestural dynamics. Perfect for character design.',
      skillLevel: 'Intermediate',
      thumbnailImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      progress: 45,
      instructor: 'Marcus Vance',
      nextSession: 'Thu 10:30 AM',
      lastAccessed: 'Yesterday'
    },
    {
      courseId: 'oil-303',
      courseName: 'Advanced Oil Painting Techniques',
      courseCode: 'ART-412',
      description: 'Deep dive into color theory, underpainting, glazing, and textural impasto work on canvas.',
      skillLevel: 'Advanced',
      thumbnailImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      progress: 12,
      instructor: 'Elena Rostova',
      nextSession: 'Sat 9:00 AM',
      lastAccessed: '5 days ago'
    }
  ],
  attendanceRecords: [
    { date: '2026-07-12', status: 'Present', duration: '2 hours', time: '09:00 AM - 11:00 AM', activity: 'Acrylic blending exercises' },
    { date: '2026-07-10', status: 'Present', duration: '2 hours', time: '09:00 AM - 11:00 AM', activity: 'Clay modeling form' },
    { date: '2026-07-08', status: 'Present', duration: '2.5 hours', time: '09:00 AM - 11:30 AM', activity: 'Glazing techniques' },
    { date: '2026-07-05', status: 'Late', duration: '2 hours', time: '09:20 AM - 11:00 AM', activity: 'Proportions overview' },
    { date: '2026-07-03', status: 'Present', duration: '2 hours', time: '09:00 AM - 11:00 AM', activity: 'Still life sketching' },
    { date: '2026-07-01', status: 'Present', duration: '2 hours', time: '09:00 AM - 11:00 AM', activity: 'Intro to oil paints' },
    { date: '2026-06-28', status: 'Absent', duration: '0 hours', time: 'N/A', activity: 'Sick leave (Notified)' }
  ],
  assignments: [
    { id: 't1', title: 'Clay Modeling Basics', course: 'Introduction to Sculpture', dueDate: 'July 18, 2026', status: 'Pending', description: 'Submit photographs of your finished clay sphere and cube showing smooth shading and clean edges.' },
    { id: 't2', title: 'Charcoal Portrait Study', course: 'Anatomy Drawing & Sketching', dueDate: 'July 22, 2026', status: 'Pending', description: 'Draw a portrait focusing on dramatic side-lighting (chiaroscuro) using vine charcoal and kneaded erasers.' },
    { id: 't3', title: 'Water Color Still Life', course: 'Advanced Oil Painting Techniques', dueDate: 'July 25, 2026', status: 'Pending', description: 'Create a composition of three objects on a draped table, demonstrating correct color value transitions.' },
    { id: 't4', title: 'Digital Art Landscape', course: 'Anatomy Drawing & Sketching', dueDate: 'July 29, 2026', status: 'Pending', description: 'Paint an environment with atmosphere perspective, focusing on foreground, midground, and background.' },
    { id: 't5', title: 'Impressionist Landscape Glazing', course: 'Advanced Oil Painting Techniques', dueDate: 'June 30, 2026', status: 'Graded', grade: 'A+', description: 'Recreate a classic landscape using thick textured impasto foreground layers and thin glaze transitions.', submittedFile: 'landscape_glaze_final.jpg', submittedAt: 'June 29, 2026' },
    { id: 't6', title: 'Proportion Sketch Collection', course: 'Anatomy Drawing & Sketching', dueDate: 'June 24, 2026', status: 'Graded', grade: 'A', description: 'Submit 5 gesture sheets drawing body joints in movement (30-second poses).', submittedFile: 'gesture_sheets.pdf', submittedAt: 'June 23, 2026' }
  ],
  leaveRequests: [
    {
      id: 'LR-9981',
      startDate: '2026-07-06',
      endDate: '2026-07-06',
      type: 'Excused',
      reason: 'Medical checkup',
      status: 'Approved',
      appliedOn: '2026-07-04'
    }
  ]
};

// GET first student (loads or seeds default Sarah Jenkins student)
router.get('/first', async (req, res) => {
  try {
    let student = await Student.findOne({ name: 'Sarah Jenkins' });
    if (!student) {
      // Also try finding any student at all
      student = await Student.findOne();
    }
    if (!student) {
      // Create default Sarah Jenkins student
      student = new Student(defaultStudent);
      await student.save();
      console.log('Seeded default Sarah Jenkins student');
    }

    // Clean up any enrolledCourses that no longer exist in the Course collection
    if (student && student.enrolledCourses && student.enrolledCourses.length > 0) {
      const activeCourses = await Course.find({}, '_id courseName');
      const activeCourseIds = activeCourses.map(c => c._id.toString());
      const activeCourseNames = activeCourses.map(c => c.courseName.toLowerCase());

      const filteredEnrolledCourses = student.enrolledCourses.filter(ec => {
        // Keep it if it's one of the seeded defaults
        if (['sculpt-101', 'draw-202', 'oil-303'].includes(ec.courseId)) {
          return true;
        }
        // Keep it if the courseId is a valid ObjectId and exists in the Course collection
        if (mongoose.Types.ObjectId.isValid(ec.courseId)) {
          return activeCourseIds.includes(ec.courseId.toString());
        }
        // Otherwise, check if the courseName exists in active course names
        return activeCourseNames.includes(ec.courseName.toLowerCase());
      });

      if (filteredEnrolledCourses.length !== student.enrolledCourses.length) {
        student.enrolledCourses = filteredEnrolledCourses;
        await student.save();
        console.log('Cleaned up deleted courses from student enrolled list');
      }
    }

    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET student by ID
router.get('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new student
router.post('/', async (req, res) => {
  try {
    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();

    // Increment students count in Batch when student is enrolled in a batch
    if (savedStudent.batchId || savedStudent.batch) {
      const query = savedStudent.batchId ? { _id: savedStudent.batchId } : { batchName: savedStudent.batch };
      await Batch.findOneAndUpdate(
        query,
        { 
          $inc: { enrolledStudents: 1 },
          $push: { students: savedStudent._id }
        }
      );
    }

    res.status(201).json(savedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE all students
router.delete('/', async (req, res) => {
  try {
    await Student.deleteMany({});
    // Reset enrollment counts for all batches
    await Batch.updateMany({}, { enrolledStudents: 0, students: [] });
    res.json({ message: 'All students deleted and batch enrollment counts reset' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT update student
router.put('/:id', async (req, res) => {
  try {
    const oldStudent = await Student.findById(req.params.id);
    if (!oldStudent) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // If the batch changed, update the student counts on the batches
    const oldBatchId = oldStudent.batchId ? oldStudent.batchId.toString() : oldStudent.batch;
    const newBatchId = req.body.batchId ? req.body.batchId.toString() : req.body.batch;
    
    if (newBatchId && newBatchId !== oldBatchId) {
      if (oldBatchId) {
        const oldQuery = mongoose.Types.ObjectId.isValid(oldBatchId) ? { _id: oldBatchId } : { batchName: oldBatchId };
        await Batch.findOneAndUpdate(
          oldQuery,
          { 
            $inc: { enrolledStudents: -1 },
            $pull: { students: updatedStudent._id }
          }
        );
      }
      
      const newQuery = mongoose.Types.ObjectId.isValid(newBatchId) ? { _id: newBatchId } : { batchName: newBatchId };
      await Batch.findOneAndUpdate(
        newQuery,
        { 
          $inc: { enrolledStudents: 1 },
          $push: { students: updatedStudent._id }
        }
      );
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE student by ID
router.delete('/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    // Decrement enrollment count in Batch when student is deleted
    if (student.batchId || student.batch) {
      const query = student.batchId ? { _id: student.batchId } : { batchName: student.batch };
      await Batch.findOneAndUpdate(
        query,
        { 
          $inc: { enrolledStudents: -1 },
          $pull: { students: student._id }
        }
      );
    }
    
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
