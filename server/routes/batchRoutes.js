import express from 'express';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import Student from '../models/Student.js';

const router = express.Router();

const calculateBatchStatus = (batch) => {
  if (batch.isZoomActive === false) {
    return 'UPCOMING';
  }
  if (!batch.startDate || !batch.endDate) return batch.status || 'UPCOMING';
  const now = new Date();
  const start = new Date(batch.startDate);
  const end = new Date(batch.endDate);
  
  // Need to compare start of days to avoid time issues
  now.setHours(0, 0, 0, 0);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (now < start) return 'UPCOMING';
  if (now > end) return 'COMPLETED';
  return batch.status || 'ACTIVE';
};

// GET all batches
router.get('/', async (req, res) => {
  try {
    let batches = await Batch.find().sort({ createdAt: -1 }).populate('courseId').lean();
    batches = batches.map(b => ({ ...b, status: calculateBatchStatus(b) }));
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET batches by course ID
router.get('/course/:courseId', async (req, res) => {
  try {
    let batches = await Batch.find({ courseId: req.params.courseId }).sort({ createdAt: -1 }).lean();
    batches = batches.map(b => ({ ...b, status: calculateBatchStatus(b) }));
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single batch by ID
router.get('/:id', async (req, res) => {
  try {
    let batch = await Batch.findById(req.params.id).populate('courseId').lean();
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    batch.status = calculateBatchStatus(batch);
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new batch
router.post('/', async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    const savedBatch = await newBatch.save();
    
    // Also push to course if courseId provided
    if (savedBatch.courseId) {
      await Course.findByIdAndUpdate(savedBatch.courseId, {
        $push: { batches: savedBatch._id }
      });
    }

    res.status(201).json(savedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update batch by ID
router.put('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }

    Object.assign(batch, req.body);
    const updatedBatch = await batch.save();
    
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE batch by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);
    if (!deletedBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    if (deletedBatch.courseId) {
      await Course.findByIdAndUpdate(deletedBatch.courseId, {
        $pull: { batches: deletedBatch._id }
      });
    }

    res.json({ message: 'Batch deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST add assignment to batch
router.post('/:id/assignments', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    batch.assignments.push({ title: req.body.title });
    const updatedBatch = await batch.save();
    res.status(201).json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE assignment from batch
router.delete('/:id/assignments/:assignmentId', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    batch.assignments = batch.assignments.filter(
      a => a._id.toString() !== req.params.assignmentId
    );
    const updatedBatch = await batch.save();
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET all assignments for batches of a specific course
router.get('/course/:courseId/assignments', async (req, res) => {
  try {
    const batches = await Batch.find({ courseId: req.params.courseId }).populate('courseId').lean();
    const assignments = [];
    for (const batch of batches) {
      if (batch.assignments && batch.assignments.length > 0) {
        const resolvedCourseName = batch.courseId?.courseName || batch.courseName || '';
        for (const a of batch.assignments) {
          assignments.push({
            _id: a._id,
            title: a.title,
            createdAt: a.createdAt,
            batchId: batch._id,
            batchName: batch.batchName,
            batchCode: batch.batchCode,
            courseName: resolvedCourseName
          });
        }
      }
    }
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST mark attendance for a student
router.post('/:id/attendance', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    
    if (!batch.attendanceEnabled) {
      return res.status(403).json({ message: 'Attendance is not currently enabled for this batch' });
    }

    const { studentId } = req.body;
    if (!studentId) {
      return res.status(400).json({ message: 'Student ID is required' });
    }

    // Check if attendance already marked for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alreadyMarked = batch.attendanceRecords.some(record => {
      const recordDate = new Date(record.date);
      recordDate.setHours(0, 0, 0, 0);
      return recordDate.getTime() === today.getTime() && record.studentId.toString() === studentId;
    });

    if (alreadyMarked) {
      return res.status(400).json({ message: 'Attendance already marked for today' });
    }

    batch.attendanceRecords.push({
      date: new Date(),
      studentId
    });

    const updatedBatch = await batch.save();

    // Update the student model as well
    const student = await Student.findById(studentId);
    if (student) {
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      student.attendanceRecords.push({
        date: formattedDate,
        status: 'present',
        activity: batch.courseName || (batch.courseId ? batch.courseId.courseName : 'Class')
      });
      
      const totalRecords = student.attendanceRecords.length;
      const presentRecords = student.attendanceRecords.filter(r => r.status === 'present').length;
      student.attendanceRate = Math.round((presentRecords / totalRecords) * 100);

      await student.save();
    }

    res.status(201).json({ message: 'Attendance marked successfully', updatedBatch });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
