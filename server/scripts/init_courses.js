import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

const sampleCourses = [
  // 1. Pre-Junior (Age 4-6)
  {
    courseName: 'Little Artists: Fun Shapes & Magic Colors',
    description: 'A playful introduction to drawing lines, basic geometric shapes, and vibrant coloring exercises designed specifically for young minds.',
    targetAgeGroups: ['Pre-Junior'],
    minAge: 4,
    maxAge: 6,
    skillLevel: 'Beginner',
    difficulty: 'Beginner',
    drawingCategory: 'Coloring & Shapes',
    interests: ['Basic drawing', 'Lines and shapes', 'Coloring', 'Simple objects'],
    duration: '6 Weeks',
    lessonsCount: 12,
    price: '₹2,999',
    rating: 4.9,
    instructor: 'Emily Watson',
    thumbnailImage: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    status: 'Active'
  },
  {
    courseName: 'Simple Objects & Animal Doodling',
    description: 'Explore easy step-by-step drawing of cute animals, everyday objects, and creative coloring activities for pre-juniors.',
    targetAgeGroups: ['Pre-Junior'],
    minAge: 4,
    maxAge: 6,
    skillLevel: 'Beginner',
    difficulty: 'Beginner',
    drawingCategory: 'Coloring & Shapes',
    interests: ['Simple objects', 'Coloring', 'Basic drawing'],
    duration: '8 Weeks',
    lessonsCount: 16,
    price: '₹3,499',
    rating: 4.8,
    instructor: 'Emily Watson',
    thumbnailImage: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&q=80',
    status: 'Active'
  },

  // 2. Junior (Age 7-9)
  {
    courseName: 'Cartoon & Character Drawing for Juniors',
    description: 'Master fundamentals of cartoon expression, character anatomy, nature scenery, and vibrant coloring techniques.',
    targetAgeGroups: ['Junior'],
    minAge: 7,
    maxAge: 9,
    skillLevel: 'Beginner',
    difficulty: 'Beginner',
    drawingCategory: 'Cartoon & Character Drawing',
    interests: ['Cartoon drawing', 'Character drawing', 'Nature drawing', 'Coloring'],
    duration: '8 Weeks',
    lessonsCount: 16,
    price: '₹3,999',
    rating: 4.9,
    instructor: 'David Miller',
    thumbnailImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=600&q=80',
    status: 'Active'
  },
  {
    courseName: 'Nature & Object Drawing Fundamentals',
    description: 'Step-by-step guidance on capturing flowers, trees, animals, and object perspective with foundational shading.',
    targetAgeGroups: ['Junior'],
    minAge: 7,
    maxAge: 9,
    skillLevel: 'Intermediate',
    difficulty: 'Intermediate',
    drawingCategory: 'Object & Nature Drawing',
    interests: ['Object drawing', 'Nature drawing', 'Drawing fundamentals', 'Shading'],
    duration: '10 Weeks',
    lessonsCount: 20,
    price: '₹4,499',
    rating: 4.8,
    instructor: 'David Miller',
    thumbnailImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80',
    status: 'Active'
  },

  // 3. Senior (Age 10-12)
  {
    courseName: 'Advanced Perspective & Shading Techniques',
    description: 'Learn one-point and two-point perspective, dynamic light casting, realistic shading gradients, and structural still life.',
    targetAgeGroups: ['Senior'],
    minAge: 10,
    maxAge: 12,
    skillLevel: 'Intermediate',
    difficulty: 'Intermediate',
    drawingCategory: 'Advanced Shading & Perspective',
    interests: ['Shading', 'Perspective', 'Still life', 'Drawing fundamentals'],
    duration: '10 Weeks',
    lessonsCount: 20,
    price: '₹4,999',
    rating: 4.9,
    instructor: 'Sophia Reed',
    thumbnailImage: 'https://images.unsplash.com/photo-1579783922641-f2fcfbe0a8b7?w=600&q=80',
    status: 'Active'
  },
  {
    courseName: 'Landscape Art & Creative Composition',
    description: 'Explore atmospheric landscapes, depth principles, anatomical basics, and advanced color balancing for senior learners.',
    targetAgeGroups: ['Senior'],
    minAge: 10,
    maxAge: 12,
    skillLevel: 'Advanced',
    difficulty: 'Advanced',
    drawingCategory: 'Realistic & Still Life',
    interests: ['Landscape drawing', 'Anatomy', 'Still life', 'Perspective'],
    duration: '12 Weeks',
    lessonsCount: 24,
    price: '₹5,499',
    rating: 4.8,
    instructor: 'Sophia Reed',
    thumbnailImage: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&q=80',
    status: 'Active'
  },

  // 4. Special (Age 12+)
  {
    courseName: 'Master Portrait & Realistic Anatomy',
    description: 'Professional human portraiture, facial proportions, hyper-realistic skin shading, and expressive lighting.',
    targetAgeGroups: ['Special'],
    minAge: 13,
    maxAge: 99,
    skillLevel: 'Advanced',
    difficulty: 'Advanced',
    drawingCategory: 'Portrait & Human Anatomy',
    interests: ['Portrait drawing', 'Realistic drawing', 'Anatomy', 'Shading'],
    duration: '12 Weeks',
    lessonsCount: 24,
    price: '₹5,999',
    rating: 5.0,
    instructor: 'Marcus Vance',
    thumbnailImage: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&q=80',
    status: 'Active'
  },
  {
    courseName: 'Digital Art & Procreate Illustration',
    description: 'Industry-standard digital drawing techniques, layer blending, brush mastering, and stylized character concept art.',
    targetAgeGroups: ['Special', 'Senior'],
    minAge: 11,
    maxAge: 99,
    skillLevel: 'Intermediate',
    difficulty: 'Intermediate',
    drawingCategory: 'Digital Art & Illustration',
    interests: ['Digital art', 'Portrait drawing', 'Character drawing', 'Perspective'],
    duration: '10 Weeks',
    lessonsCount: 20,
    price: '₹5,499',
    rating: 4.9,
    instructor: 'Marcus Vance',
    thumbnailImage: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=600&q=80',
    status: 'Active'
  }
];

async function seedCourses() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/art_lms';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Check existing courses and update or insert
    for (const cData of sampleCourses) {
      const existing = await Course.findOne({ courseName: cData.courseName });
      if (existing) {
        await Course.findByIdAndUpdate(existing._id, { $set: cData });
        console.log(`Updated course: ${cData.courseName}`);
      } else {
        await Course.create(cData);
        console.log(`Created course: ${cData.courseName}`);
      }
    }

    // Update any legacy courses to ensure targetAgeGroups is set
    await Course.updateMany(
      { $or: [{ targetAgeGroups: { $exists: false } }, { targetAgeGroups: { $size: 0 } }] },
      { $set: { targetAgeGroups: ['All Ages'], minAge: 4, maxAge: 99, drawingCategory: 'General Drawing' } }
    );

    console.log('Successfully seeded recommendation courses!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seedCourses();
