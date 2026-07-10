import express from 'express';
import Category from '../models/Category.js';

const router = express.Router();

// GET all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new category
router.post('/', async (req, res) => {
  try {
    // Check if category already exists
    const existing = await Category.findOne({ name: req.body.name });
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
