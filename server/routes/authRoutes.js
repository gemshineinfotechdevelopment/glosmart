import express from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import User from '../models/User.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import logger from '../utils/logger.js';
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
    logger.info(`Signup attempt for email: ${email}`);

    const emailRegex = new RegExp('^' + email.trim() + '$', 'i');
    const userExists = await User.findOne({ email: emailRegex });

    if (userExists) {
      logger.warn(`Signup failed: User already exists for email: ${email}`);
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

    logger.info(`Signup successful for user: ${user._id} (${email})`);
    res.status(201).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profileId: student._id,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    logger.error(`Signup error for email: ${req.body.email}`, { error: error.message, stack: error.stack });
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
      logger.warn('Login failed: Missing email or password');
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    logger.info(`Login attempt for email: ${email}`);

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

      logger.info(`Login successful for user: ${user._id} (${email})`);
      res.json({
        _id: user._id,
        email: user.email,
        role: user.role,
        profileId: user.profileId,
        name: name,
        token: generateToken(user._id, user.role),
      });
    } else {
      logger.warn(`Login failed: Invalid credentials for email: ${email}`);
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    logger.error(`Login error for email: ${req.body.email}`, { error: error.message, stack: error.stack });
    res.status(500).json({ message: error.message });
  }
});

// @desc    Google Login & Signup
// @route   POST /api/auth/google
// @access  Public
router.post('/google', async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: 'Missing token' });

    const googleRes = await axios.get(`https://www.googleapis.com/oauth2/v3/userinfo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const { email, name, picture } = googleRes.data;

    let user = await User.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });

    // If user does not exist, register them as a student on the fly
    if (!user) {
      // Find or Create Student record
      let student = await Student.findOne({ email: new RegExp('^' + email.trim() + '$', 'i') });
      if (!student) {
        student = new Student({
          name: name || 'Student User',
          email: email,
          phone: '',
          joiningDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          admissionDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          feeStatus: 'PENDING',
          attendanceRate: 100,
          avatar: picture || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          enrolledCourses: [],
          attendanceRecords: [],
          assignments: [],
          leaveRequests: []
        });
        await student.save();
      }

      user = await User.create({
        email,
        password: Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8), // secure random dummy password
        role: 'student',
        profileId: student._id
      });
    }

    let userName = name;
    if (user.role === 'teacher' && user.profileId) {
      const teacher = await Teacher.findById(user.profileId);
      if (teacher) userName = teacher.name;
    } else if (user.role === 'student' && user.profileId) {
      const student = await Student.findById(user.profileId);
      if (student) userName = student.name;
    } else {
      userName = user.role === 'admin' ? 'Admin User' : (name || 'Unknown');
    }

    logger.info(`Google Login successful for user: ${user._id} (${email})`);
    res.json({
      _id: user._id,
      email: user.email,
      role: user.role,
      profileId: user.profileId,
      name: userName,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    logger.error(`Google Login error`, { error: error.message, stack: error.stack });
    res.status(500).json({ message: 'Google authentication failed' });
  }
});

export default router;
