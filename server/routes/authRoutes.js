import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Student from '../models/Student.js';

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

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // 1. Create Student record
    const student = new Student({
      name: fullName,
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
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
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

