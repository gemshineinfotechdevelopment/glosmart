import express from 'express';
import Settings from '../models/Settings.js';

const router = express.Router();

// @route   GET /api/settings
// @desc    Get global settings (or create defaults if none exist)
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({}); // Creates with defaults
    }
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error fetching settings' });
  }
});

// @route   PUT /api/settings
// @desc    Update global settings
router.put('/', async (req, res) => {
  try {
    const { profile, contactInfo, socialLinks } = req.body;
    
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings({ profile, contactInfo, socialLinks });
    } else {
      if (profile) settings.profile = { ...settings.profile, ...profile };
      if (contactInfo) settings.contactInfo = { ...settings.contactInfo, ...contactInfo };
      if (socialLinks) settings.socialLinks = { ...settings.socialLinks, ...socialLinks };
    }
    
    await settings.save();
    res.status(200).json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Server error updating settings' });
  }
});

export default router;
