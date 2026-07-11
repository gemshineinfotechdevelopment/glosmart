import express from 'express';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';

const router = express.Router();

// GET all students
router.get('/', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.json(students);
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
    if (savedStudent.batch) {
      await Batch.findOneAndUpdate(
        { batchName: savedStudent.batch },
        { $inc: { students: 1 } }
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
    await Batch.updateMany({}, { students: 0 });
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
    if (req.body.batch && req.body.batch !== oldStudent.batch) {
      if (oldStudent.batch) {
        await Batch.findOneAndUpdate(
          { batchName: oldStudent.batch },
          { $inc: { students: -1 } }
        );
      }
      await Batch.findOneAndUpdate(
        { batchName: req.body.batch },
        { $inc: { students: 1 } }
      );
    }

    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
