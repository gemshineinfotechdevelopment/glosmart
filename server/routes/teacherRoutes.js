import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Teacher from '../models/Teacher.js';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'glosmart/teachers',
    allowedFormats: ['jpeg', 'png', 'jpg']
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// GET all teachers
router.get('/', async (req, res) => {
  try {
    const teachers = await Teacher.find().sort({ createdAt: -1 });
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new teacher
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const teacherData = { ...req.body };
    if (req.file) {
      teacherData.avatar = req.file.path;
    }
    const newTeacher = new Teacher(teacherData);
    const savedTeacher = await newTeacher.save();
    res.status(201).json(savedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update teacher
router.put('/:id', upload.single('image'), async (req, res) => {
  try {
    const teacherData = { ...req.body };
    if (req.file) {
      teacherData.avatar = req.file.path;
    }
    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id, 
      teacherData, 
      { new: true }
    );
    if (!updatedTeacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(updatedTeacher);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE teacher
router.delete('/:id', async (req, res) => {
  try {
    const deletedTeacher = await Teacher.findByIdAndDelete(req.params.id);
    if (!deletedTeacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
