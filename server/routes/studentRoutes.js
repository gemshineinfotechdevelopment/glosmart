import express from 'express';
import mongoose from 'mongoose';
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

export default router;
