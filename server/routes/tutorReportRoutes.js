import express from 'express';
import TutorReport from '../models/TutorReport.js';

const router = express.Router();

// GET all reports
router.get('/', async (req, res) => {
  try {
    const reports = await TutorReport.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new tutor report
router.post('/', async (req, res) => {
  try {
    const { teacherName, courseName, batchName, batchCode, zoomLink, activatedAt, deactivatedAt, description } = req.body;
    
    const start = activatedAt ? new Date(activatedAt) : new Date(Date.now() - 60 * 60 * 1000);
    const end = deactivatedAt ? new Date(deactivatedAt) : new Date();
    const durationMinutes = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60)));

    const newReport = new TutorReport({
      teacherName: teacherName || 'Tutor',
      courseName: courseName || 'Art Course',
      batchName: batchName || 'Batch Session',
      batchCode: batchCode || '',
      zoomLink: zoomLink || '',
      activatedAt: start,
      deactivatedAt: end,
      durationMinutes,
      description: description || 'No session description provided.'
    });

    const savedReport = await newReport.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
