import express from 'express';
import Batch from '../models/Batch.js';

const router = express.Router();

// GET all batches
router.get('/', async (req, res) => {
  try {
    const batches = await Batch.find().sort({ createdAt: -1 });
    res.json(batches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single batch by ID
router.get('/:id', async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(batch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new batch
router.post('/', async (req, res) => {
  try {
    const newBatch = new Batch(req.body);
    const savedBatch = await newBatch.save();
    res.status(201).json(savedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update batch by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedBatch = await Batch.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json(updatedBatch);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE batch by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedBatch = await Batch.findByIdAndDelete(req.params.id);
    if (!deletedBatch) {
      return res.status(404).json({ message: 'Batch not found' });
    }
    res.json({ message: 'Batch deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
