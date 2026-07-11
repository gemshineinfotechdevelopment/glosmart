import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Configure Cloudinary
console.log('Cloudinary Config Check:');
console.log('CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? 'Loaded' : 'Missing');
console.log('API_KEY:', process.env.CLOUDINARY_API_KEY ? 'Loaded' : 'Missing');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure Multer Storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'glosmart',
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }]
  }
});

const upload = multer({ storage: storage });

router.post('/', (req, res) => {
  upload.single('image')(req, res, function (err) {
    if (err) {
      console.error('Multer/Cloudinary error:', err);
      return res.status(500).json({ message: err.message || 'Error during file upload' });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      res.json({ imageUrl: req.file.path });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ message: 'Server error during upload' });
    }
  });
});

export default router;
