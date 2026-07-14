import express from 'express';
import Course from '../models/Course.js';
import Student from '../models/Student.js';
import Batch from '../models/Batch.js';

const router = express.Router();

// GET all courses with search, filtering, pagination
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    
    const query = {};
    if (search) {
      query.courseName = { $regex: search, $options: 'i' };
    }
    if (status && status !== 'All Courses') {
      query.status = status;
    }

    const courses = await Course.find(query)
      .populate('batches')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      totalCourses: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single course by ID
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('batches');
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new course
router.post('/', async (req, res) => {
  try {
    const newCourse = new Course(req.body);
    const savedCourse = await newCourse.save();
    res.status(201).json(savedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT update course by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }
    res.json(updatedCourse);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE course by ID
router.delete('/:id', async (req, res) => {
  try {
    const courseId = req.params.id;
    const deletedCourse = await Course.findByIdAndDelete(courseId);
    if (!deletedCourse) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // 1. Remove this course from enrolledCourses array of all students
    await Student.updateMany(
      { 
        $or: [
          { "enrolledCourses.courseId": courseId },
          { "enrolledCourses.courseName": deletedCourse.courseName }
        ]
      },
      { 
        $pull: { 
          enrolledCourses: { 
            $or: [
              { courseId: courseId },
              { courseName: deletedCourse.courseName }
            ]
          } 
        } 
      }
    );

    // 2. Also unset the primary courseId/course fields on students if assigned
    await Student.updateMany(
      { 
        $or: [
          { courseId: courseId },
          { course: deletedCourse.courseName }
        ]
      },
      { 
        $unset: { courseId: 1, course: 1 } 
      }
    );

    // 3. Find and clean up batches associated with this course
    const batchIds = await Batch.find({ courseId: courseId }).distinct('_id');
    const batchNames = await Batch.find({ courseId: courseId }).distinct('batchName');

    // Remove batch associations from students
    await Student.updateMany(
      { 
        $or: [
          { batchId: { $in: batchIds } },
          { batch: { $in: batchNames } }
        ]
      },
      { 
        $unset: { batchId: 1, batch: 1 } 
      }
    );

    // Now delete the batches
    await Batch.deleteMany({ courseId: courseId });

    res.json({ message: 'Course deleted successfully', id: courseId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
