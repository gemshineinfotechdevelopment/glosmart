import express from 'express';
import AttendanceSession from '../models/AttendanceSession.js';
import AttendanceRecord from '../models/AttendanceRecord.js';
import Batch from '../models/Batch.js';
import Student from '../models/Student.js';

const router = express.Router();

// Get all attendance sessions
router.get('/sessions', async (req, res) => {
  try {
    const { role, userId, name } = req.query;
    let query = {};
    
    // If teacher, only show sessions for their assigned batches
    if (role === 'teacher') {
      const teacherBatches = await Batch.find({ instructor: name });
      const batchIds = teacherBatches.map(b => b._id);
      query = { batchId: { $in: batchIds } };
    }

    const sessions = await AttendanceSession.find(query)
      .populate('batchId', 'batchName courseName')
      .sort({ enabledAt: -1 })
      .lean();

    // Fetch total students attended for each session
    for (let session of sessions) {
      const records = await AttendanceRecord.countDocuments({ sessionId: session._id });
      session.totalAttended = records;
    }

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new attendance session (Enable attendance)
router.post('/sessions', async (req, res) => {
  try {
    const { batchId, enabledByUserId, enabledByName, enabledByRole } = req.body;
    
    // Check if there's already an active session for this batch today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSession = await AttendanceSession.findOne({
      batchId,
      status: 'Enabled',
      enabledAt: { $gte: today }
    });

    if (existingSession) {
      return res.status(400).json({ message: 'An active attendance session already exists for this batch today.' });
    }

    const session = new AttendanceSession({
      batchId,
      enabledByUserId,
      enabledByName,
      enabledByRole,
      status: 'Enabled'
    });

    const savedSession = await session.save();
    res.status(201).json(savedSession);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get active session for a batch
router.get('/sessions/batch/:batchId/active', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const session = await AttendanceSession.findOne({
      batchId: req.params.batchId,
      status: 'Enabled',
      enabledAt: { $gte: today }
    });
    res.json(session || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Disable an attendance session
router.put('/sessions/:id/disable', async (req, res) => {
  try {
    const session = await AttendanceSession.findByIdAndUpdate(
      req.params.id,
      { status: 'Disabled' },
      { new: true }
    );
    res.json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get active sessions for a student
router.get('/sessions/active/:studentId', async (req, res) => {
  try {
    const student = await Student.findById(req.params.studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }



    const enrolledBatchIds = student.enrolledCourses.map(c => c.batchId).filter(Boolean);
    if (student.batchId) {
       enrolledBatchIds.push(student.batchId);
    }

    const activeSessions = await AttendanceSession.find({
      batchId: { $in: enrolledBatchIds },
      status: 'Enabled'
    }).populate('batchId', 'batchName courseName').lean();

    const markedRecords = await AttendanceRecord.find({
      studentId: student._id,
      sessionId: { $in: activeSessions.map(s => s._id) }
    });

    const markedSessionIds = markedRecords.map(r => r.sessionId.toString());
    const availableSessions = activeSessions.filter(s => !markedSessionIds.includes(s._id.toString()));

    res.json(availableSessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark student attendance
router.post('/records', async (req, res) => {
  try {
    const { sessionId, studentId, batchId } = req.body;
    
    // Prevent duplicate
    const existing = await AttendanceRecord.findOne({ sessionId, studentId });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this session.' });
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    let hours = today.getHours();
    const minutes = String(today.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;

    const record = new AttendanceRecord({
      sessionId,
      studentId,
      batchId,
      attendanceDate: `${year}-${month}-${day}`,
      attendanceTime: `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`,
      status: 'Present'
    });

    await record.save();

    // Look up batch name
    const batchInfo = await Batch.findById(batchId);
    const activityName = batchInfo ? batchInfo.batchName : 'Class Session';

    // Sync to student document for UI
    await Student.findByIdAndUpdate(studentId, {
      $push: {
        attendanceRecords: {
          date: `${year}-${month}-${day}`,
          status: 'Present',
          duration: '1 hour',
          time: `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`,
          activity: activityName
        }
      }
    });

    res.status(201).json({ message: 'Attendance recorded successfully!' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get attendance history for a student
router.get('/records/student/:studentId', async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ studentId: req.params.studentId })
      .populate('batchId', 'batchName')
      .sort({ createdAt: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance records by session
router.get('/records/session/:sessionId', async (req, res) => {
  try {
    const records = await AttendanceRecord.find({ sessionId: req.params.sessionId })
      .populate('studentId', 'name email phone')
      .populate('batchId', 'batchName');
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const totalSessions = await AttendanceSession.countDocuments();
    const activeSessions = await AttendanceSession.countDocuments({ status: 'Enabled' });
    const totalStudentsAttended = await AttendanceRecord.countDocuments();
    
    // Aggregation by batch
    const recordsByBatch = await AttendanceRecord.aggregate([
      {
        $group: {
          _id: "$batchId",
          count: { $sum: 1 }
        }
      }
    ]);

    const batchStats = await Batch.populate(recordsByBatch, { path: "_id", select: "batchName" });
    
    res.json({
      totalSessions,
      activeSessions,
      totalStudentsAttended,
      batchStats: batchStats.map(b => ({ batchName: b._id?.batchName, count: b.count }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
