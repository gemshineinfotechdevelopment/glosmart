import express from 'express';
import mongoose from 'mongoose';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Course from '../models/Course.js';
import TemporaryBatchTransfer from '../models/TemporaryBatchTransfer.js';
import BatchConversionHistory from '../models/BatchConversionHistory.js';
import AuditLog from '../models/AuditLog.js';
import Notification from '../models/Notification.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Helper to get effective student count in a batch on a given date
export const getBatchEffectiveStudentCount = async (batchId, checkDate = new Date()) => {
  const targetDate = new Date(checkDate);
  
  // Set to start of day for comparison
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Get students currently enrolled in this batch
  const enrolledStudents = await Student.find({ batchId });
  const enrolledStudentIds = enrolledStudents.map(s => s._id.toString());

  // 2. Find transfers AWAY from this batch active on checkDate
  const transfersAway = await TemporaryBatchTransfer.find({
    originalBatchId: batchId,
    status: { $in: ['active', 'scheduled'] },
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay }
  });
  const awayStudentIds = transfersAway.map(t => t.studentId.toString());

  // 3. Find transfers TO this batch active on checkDate
  const transfersTo = await TemporaryBatchTransfer.find({
    temporaryBatchId: batchId,
    status: { $in: ['active', 'scheduled'] },
    startDate: { $lte: endOfDay },
    endDate: { $gte: startOfDay }
  });
  const toStudentIds = transfersTo.map(t => t.studentId.toString());

  // Set of effective students
  const effectiveStudents = new Set();
  
  // Add enrolled students who are not transferred away
  enrolledStudentIds.forEach(id => {
    if (!awayStudentIds.includes(id)) {
      effectiveStudents.add(id);
    }
  });

  // Add students transferred in
  toStudentIds.forEach(id => {
    effectiveStudents.add(id);
  });

  return effectiveStudents.size;
};

// @route   POST /api/transfers
// @desc    Create a temporary batch transfer
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const {
      studentId,
      courseId,
      temporaryBatchId,
      startDate,
      endDate,
      reason,
      notes
    } = req.body;

    // Basic Validation
    if (!studentId || !courseId || !temporaryBatchId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const student = await Student.findById(studentId).session(session);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Verify target batch
    const targetBatch = await Batch.findById(temporaryBatchId).session(session);
    if (!targetBatch) {
      return res.status(404).json({ message: 'Target batch not found' });
    }

    if (targetBatch.status === 'COMPLETED' || targetBatch.status === 'INACTIVE') {
      return res.status(400).json({ message: 'Cannot transfer to a completed or inactive batch' });
    }

    // Verify course of the target batch
    const course = await Course.findById(targetBatch.courseId).session(session);
    if (!course) {
      return res.status(404).json({ message: 'Target batch course not found' });
    }

    const originalBatchId = student.batchId;
    if (!originalBatchId) {
      return res.status(400).json({ message: 'Student is not enrolled in any batch' });
    }

    if (originalBatchId.toString() === temporaryBatchId) {
      return res.status(400).json({ message: 'Transfer batch cannot be the same as the student\'s current batch' });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startOfDay = new Date(start);
    startOfDay.setHours(0, 0, 0, 0);

    if (startOfDay < today) {
      return res.status(400).json({ message: 'Start Date must be today or in the future' });
    }

    if (end <= start) {
      return res.status(400).json({ message: 'End Date must be greater than Start Date' });
    }

    // Check for overlapping active or scheduled temporary transfers for this student
    const overlap = await TemporaryBatchTransfer.findOne({
      studentId,
      status: { $in: ['scheduled', 'active'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).session(session);

    if (overlap) {
      return res.status(400).json({ message: 'Student already has another active or scheduled temporary transfer during this period.' });
    }

    // Check batch capacity dynamically for start date
    const targetCapacity = targetBatch.maxCapacity || 30;
    const currentSize = await getBatchEffectiveStudentCount(temporaryBatchId, start);
    if (currentSize >= targetCapacity) {
      return res.status(400).json({ message: `Batch capacity reached. Maximum capacity is ${targetCapacity}.` });
    }

    // Determine status (if starts today, make it active, else scheduled)
    const isStartsToday = startOfDay.getTime() === today.getTime();
    const status = isStartsToday ? 'active' : 'scheduled';
    const scheduled = !isStartsToday;
    const active = isStartsToday;

    const transfer = new TemporaryBatchTransfer({
      studentId,
      courseId: targetBatch.courseId,
      originalBatchId,
      temporaryBatchId,
      startDate: start,
      endDate: end,
      status,
      scheduled,
      active,
      completed: false,
      cancelled: false,
      reason: reason || '',
      notes: notes || '',
      createdBy: req.user._id
    });

    await transfer.save({ session });

    // Audit logging
    const adminName = req.user.email.split('@')[0]; // fallback to email prefix if name is missing
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId,
      studentName: student.name,
      oldBatchId: originalBatchId,
      oldBatchName: student.batch,
      newBatchId: temporaryBatchId,
      newBatchName: targetBatch.batchName,
      action: 'Temporary Transfer',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Store notification details
    const msg = `You have been temporarily shifted to ${targetBatch.batchName} from ${start.toLocaleDateString()} to ${end.toLocaleDateString()}.`;
    const notification = new Notification({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      message: msg,
      notificationType: 'batch_transfer',
      courseName: course.courseName
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Trigger Socket.io real-time event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', notification);
      io.emit('transfer_updated', { studentId, transfer });
    }

    res.status(201).json(transfer);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error creating transfer:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transfers
// @desc    Get all temporary batch transfers
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, studentId } = req.query;
    let query = {};
    if (status) query.status = status;
    if (studentId) query.studentId = studentId;

    const transfers = await TemporaryBatchTransfer.find(query)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'courseName courseCode')
      .populate('originalBatchId', 'batchName')
      .populate('temporaryBatchId', 'batchName')
      .sort({ createdAt: -1 });

    res.json(transfers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transfers/batch-conversions
// @desc    Get all batch conversions history
// @access  Private
router.get('/batch-conversions', protect, async (req, res) => {
  try {
    const filter = {};
    if (req.query.studentId) {
      // Validate studentId is a valid ObjectId before querying
      if (!mongoose.Types.ObjectId.isValid(req.query.studentId)) {
        return res.status(400).json({ message: 'Invalid Student ID format' });
      }
      filter.studentId = req.query.studentId;
    }

    const history = await BatchConversionHistory.find(filter)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'courseName courseCode')
      .populate('oldBatchId', 'batchName')
      .populate('newBatchId', 'batchName')
      .sort({ createdAt: -1 });

    res.json(history);
  } catch (error) {
    console.error('[GET /batch-conversions] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transfers/audit-logs
// @desc    Get audit logs for transfer module actions
// @access  Private/Admin
router.get('/audit-logs', protect, admin, async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .populate('studentId', 'name')
      .sort({ timestamp: -1 });
    res.json(logs);
  } catch (error) {
    console.error('[GET /audit-logs] Error:', error.message);
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/transfers/:id
// @desc    Get temporary batch transfer by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    // Guard against non-ObjectId path segments (e.g. 'batch-conversions', 'audit-logs')
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid transfer ID format' });
    }

    const transfer = await TemporaryBatchTransfer.findById(req.params.id)
      .populate('studentId', 'name email phone')
      .populate('courseId', 'courseName courseCode')
      .populate('originalBatchId', 'batchName')
      .populate('temporaryBatchId', 'batchName');

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }
    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/transfers/:id
// @desc    Update a scheduled transfer
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  try {
    const { temporaryBatchId, startDate, endDate, reason, notes } = req.body;
    const transfer = await TemporaryBatchTransfer.findById(req.params.id);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    if (transfer.status !== 'scheduled') {
      return res.status(400).json({ message: 'Only scheduled transfers can be edited. Active or completed transfers cannot be updated.' });
    }

    if (temporaryBatchId) {
      const targetBatch = await Batch.findById(temporaryBatchId);
      if (!targetBatch) {
        return res.status(404).json({ message: 'Target batch not found' });
      }
      if (targetBatch.status !== 'ACTIVE') {
        return res.status(400).json({ message: 'Target batch must be active' });
      }
      transfer.temporaryBatchId = temporaryBatchId;
    }

    if (startDate) {
      const start = new Date(startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        return res.status(400).json({ message: 'Start date must be today or in the future' });
      }
      transfer.startDate = start;
    }

    if (endDate) {
      const end = new Date(endDate);
      if (end <= transfer.startDate) {
        return res.status(400).json({ message: 'End date must be after start date' });
      }
      transfer.endDate = end;
    }

    if (reason !== undefined) transfer.reason = reason;
    if (notes !== undefined) transfer.notes = notes;

    await transfer.save();

    res.json(transfer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   DELETE /api/transfers/:id
// @desc    Permanently delete a temporary transfer record
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid transfer ID format' });
  }

  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await TemporaryBatchTransfer.findById(req.params.id).session(session);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    if (transfer.status === 'active') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        message: 'Cannot delete an active transfer. Please cancel it first before deleting.'
      });
    }

    // Load student + batch names for the audit log
    const student = await Student.findById(transfer.studentId).session(session);
    const temporaryBatch = await Batch.findById(transfer.temporaryBatchId).session(session);

    // Audit log
    const adminName = req.user.email.split('@')[0];
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId: transfer.studentId,
      studentName: student ? student.name : 'Unknown Student',
      oldBatchId: transfer.originalBatchId,
      newBatchId: transfer.temporaryBatchId,
      newBatchName: temporaryBatch ? temporaryBatch.batchName : 'Deleted Batch',
      action: 'Transfer Deleted',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Hard delete the transfer record
    await TemporaryBatchTransfer.findByIdAndDelete(req.params.id).session(session);

    await session.commitTransaction();
    session.endSession();

    // Notify via socket
    const io = req.app.get('socketio');
    if (io) {
      io.emit('transfer_updated', { studentId: transfer.studentId });
    }

    res.json({ message: 'Transfer record deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error deleting transfer:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transfers/cancel/:id
// @desc    Cancel a transfer
// @access  Private/Admin
router.post('/cancel/:id', protect, admin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await TemporaryBatchTransfer.findById(req.params.id).session(session);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    if (transfer.status === 'cancelled' || transfer.status === 'completed') {
      return res.status(400).json({ message: `Cannot cancel a transfer that is already ${transfer.status}` });
    }

    const oldStatus = transfer.status;
    transfer.status = 'cancelled';
    transfer.scheduled = false;
    transfer.active = false;
    transfer.completed = false;
    transfer.cancelled = true;

    await transfer.save({ session });

    // Load student and batch information for logs
    const student = await Student.findById(transfer.studentId).session(session);
    const targetBatch = await Batch.findById(transfer.temporaryBatchId).session(session);

    // Audit logging
    const adminName = req.user.email.split('@')[0];
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId: transfer.studentId,
      studentName: student ? student.name : 'Unknown Student',
      oldBatchId: transfer.originalBatchId,
      newBatchId: transfer.temporaryBatchId,
      newBatchName: targetBatch ? targetBatch.batchName : 'Cancelled Batch',
      action: 'Cancelled',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Notify student if transfer was active
    if (oldStatus === 'active' && student) {
      const notification = new Notification({
        name: student.name,
        email: student.email,
        phone: student.phone || '',
        message: `Your temporary transfer to ${targetBatch ? targetBatch.batchName : 'Evening Batch'} has been cancelled. You have returned to your original batch.`,
        notificationType: 'batch_transfer_cancelled'
      });
      await notification.save({ session });

      const io = req.app.get('socketio');
      if (io) {
        io.emit('notification', notification);
      }
    }

    await session.commitTransaction();
    session.endSession();

    // Socket.io updates
    const io = req.app.get('socketio');
    if (io) {
      io.emit('transfer_updated', { studentId: transfer.studentId, transfer });
    }

    res.json({ message: 'Transfer cancelled successfully', transfer });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error cancelling transfer:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/batch-conversions
// @desc    Convert a student's batch permanently
// @access  Private/Admin
router.post('/batch-conversions', protect, admin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { studentId, courseId, newBatchId, reason, effectiveDate, cancelFutureTransfers } = req.body;

    if (!studentId || !courseId || !newBatchId) {
      return res.status(400).json({ message: 'Student ID, Course ID, and New Batch ID are required' });
    }

    const student = await Student.findById(studentId).session(session);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const newBatch = await Batch.findById(newBatchId).session(session);
    if (!newBatch) {
      return res.status(404).json({ message: 'New batch not found' });
    }

    if (newBatch.status === 'COMPLETED' || newBatch.status === 'INACTIVE') {
      return res.status(400).json({ message: 'Cannot convert to a completed or inactive batch' });
    }

    const oldBatchId = student.batchId;
    if (oldBatchId && oldBatchId.toString() === newBatchId) {
      return res.status(400).json({ message: 'New batch cannot be the same as current batch' });
    }

    // Capacity Check
    const maxCapacity = newBatch.maxCapacity || 30;
    const currentSize = await getBatchEffectiveStudentCount(newBatchId, new Date());
    if (currentSize >= maxCapacity) {
      return res.status(400).json({ message: `Batch capacity reached. Maximum capacity is ${maxCapacity}.` });
    }

    const effDate = effectiveDate ? new Date(effectiveDate) : new Date();

    // Record history (log new batch's courseId)
    const conversion = new BatchConversionHistory({
      studentId,
      courseId: newBatch.courseId,
      oldBatchId,
      newBatchId,
      effectiveDate: effDate,
      reason: reason || '',
      convertedBy: req.user._id
    });
    await conversion.save({ session });

    // Update Student model
    const oldBatchName = student.batch;
    student.batchId = newBatchId;
    student.batch = newBatch.batchName;
    student.schedule = newBatch.batchName;
    student.teacher = newBatch.instructor || 'TBD';

    // Handle course change on student document
    let targetCourseId = courseId;
    if (newBatch.courseId.toString() !== student.courseId?.toString()) {
      const newCourse = await Course.findById(newBatch.courseId).session(session);
      if (newCourse) {
        student.courseId = newBatch.courseId;
        student.course = newCourse.courseName;
        targetCourseId = newBatch.courseId.toString();

        const courseIndex = student.enrolledCourses.findIndex(
          c => c.courseId === targetCourseId || (c.courseId && c.courseId.toString() === targetCourseId)
        );
        if (courseIndex !== -1) {
          student.enrolledCourses[courseIndex].batchId = newBatchId;
          student.enrolledCourses[courseIndex].batchName = newBatch.batchName;
          student.enrolledCourses[courseIndex].instructor = newBatch.instructor || 'TBD';
        } else if (student.enrolledCourses.length > 0) {
          student.enrolledCourses[0].courseId = targetCourseId;
          student.enrolledCourses[0].courseName = newCourse.courseName;
          student.enrolledCourses[0].batchId = newBatchId;
          student.enrolledCourses[0].batchName = newBatch.batchName;
          student.enrolledCourses[0].instructor = newBatch.instructor || 'TBD';
        }
      }
    } else {
      const enrolledCourseIndex = student.enrolledCourses.findIndex(
        c => c.courseId === courseId || (c.courseId && c.courseId.toString() === courseId)
      );
      if (enrolledCourseIndex !== -1) {
        student.enrolledCourses[enrolledCourseIndex].batchId = newBatchId;
        student.enrolledCourses[enrolledCourseIndex].batchName = newBatch.batchName;
        student.enrolledCourses[enrolledCourseIndex].instructor = newBatch.instructor || 'TBD';
      }
    }
    await student.save({ session });

    // Handle future scheduled transfers if requested or prompt
    const futureTransfers = await TemporaryBatchTransfer.find({
      studentId,
      status: 'scheduled',
      startDate: { $gt: new Date() }
    }).session(session);

    if (futureTransfers.length > 0) {
      if (cancelFutureTransfers) {
        // Cancel all scheduled future transfers
        for (let t of futureTransfers) {
          t.status = 'cancelled';
          t.scheduled = false;
          t.cancelled = true;
          await t.save({ session });

          // Audit log for each cancel
          const auditCancel = new AuditLog({
            adminName: req.user.name || req.user.email,
            adminId: req.user._id,
            studentId,
            studentName: student.name,
            oldBatchId: t.originalBatchId,
            newBatchId: t.temporaryBatchId,
            action: 'Cancelled',
            ipAddress: req.ip || ''
          });
          await auditCancel.save({ session });
        }
      } else {
        // If not automatically cancelling, return status telling frontend that future transfers exist
        // So the frontend can prompt the admin to cancel them.
        await session.abortTransaction();
        session.endSession();
        return res.status(200).json({
          status: 'PROMPT_FUTURE_TRANSFERS',
          futureTransfersCount: futureTransfers.length,
          message: 'Student has future scheduled transfers. Please confirm if you want to cancel or keep them.'
        });
      }
    }

    // Audit Log for conversion
    const adminName = req.user.email.split('@')[0];
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId,
      studentName: student.name,
      oldBatchId,
      oldBatchName,
      newBatchId,
      newBatchName: newBatch.batchName,
      action: 'Permanent Conversion',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Store notification
    const notification = new Notification({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      message: `Your batch enrollment has been permanently changed to ${newBatch.batchName} starting from ${effDate.toLocaleDateString()}.`,
      notificationType: 'batch_conversion'
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Trigger socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', notification);
      io.emit('student_converted', { studentId, oldBatchId, newBatchId });
    }

    res.status(201).json({ message: 'Batch permanently converted successfully', conversion });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error permanently converting batch:', error);
    res.status(500).json({ message: error.message });
  }
});



// @route   POST /api/transfers/run-cron
// @desc    Manually trigger transfer activation and reversion logic
// @access  Private/Admin
router.post('/run-cron', protect, admin, async (req, res) => {
  try {
    // We will import and call the cron runner function
    const { runTransferCronJob } = await import('../cron/batchCron.js');
    const result = await runTransferCronJob(req.app.get('socketio'));
    res.json({ message: 'Cron job manual run completed successfully', result });
  } catch (error) {
    console.error('Error running manual cron:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transfers/redo-transfer/:id
// @desc    Redo a completed/cancelled temporary transfer — revert student back to originalBatch
// @access  Private/Admin
router.post('/redo-transfer/:id', protect, admin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const transfer = await TemporaryBatchTransfer.findById(req.params.id)
      .populate('studentId')
      .populate('originalBatchId')
      .populate('courseId')
      .session(session);

    if (!transfer) {
      return res.status(404).json({ message: 'Transfer record not found' });
    }

    if (transfer.status !== 'completed' && transfer.status !== 'cancelled') {
      return res.status(400).json({ message: 'Only completed or cancelled transfers can be redone' });
    }

    const student = await Student.findById(transfer.studentId._id || transfer.studentId).session(session);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const originalBatch = await Batch.findById(transfer.originalBatchId._id || transfer.originalBatchId).session(session);
    if (!originalBatch) {
      return res.status(404).json({ message: 'Original batch not found' });
    }

    if (originalBatch.status === 'COMPLETED' || originalBatch.status === 'INACTIVE') {
      return res.status(400).json({ message: 'Original batch is no longer active' });
    }

    const oldBatchName = student.batch;
    const oldBatchId = student.batchId;

    // Revert student back to original batch
    student.batchId = originalBatch._id;
    student.batch = originalBatch.batchName;
    student.schedule = originalBatch.batchName;
    student.teacher = originalBatch.instructor || 'TBD';

    // Update enrolled courses
    const courseIdStr = (transfer.courseId?._id || transfer.courseId)?.toString();
    const batchIdStr = originalBatch._id.toString();
    const enrolledIdx = student.enrolledCourses.findIndex(
      c => c.courseId === courseIdStr || (c.courseId && c.courseId.toString() === courseIdStr)
    );
    if (enrolledIdx !== -1) {
      student.enrolledCourses[enrolledIdx].batchId = batchIdStr;
      student.enrolledCourses[enrolledIdx].batchName = originalBatch.batchName;
      student.enrolledCourses[enrolledIdx].instructor = originalBatch.instructor || 'TBD';
    } else if (student.enrolledCourses.length > 0) {
      student.enrolledCourses[0].batchId = batchIdStr;
      student.enrolledCourses[0].batchName = originalBatch.batchName;
      student.enrolledCourses[0].instructor = originalBatch.instructor || 'TBD';
    }
    await student.save({ session });

    // Audit log
    const adminName = req.user.email.split('@')[0];
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId: student._id,
      studentName: student.name,
      oldBatchId,
      oldBatchName,
      newBatchId: originalBatch._id,
      newBatchName: originalBatch.batchName,
      action: 'Redo Transfer (Reverted)',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Notification
    const notification = new Notification({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      message: `Your batch has been reverted back to ${originalBatch.batchName}.`,
      notificationType: 'batch_transfer'
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', notification);
      io.emit('transfer_updated', { studentId: student._id });
    }

    res.json({ message: `Student reverted to original batch: ${originalBatch.batchName}`, student });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error redoing transfer:', error);
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/transfers/redo-conversion/:id
// @desc    Redo a batch conversion — revert student back to oldBatch
// @access  Private/Admin
router.post('/redo-conversion/:id', protect, admin, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const conversion = await BatchConversionHistory.findById(req.params.id)
      .populate('studentId')
      .populate('oldBatchId')
      .populate('courseId')
      .session(session);

    if (!conversion) {
      return res.status(404).json({ message: 'Conversion record not found' });
    }

    const student = await Student.findById(conversion.studentId._id || conversion.studentId).session(session);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const oldBatch = await Batch.findById(conversion.oldBatchId._id || conversion.oldBatchId).session(session);
    if (!oldBatch) {
      return res.status(404).json({ message: 'Previous batch not found' });
    }

    if (oldBatch.status === 'COMPLETED' || oldBatch.status === 'INACTIVE') {
      return res.status(400).json({ message: 'Previous batch is no longer active and cannot be restored' });
    }

    const currentBatchName = student.batch;
    const currentBatchId = student.batchId;

    // Revert student back to old batch
    student.batchId = oldBatch._id;
    student.batch = oldBatch.batchName;
    student.schedule = oldBatch.batchName;
    student.teacher = oldBatch.instructor || 'TBD';

    // Update enrolled courses
    const courseIdStr = (conversion.courseId?._id || conversion.courseId)?.toString();
    const oldBatchIdStr = oldBatch._id.toString();
    const enrolledIdx = student.enrolledCourses.findIndex(
      c => c.courseId === courseIdStr || (c.courseId && c.courseId.toString() === courseIdStr)
    );
    if (enrolledIdx !== -1) {
      student.enrolledCourses[enrolledIdx].batchId = oldBatchIdStr;
      student.enrolledCourses[enrolledIdx].batchName = oldBatch.batchName;
      student.enrolledCourses[enrolledIdx].instructor = oldBatch.instructor || 'TBD';
    } else if (student.enrolledCourses.length > 0) {
      student.enrolledCourses[0].batchId = oldBatchIdStr;
      student.enrolledCourses[0].batchName = oldBatch.batchName;
      student.enrolledCourses[0].instructor = oldBatch.instructor || 'TBD';
    }
    await student.save({ session });

    // Audit log
    const adminName = req.user.email.split('@')[0];
    const auditLog = new AuditLog({
      adminName: req.user.name || adminName,
      adminId: req.user._id,
      studentId: student._id,
      studentName: student.name,
      oldBatchId: currentBatchId,
      oldBatchName: currentBatchName,
      newBatchId: oldBatch._id,
      newBatchName: oldBatch.batchName,
      action: 'Redo Conversion (Reverted)',
      ipAddress: req.ip || ''
    });
    await auditLog.save({ session });

    // Notification
    const notification = new Notification({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      message: `Your batch enrollment has been reverted back to ${oldBatch.batchName}.`,
      notificationType: 'batch_conversion'
    });
    await notification.save({ session });

    await session.commitTransaction();
    session.endSession();

    // Socket event
    const io = req.app.get('socketio');
    if (io) {
      io.emit('notification', notification);
      io.emit('student_converted', { studentId: student._id, newBatchId: oldBatch._id });
    }

    res.json({ message: `Student reverted to previous batch: ${oldBatch.batchName}`, student });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Error redoing conversion:', error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

// Trigger dev watch reload
