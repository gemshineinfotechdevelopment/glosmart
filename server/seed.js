import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Batch from './models/Batch.js';
import Student from './models/Student.js';
import Payment from './models/Payment.js';

dotenv.config();

const seedData = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined in .env file");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Batch.deleteMany();
    await Student.deleteMany();
    await Payment.deleteMany();
    console.log('Cleared existing data');

    // Seed Batches
    const batches = [
      {
        batchName: 'Morning Batch A',
        
        status: 'ACTIVE',
        statusColor: 'bg-green-500',
        batchCode: 'B-M-A-101',
        courseName: 'Web Development Bootcamp',
        category: 'Programming',
        courseIconBg: 'bg-blue-100',
        time: '09:00 AM',
        schedule: 'Mon, Wed, Fri',
        progressLabel: 'COURSE PROGRESS',
        progressText: '50% Completed',
        progressColor: 'text-blue-600',
        progressWidth: 'w-1/2',
        progressBg: 'bg-blue-500',
        instructor: 'John Doe',
        instructorAvatar: 'https://i.pravatar.cc/150?u=john',
        students: 25,
        maxStudents: 30,
        image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
        price: '₹5000'
      },
      {
        batchName: 'Evening Batch B',
        status: 'UPCOMING',
        statusColor: 'bg-teal-500',
        batchCode: 'B-E-B-102',
        courseName: 'Data Science Fundamentals',
        category: 'Data Science',
        courseIconBg: 'bg-teal-100',
        time: '06:00 PM',
        schedule: 'Tue, Thu',
        progressLabel: 'LAUNCH TIMELINE',
        progressText: 'Starts in 2 weeks',
        progressColor: 'text-teal-600',
        progressWidth: 'w-0',
        progressBg: 'bg-teal-500',
        instructor: 'Jane Smith',
        instructorAvatar: 'https://i.pravatar.cc/150?u=jane',
        students: 15,
        maxStudents: 30,
        image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
        price: '₹6000'
      },
      {
        batchName: 'Weekend UI/UX',
        status: 'COMPLETED',
        statusColor: 'bg-gray-500',
        batchCode: 'B-W-C-103',
        courseName: 'UI/UX Design Masterclass',
        category: 'Design',
        courseIconBg: 'bg-purple-100',
        time: '10:00 AM',
        schedule: 'Sat, Sun',
        progressLabel: 'COURSE PROGRESS',
        progressText: '100% Completed',
        progressColor: 'text-green-600',
        progressWidth: 'w-full',
        progressBg: 'bg-green-500',
        instructor: 'Mike Johnson',
        instructorAvatar: 'https://i.pravatar.cc/150?u=mike',
        students: 30,
        maxStudents: 30,
        image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5',
        price: '₹4500'
      }
    ];

    await Batch.insertMany(batches);
    console.log('Seeded Batches');

    // Seed Students
    const students = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        phone: '+91 9876543210',
        avatar: 'https://i.pravatar.cc/150?u=alice',
        age: 22,
        gender: 'Female',
        joiningDate: '2023-01-15',
        feeStatus: 'PAID',
        batchEnd: '2023-06-15',
        remainingDays: 150,
        attendanceRate: 95,
        attendanceTrend: '+2%',
        batch: 'Morning Batch A',
        course: 'Web Development Bootcamp',
        teacher: 'John Doe',
        admissionDate: '2023-01-10',
        schedule: 'Mon, Wed, Fri',
        address: '123 Main St, New Delhi, India'
      },
      {
        name: 'Bob Williams',
        email: 'bob@example.com',
        phone: '+91 8765432109',
        avatar: 'https://i.pravatar.cc/150?u=bob',
        age: 25,
        gender: 'Male',
        joiningDate: '2023-02-01',
        feeStatus: 'PENDING',
        batchEnd: '2023-08-01',
        remainingDays: 200,
        attendanceRate: 88,
        attendanceTrend: '-1%',
        batch: 'Evening Batch B',
        course: 'Data Science Fundamentals',
        teacher: 'Jane Smith',
        admissionDate: '2023-01-25',
        schedule: 'Tue, Thu',
        address: '456 Elm St, Mumbai, India'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        phone: '+91 7654321098',
        avatar: 'https://i.pravatar.cc/150?u=charlie',
        age: 20,
        gender: 'Male',
        joiningDate: '2023-03-15',
        feeStatus: 'PAID',
        batchEnd: '2023-05-15',
        remainingDays: 60,
        attendanceRate: 100,
        attendanceTrend: '+0%',
        batch: 'Weekend UI/UX',
        course: 'UI/UX Design Masterclass',
        teacher: 'Mike Johnson',
        admissionDate: '2023-03-10',
        schedule: 'Sat, Sun',
        address: '789 Oak St, Bangalore, India'
      }
    ];

    await Student.insertMany(students);
    console.log('Seeded Students');

    // Seed Payments
    const payments = [
      {
        invoiceNo: 'INV-1001',
        studentName: 'Alice Johnson',
        avatar: 'https://i.pravatar.cc/150?u=alice',
        course: 'Web Development Bootcamp',
        amount: '₹5000',
        mode: 'UPI',
        status: 'Successful'
      },
      {
        invoiceNo: 'INV-1002',
        studentName: 'Bob Williams',
        avatar: 'https://i.pravatar.cc/150?u=bob',
        course: 'Data Science Fundamentals',
        amount: '₹6000',
        mode: 'Bank Transfer',
        status: 'Pending'
      },
      {
        invoiceNo: 'INV-1003',
        studentName: 'Charlie Brown',
        avatar: 'https://i.pravatar.cc/150?u=charlie',
        course: 'UI/UX Design Masterclass',
        amount: '₹4500',
        mode: 'Credit Card',
        status: 'Successful'
      },
      {
        invoiceNo: 'INV-1004',
        studentName: 'David Miller',
        avatar: 'https://i.pravatar.cc/150?u=david',
        course: 'Web Development Bootcamp',
        amount: '₹5000',
        mode: 'UPI',
        status: 'Failed'
      }
    ];

    await Payment.insertMany(payments);
    console.log('Seeded Payments');

    console.log('All default data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
