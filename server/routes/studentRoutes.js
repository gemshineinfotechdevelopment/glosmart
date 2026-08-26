import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import User from '../models/User.js';
import TemporaryBatchTransfer from '../models/TemporaryBatchTransfer.js';

const router = express.Router();

const defaultStudent = {
  name: 'Student User',
  email: 'student@example.com',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
  age: '',
  gender: 'Select Gender',
  feeStatus: 'PENDING',
  attendanceRate: 100,
  enrolledCourses: [],
  attendanceRecords: [],
  assignments: [],
  leaveRequests: []
};

// GET first student
router.get('/first', async (req, res) => {
  try {
    let student = await Student.findOne();
    if (!student) {
      student = new Student(defaultStudent);
      await student.save();
    }

    // Clean up any enrolledCourses that no longer exist in the Course collection
    if (student && student.enrolledCourses && student.enrolledCourses.length > 0) {
      const activeCourses = await Course.find({}, '_id courseName');
      const activeCourseIds = activeCourses.map(c => c._id.toString());
      const activeCourseNames = activeCourses.map(c => c.courseName.toLowerCase());

      const filteredEnrolledCourses = student.enrolledCourses.filter(ec => {
        if (ec.courseId && mongoose.Types.ObjectId.isValid(ec.courseId)) {
          return activeCourseIds.includes(ec.courseId.toString());
        }
        return activeCourseNames.includes((ec.courseName || '').toLowerCase());
      });

      if (filteredEnrolledCourses.length !== student.enrolledCourses.length) {
        student.enrolledCourses = filteredEnrolledCourses;
        await student.save();
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

// POST new student (or update existing if email matches)
router.post('/', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required for student creation.' });
    }

    const emailRegex = new RegExp('^' + email.trim() + '$', 'i');
    let student = await Student.findOne({ email: emailRegex });

    if (student) {
      // Update existing student details without duplicating
      const updateData = { ...req.body };
      delete updateData.email; // keep original email format
      delete updateData.enrolledCourses; // handle enrolledCourses safely

      Object.assign(student, updateData);

      // Merge new enrolledCourses if provided
      if (req.body.enrolledCourses && Array.isArray(req.body.enrolledCourses)) {
        if (!student.enrolledCourses) student.enrolledCourses = [];
        for (const ec of req.body.enrolledCourses) {
          const courseKey = (ec.courseName || '').toLowerCase().trim();
          const exists = student.enrolledCourses.some(
            existing => (existing.courseName || '').toLowerCase().trim() === courseKey
          );
          if (!exists) {
            student.enrolledCourses.push(ec);
          }
        }
      }

      const savedStudent = await student.save();

      // Ensure User record exists
      let user = await User.findOne({ email: emailRegex });
      if (!user && password) {
        user = new User({
          email: savedStudent.email,
          password: password,
          role: 'student',
          profileId: savedStudent._id
        });
        await user.save();
      } else if (user && !user.profileId) {
        user.profileId = savedStudent._id;
        await user.save();
      }

      // Update batch enrollment if applicable
      if (savedStudent.approvalStatus !== 'PENDING' && (savedStudent.batchId || savedStudent.batch)) {
        const query = savedStudent.batchId ? { _id: savedStudent.batchId } : { batchName: savedStudent.batch };
        await Batch.findOneAndUpdate(
          query,
          { $addToSet: { students: savedStudent._id } }
        );
        const b = await Batch.findOne(query);
        if (b) {
          b.enrolledStudents = b.students.length;
          await b.save();
        }
      }

      return res.status(200).json(savedStudent);
    }

    // New Student creation
    if (!password) {
      return res.status(400).json({ message: 'Password is required for new student creation.' });
    }

    const userExists = await User.findOne({ email: emailRegex });
    if (userExists) {
      return res.status(400).json({ message: 'A user already exists with this email address.' });
    }

    const newStudent = new Student(req.body);
    const savedStudent = await newStudent.save();

    // Create User record linked to Student
    const newUser = new User({
      email: savedStudent.email,
      password: password,
      role: 'student',
      profileId: savedStudent._id
    });
    await newUser.save();

    // Increment students count in Batch when student is enrolled in a batch (and approved!)
    if (savedStudent.approvalStatus !== 'PENDING' && (savedStudent.batchId || savedStudent.batch)) {
      const query = savedStudent.batchId ? { _id: savedStudent.batchId } : { batchName: savedStudent.batch };
      await Batch.findOneAndUpdate(
        query,
        { 
          $addToSet: { students: savedStudent._id }
        }
      );
      const b = await Batch.findOne(query);
      if (b) {
        b.enrolledStudents = b.students.length;
        await b.save();
      }
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

    const wasPending = oldStudent.approvalStatus === 'PENDING';
    const isNowApproved = req.body.approvalStatus === 'APPROVED';

    const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    
    // If the student transitioned from PENDING to APPROVED, enroll them in their batch
    if (wasPending && isNowApproved) {
      const batchId = updatedStudent.batchId || updatedStudent.batch;
      if (batchId) {
        const query = mongoose.Types.ObjectId.isValid(batchId) ? { _id: batchId } : { batchName: batchId };
        await Batch.findOneAndUpdate(
          query,
          { 
            $inc: { enrolledStudents: 1 },
            $push: { students: updatedStudent._id }
          }
        );
      }
    } else if (updatedStudent.approvalStatus === 'APPROVED') {
      // If approved, update batch enrollment counts if batch changed
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
    }

    if (updatedStudent.isProfileComplete) {
      await User.findOneAndUpdate(
        { $or: [{ profileId: updatedStudent._id }, { email: updatedStudent.email }] },
        { isProfileComplete: true }
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
    
    await User.deleteMany({ profileId: student._id });
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET effective batch of student
router.get('/:id/effective-batch', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('batchId', 'batchName instructor')
      .populate('courseId', 'courseName');

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Find active temporary transfer
    const activeTransfer = await TemporaryBatchTransfer.findOne({
      studentId: student._id,
      status: 'active'
    })
      .populate('temporaryBatchId', 'batchName instructor')
      .populate('courseId', 'courseName');

    if (activeTransfer && activeTransfer.temporaryBatchId) {
      return res.json({
        isTransferred: true,
        effectiveBatchId: activeTransfer.temporaryBatchId._id,
        effectiveBatchName: activeTransfer.temporaryBatchId.batchName,
        effectiveCourseId: activeTransfer.courseId?._id || activeTransfer.courseId,
        effectiveCourseName: activeTransfer.courseId?.courseName || 'Transferred Course',
        instructor: activeTransfer.temporaryBatchId.instructor || student.teacher,
        originalBatchId: student.batchId?._id || student.batchId,
        originalBatchName: student.batchId?.batchName || student.batch,
        originalCourseId: student.courseId?._id || student.courseId,
        originalCourseName: student.courseId?.courseName || student.course,
        transferDetails: activeTransfer
      });
    }

    return res.json({
      isTransferred: false,
      effectiveBatchId: student.batchId?._id || student.batchId,
      effectiveBatchName: student.batchId?.batchName || student.batch,
      effectiveCourseId: student.courseId?._id || student.courseId,
      effectiveCourseName: student.courseId?.courseName || student.course,
      instructor: student.teacher,
      originalBatchId: student.batchId?._id || student.batchId,
      originalBatchName: student.batchId?.batchName || student.batch,
      originalCourseId: student.courseId?._id || student.courseId,
      originalCourseName: student.courseId?.courseName || student.course
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET students whose effective batch today is batchId
router.get('/effective-batch/:batchId', async (req, res) => {
  try {
    const { batchId } = req.params;

    // 1. Find all active transfers TO this batch today
    const transfersTo = await TemporaryBatchTransfer.find({
      temporaryBatchId: batchId,
      status: 'active'
    });
    const transferredInStudentIds = transfersTo.map(t => t.studentId);

    // 2. Find all active transfers AWAY from this batch today
    const transfersAway = await TemporaryBatchTransfer.find({
      originalBatchId: batchId,
      status: 'active'
    });
    const transferredOutStudentIds = transfersAway.map(t => t.studentId.toString());

    // 3. Find students enrolled in this batch who are NOT transferred away
    const enrolledStudents = await Student.find({
      batchId,
      _id: { $nin: transferredOutStudentIds }
    });

    // 4. Find the students who are transferred in
    const transferredInStudents = await Student.find({
      _id: { $in: transferredInStudentIds }
    });

    // Combine them, ensuring no duplicates
    const combinedStudents = [...enrolledStudents];
    const combinedIds = new Set(combinedStudents.map(s => s._id.toString()));

    transferredInStudents.forEach(student => {
      if (!combinedIds.has(student._id.toString())) {
        combinedStudents.push(student);
      }
    });

    res.json(combinedStudents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
