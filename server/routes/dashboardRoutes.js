import express from 'express';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import Payment from '../models/Payment.js';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    // 1. Student Stats
    const totalStudents = await Student.countDocuments();
    const activeStudents = await Student.countDocuments({ feeStatus: 'PAID' }); // arbitrary metric for active

    // 2. Financial Stats
    const successfulPayments = await Payment.find({ status: 'Successful' });
    const pendingPayments = await Payment.find({ status: 'Pending' });

    const monthlyRevenue = successfulPayments.reduce((sum, p) => {
      // Assuming amount is string like "₹120.00"
      const num = parseFloat(p.amount.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + num;
    }, 0);

    const pendingFees = pendingPayments.reduce((sum, p) => {
      const num = parseFloat(p.amount.replace(/[^0-9.-]+/g, '')) || 0;
      return sum + num;
    }, 0);

    // 3. Course & Batch Stats
    const totalCourses = await Course.countDocuments();
    const activeCourses = await Course.countDocuments({ status: 'Active' });
    const totalBatches = await Batch.countDocuments();
    const activeBatches = await Batch.countDocuments({ status: 'ACTIVE' });
    const upcomingBatches = await Batch.countDocuments({ status: 'UPCOMING' });
    const completedBatches = await Batch.countDocuments({ status: 'COMPLETED' });

    // Calculate Available Seats
    const batches = await Batch.find();
    const availableSeats = batches.reduce((sum, b) => sum + (b.availableSeats || 0), 0);

    // 4. Teachers count
    const uniqueInstructors = new Set(batches.map(b => b.instructor).filter(Boolean));
    const teachersCount = uniqueInstructors.size;

    // We can also fetch recent activities, but returning basic stats first
    res.json({
      totalStudents,
      activeStudents,
      monthlyRevenue,
      pendingFees,
      totalCourses,
      activeCourses,
      totalBatches,
      activeBatches,
      upcomingBatches,
      completedBatches,
      availableSeats,
      teachersCount
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
