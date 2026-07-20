import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
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

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 1024 * 1024 } // limit file size to 1MB
});

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
    
    // Check if email already exists in User collection
    const userExists = await User.findOne({ email: teacherData.email });
    if (userExists) {
      return res.status(400).json({ message: 'A user with this email already exists' });
    }

    const newTeacher = new Teacher(teacherData);
    const savedTeacher = await newTeacher.save();

    // Create the associated User account
    const password = req.body.password || 'teacher123';
    await User.create({
      email: savedTeacher.email,
      password: password,
      role: 'teacher',
      profileId: savedTeacher._id
    });

    res.status(201).json(savedTeacher);
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'A teacher with this email already exists.' });
    } else {
      res.status(400).json({ message: error.message });
    }
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

    // Update corresponding User email if it has changed
    await User.findOneAndUpdate(
      { profileId: updatedTeacher._id },
      { email: updatedTeacher.email }
    );

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

    // Delete corresponding User account
    await User.findOneAndDelete({ profileId: deletedTeacher._id });

    res.json({ message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
