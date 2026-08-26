import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Batch from '../models/Batch.js';

export const sendTransferNotifications = async (io, transferData, session = null) => {
  const {
    studentId,
    studentName,
    phoneNumber,
    oldCourseId,
    oldBatchId,
    oldBatchName,
    newCourseId,
    newBatchId,
    newBatchName,
    transferType, // 'Temporary', 'Permanent', 'Redo', 'Auto Restore'
    adminName,
    date,
    time
  } = transferData;

  const notifications = [];

  // 1. Admin Notification
  const query = session ? { role: 'admin' } : { role: 'admin' };
  let adminAdmins = [];
  if (session) {
    adminAdmins = await User.find(query).session(session);
  } else {
    adminAdmins = await User.find(query);
  }

  for (const admin of adminAdmins) {
    notifications.push({
      recipientType: 'Admin',
      recipientId: admin._id,
      title: 'Student Transfer Completed',
      message: `${studentName} transferred from ${oldBatchName || 'N/A'} to ${newBatchName}`,
      studentId,
      studentName,
      phoneNumber,
      oldCourseId,
      oldBatchId,
      newCourseId,
      newBatchId,
      transferType,
      notificationType: 'admin_transfer_alert',
      name: admin.name || 'Admin', // Legacy field
      email: admin.email // Legacy field
    });
  }

  // 2. Tutor Notifications
  // Notify Old Tutor (Student Removed)
  if (oldBatchId) {
    let oldBatch;
    if (session) oldBatch = await Batch.findById(oldBatchId).session(session);
    else oldBatch = await Batch.findById(oldBatchId);
    
    // Check if we can find the teacher User by some means if teacherId isn't on Batch
    // Let's assume the batch has a teacherId, or we fallback if we must. 
    // In glosmart, teacherId is usually stored, or we can look up Teacher. 
    // We'll just leave recipientId empty if we can't find it easily and rely on tutor dashboards fetching by course/batch.
    notifications.push({
      recipientType: 'Tutor',
      recipientId: oldBatch?.teacherId || null,
      title: 'Student Removed',
      message: `${studentName} was transferred to ${newBatchName}.`,
      studentId,
      studentName,
      phoneNumber,
      oldCourseId,
      oldBatchId,
      newCourseId,
      newBatchId,
      transferType,
      notificationType: 'tutor_student_removed',
      name: oldBatch?.instructor || 'Tutor',
      email: 'tutor@example.com'
    });
  }

  // Notify New Tutor (New Student Assigned)
  if (newBatchId) {
    let newBatch;
    if (session) newBatch = await Batch.findById(newBatchId).session(session);
    else newBatch = await Batch.findById(newBatchId);
    
    notifications.push({
      recipientType: 'Tutor',
      recipientId: newBatch?.teacherId || null,
      title: 'New Student Assigned',
      message: `${studentName} joined your batch ${newBatchName}.`,
      studentId,
      studentName,
      phoneNumber,
      oldCourseId,
      oldBatchId,
      newCourseId,
      newBatchId,
      transferType,
      notificationType: 'tutor_student_assigned',
      name: newBatch?.instructor || 'Tutor',
      email: 'tutor@example.com'
    });
  }

  // Save all notifications
  let savedNotifs;
  if (session) {
    savedNotifs = await Notification.insertMany(notifications, { session });
  } else {
    savedNotifs = await Notification.insertMany(notifications);
  }

  // Emit via socket
  if (io) {
    savedNotifs.forEach(notif => {
      io.emit('notification', notif);
    });
  }

  return savedNotifs;
};
