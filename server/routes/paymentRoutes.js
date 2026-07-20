import express from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Notification from '../models/Notification.js';

const router = express.Router();

let razorpayInstance = null;
const getRazorpay = () => {
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
      key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret'
    });
  }
  return razorpayInstance;
};

// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new payment
router.post('/', async (req, res) => {
  try {
    const newPayment = new Payment(req.body);
    const savedPayment = await newPayment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET Razorpay key ID
router.get('/razorpay-key', (req, res) => {
  res.json({ keyId: process.env.RAZORPAY_KEY_ID || '' });
});

// POST Razorpay create order
router.post('/razorpay-order', async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    const options = {
      amount: Math.round(amount * 100), // convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`
    };

    const order = await getRazorpay().orders.create(options);
    res.json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    const errorMsg = error.error?.description || error.description || error.message || 'Unknown Razorpay error';
    res.status(500).json({ message: errorMsg });
  }
});

// POST Razorpay verify payment
router.post('/razorpay-verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      studentId,
      newEnrolledCourse,
      updatePayload,
      paymentDetails
    } = req.body;

    // 1. Verify the signature
    const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret');
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature !== razorpay_signature) {
      console.error('Razorpay signature verification failed');
      return res.status(400).json({ message: 'Payment verification failed. Invalid signature.' });
    }

    // 2. Save payment record in DB
    const newPayment = new Payment({
      invoiceNo: paymentDetails.invoiceNo,
      studentName: paymentDetails.studentName,
      avatar: paymentDetails.avatar,
      course: paymentDetails.course,
      amount: paymentDetails.amount,
      mode: paymentDetails.mode || 'UPI',
      status: 'Successful'
    });
    await newPayment.save();

    // 3. Update student record
    let student = null;
    if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
      student = await Student.findById(studentId);
    }

    if (!student && paymentDetails && paymentDetails.email) {
      student = await Student.findOne({ email: new RegExp('^' + paymentDetails.email.trim() + '$', 'i') });
    }

    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Add or update course in enrolledCourses list to avoid duplicates
    if (!student.enrolledCourses) student.enrolledCourses = [];
    if (newEnrolledCourse) {
      const existingIndex = student.enrolledCourses.findIndex(ec => {
        if (newEnrolledCourse.courseId && ec.courseId === newEnrolledCourse.courseId) return true;
        if (newEnrolledCourse.courseName && (ec.courseName || '').toLowerCase().trim() === (newEnrolledCourse.courseName || '').toLowerCase().trim()) return true;
        return false;
      });

      if (existingIndex >= 0) {
        Object.assign(student.enrolledCourses[existingIndex], newEnrolledCourse);
      } else {
        student.enrolledCourses.push(newEnrolledCourse);
      }
    }

    // Update student's top-level properties
    if (updatePayload) {
      student.feeStatus = 'PAID';
      if (updatePayload.batchId) student.batchId = updatePayload.batchId;
      if (updatePayload.batch) student.batch = updatePayload.batch;
      if (updatePayload.courseId) student.courseId = updatePayload.courseId;
      if (updatePayload.course) student.course = updatePayload.course;
      if (updatePayload.teacher) student.teacher = updatePayload.teacher;
      if (updatePayload.schedule) student.schedule = updatePayload.schedule;
    }
    await student.save();

    // 4. Update the Batch capacity/students list
    if (updatePayload && updatePayload.batchId) {
      await Batch.findByIdAndUpdate(updatePayload.batchId, {
        $addToSet: { students: student._id }
      });
      const updatedBatch = await Batch.findById(updatePayload.batchId);
      if (updatedBatch) {
        updatedBatch.enrolledStudents = updatedBatch.students.length;
        await updatedBatch.save();
      }
    }

    // 5. Create a notification in the DB for the Admin and Teachers
    const isBatchPurchase = !!(updatePayload && updatePayload.batchId);
    const newNotification = new Notification({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      message: `Student ${student.name} successfully purchased ${paymentDetails.course} (Amount: ${paymentDetails.amount}). Invoice No: ${paymentDetails.invoiceNo}`,
      notificationType: isBatchPurchase ? 'batch_purchase' : 'course_purchase',
      purchaseAmount: paymentDetails.amount,
      courseName: updatePayload?.course || paymentDetails.course
    });
    await newNotification.save();

    res.status(200).json({ success: true, message: 'Payment verified and enrollment updated successfully.' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;
