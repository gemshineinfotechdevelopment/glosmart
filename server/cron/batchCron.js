import TemporaryBatchTransfer from '../models/TemporaryBatchTransfer.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';
import Notification from '../models/Notification.js';
import AuditLog from '../models/AuditLog.js';

export const runTransferCronJob = async (io) => {
  const now = new Date();
  
  const results = { activated: 0, completed: 0 };

  try {
    // 1. Activate scheduled transfers
    // Find scheduled transfers where startDate <= now
    const toActivate = await TemporaryBatchTransfer.find({
      status: 'scheduled',
      startDate: { $lte: now }
    });

    for (const transfer of toActivate) {
      if (!transfer.originalCourseId) {
        transfer.originalCourseId = transfer.courseId;
      }
      transfer.status = 'active';
      transfer.scheduled = false;
      transfer.active = true;
      await transfer.save();

      results.activated++;

      // Load student and target batch for notifications
      const student = await Student.findById(transfer.studentId);
      const targetBatch = await Batch.findById(transfer.temporaryBatchId);

      if (student && targetBatch) {
        const msg = `You have been temporarily shifted to ${targetBatch.batchName} from ${transfer.startDate.toLocaleDateString()} to ${transfer.endDate.toLocaleDateString()}.`;
        const notification = new Notification({
          name: student.name,
          email: student.email,
          phone: student.phone || '',
          message: msg,
          notificationType: 'batch_transfer_activated'
        });
        await notification.save();

        if (io) {
          io.emit('notification', notification);
          io.emit('transfer_updated', { studentId: student._id, transfer });
        }
      }
    }

    // 2. Complete expired transfers
    // Find active transfers where endDate < now
    const toComplete = await TemporaryBatchTransfer.find({
      status: 'active',
      endDate: { $lt: now }
    });

    for (const transfer of toComplete) {
      if (!transfer.originalCourseId) {
        transfer.originalCourseId = transfer.courseId;
      }
      transfer.status = 'completed';
      transfer.active = false;
      transfer.completed = true;
      await transfer.save();

      results.completed++;

      const student = await Student.findById(transfer.studentId);
      const origBatch = await Batch.findById(transfer.originalBatchId);

      // Audit Log for automatic revert
      const auditLog = new AuditLog({
        adminName: 'System Cron',
        adminId: transfer.createdBy, // The admin who created it originally
        studentId: transfer.studentId,
        studentName: student ? student.name : 'Unknown Student',
        oldCourseId: transfer.courseId,
        newCourseId: transfer.originalCourseId,
        oldBatchId: transfer.temporaryBatchId,
        newBatchId: transfer.originalBatchId,
        newBatchName: origBatch ? origBatch.batchName : 'Original Batch',
        action: 'Completed (Auto Restore)',
        ipAddress: '127.0.0.1'
      });
      await auditLog.save();

      if (student && origBatch) {
        // Send Notifications using the service
        const { sendTransferNotifications } = await import('../services/notificationService.js');
        
        await sendTransferNotifications(io, {
          studentId: student._id,
          studentName: student.name,
          phoneNumber: student.phone || '',
          oldCourseId: transfer.courseId,
          oldBatchId: transfer.temporaryBatchId,
          oldBatchName: 'Temporary Batch',
          newCourseId: transfer.originalCourseId,
          newBatchId: transfer.originalBatchId,
          newBatchName: origBatch.batchName,
          transferType: 'Auto Restore',
          adminName: 'System Cron'
        });

        if (io) {
          io.emit('transfer_updated', { studentId: student._id, transfer });
        }
      }
    }
  } catch (error) {
    console.error('Error executing transfer cron job:', error);
  }

  return results;
};
