import express from 'express';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   POST /api/notifications
// @desc    Create a new notification from contact form
router.post('/', async (req, res) => {
  try {
    const { name, phone, email, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required' });
    }
    const newNotification = new Notification({ name, phone, email, message });
    await newNotification.save();
    res.status(201).json(newNotification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Server error creating notification' });
  }
});

// @route   GET /api/notifications
// @desc    Get all notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Server error fetching notifications' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Toggle notification read status
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    notification.isRead = !notification.isRead;
    await notification.save();
    res.status(200).json(notification);
  } catch (error) {
    console.error('Error updating notification read status:', error);
    res.status(500).json({ message: 'Server error updating notification' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', async (req, res) => {
  try {
    const result = await Notification.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Server error deleting notification' });
  }
});

export default router;
