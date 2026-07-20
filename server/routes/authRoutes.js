import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
const router = express.Router();

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

// @desc    Register a new student user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
  try {
    const { fullName, phoneNumber, email, password } = req.body;

    const emailRegex = new RegExp('^' + email.trim() + '$', 'i');
    const userExists = await User.findOne({ email: emailRegex });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 1. Find or Create Student record
    let student = await Student.findOne({ email: emailRegex });

    if (!student) {
      student = new Student({
        name: fullName || 'Student User',
        email: email,
        phone: phoneNumber || '',
        joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        admissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        feeStatus: 'PENDING',
        attendanceRate: 100,
        avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
        enrolledCourses: [],
        attendanceRecords: [],
        assignments: [],
        leaveRequests: []
      });
      await student.save();
    } else if (fullName && student.name === 'Student User') {
      student.name = fullName;
      if (phoneNumber) student.phone = phoneNumber;
      await student.save();
    }

    // 2. Create User record linked to Student
    const user = new User({
      email,
      password,
      role: 'student',
      profileId: student._id
    });
    await user.save();

    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profileId: student._id,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    let user = await User.findOne({ email });

    // If user does not exist, register them as a student on the fly
    if (!user) {
      user = await User.create({
        email,
        password,
        role: 'student'
      });
    }

    if (user && (await user.matchPassword(password))) {
      let name = '';
      if (user.role === 'teacher' && user.profileId) {
        const teacher = await Teacher.findById(user.profileId);
        if (teacher) name = teacher.name;
      } else if (user.role === 'student' && user.profileId) {
        const student = await Student.findById(user.profileId);
        if (student) name = student.name;
      } else {
        name = user.role === 'admin' ? 'Admin User' : 'Unknown';
      }

      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
        name: name,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

