import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import Gallery from '../models/Gallery.js';

const router = express.Router();

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads', 'gallery');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer Storage - Local disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'gallery-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG images are allowed'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
});

// @route   GET /api/gallery
// @desc    Get gallery images with pagination, search, and filters
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || '';
    const category = req.query.category || '';
    const featured = req.query.featured;

    // Build filter query
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    const totalImages = await Gallery.countDocuments(filter);
    const totalPages = Math.ceil(totalImages / limit);
    const skip = (page - 1) * limit;

    const images = await Gallery.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      images,
      currentPage: page,
      totalPages,
      totalImages,
    });
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    res.status(500).json({ message: 'Server error fetching images' });
  }
});

// @route   GET /api/gallery/categories
// @desc    Get distinct categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Gallery.distinct('category');
    res.status(200).json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error fetching categories' });
  }
});

// @route   POST /api/gallery
// @desc    Upload an image with title, description, and category
router.post('/', (req, res, next) => {
  upload.single('image')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'File size exceeds 1MB limit.' });
      }
      return res.status(400).json({ message: err.message });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { title, description, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }

    if (!title) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: 'Title is required' });
    }

    // Get current max order to place new image at the end
    const maxOrderImage = await Gallery.findOne().sort({ order: -1 });
    const newOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    const imageUrl = `/uploads/gallery/${req.file.filename}`;

    const newImage = new Gallery({
      title,
      description: description || '',
      category: category || 'Uncategorized',
      imageUrl,
      publicId: req.file.filename,
      order: newOrder,
    });

    await newImage.save();
    res.status(201).json(newImage);
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'Server error uploading image' });
  }
});

// @route   PATCH /api/gallery/:id/featured
// @desc    Toggle the featured status of an image
router.patch('/:id/featured', async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    image.isFeatured = !image.isFeatured;
    await image.save();

    res.status(200).json(image);
  } catch (error) {
    console.error('Error toggling featured:', error);
    res.status(500).json({ message: 'Server error toggling featured status' });
  }
});

// @route   PATCH /api/gallery/reorder
// @desc    Update the order of images
router.patch('/reorder', async (req, res) => {
  try {
    const { images } = req.body; // [{ id, order }, ...]

    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const bulkOps = images.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));

    await Gallery.bulkWrite(bulkOps);

    res.status(200).json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Error reordering images:', error);
    res.status(500).json({ message: 'Server error reordering images' });
  }
});

// @route   DELETE /api/gallery/bulk
// @desc    Delete multiple images at once
router.delete('/bulk', async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No image IDs provided' });
    }

    const images = await Gallery.find({ _id: { $in: ids } });

    // Delete files from disk
    for (const image of images) {
      const filePath = path.join(uploadsDir, image.publicId);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from DB
    await Gallery.deleteMany({ _id: { $in: ids } });

    res.status(200).json({ message: `${images.length} image(s) deleted successfully`, deletedCount: images.length });
  } catch (error) {
    console.error('Error bulk deleting images:', error);
    res.status(500).json({ message: 'Server error deleting images' });
  }
});

// @route   DELETE /api/gallery/:id
// @desc    Delete a single image
router.delete('/:id', async (req, res) => {
  try {
    const imageId = req.params.id;
    const image = await Gallery.findById(imageId);

    if (!image) {
      return res.status(404).json({ message: 'Image not found' });
    }

    // Delete file from disk
    const filePath = path.join(uploadsDir, image.publicId);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await Gallery.findByIdAndDelete(imageId);

    res.status(200).json({ message: 'Image deleted successfully', id: imageId });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'Server error deleting image' });
  }
});

export default router;
