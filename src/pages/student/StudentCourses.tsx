import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiBookOpen, 
  FiClock, 
  // FiCheckCircle, 
  FiPlus, 
  FiAward
} from 'react-icons/fi';

interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
  description: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  thumbnailImage: string;
  startDate?: string;
  endDate?: string;
  maxStudents?: number;
  status: 'Active' | 'Inactive';
}

interface EnrolledCourse extends Course {
  progress: number;
  instructor: string;
  nextSession: string;
  lastAccessed: string;
}

const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  // const [showToast, setShowToast] = useState(false);
  // const [toastMessage, setToastMessage] = useState('');
  
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState('Student User');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);

  // Fetch student and courses from DB
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileId = user?.profileId || 'first';
        // 1. Fetch Student first
        const studentRes = await fetch(`http://localhost:5000/api/students/${profileId}`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudentId(studentData._id);
          if (studentData.name) setStudentName(studentData.name);
          if (studentData.grade) setStudentGrade(studentData.grade);
          if (studentData.avatar) setStudentAvatar(studentData.avatar);

          if (studentData.enrolledCourses) {
            setEnrolledCourses(studentData.enrolledCourses);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    loadData();
  }, [user]);

  // Fetch suggested courses when enrolledCourses updates
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/courses');
        if (response.ok) {
          const data = await response.json();
          const coursesList: Course[] = data.courses || [];
          
          // Filter out courses that match enrolled course names
          const enrolledNames = enrolledCourses.map(e => e.courseName.toLowerCase());
          const filtered = coursesList.filter(c => 
            c.status === 'Active' && 
            !enrolledNames.includes(c.courseName.toLowerCase())
          );
          setSuggestedCourses(filtered);
        }
      } catch (error) {
        console.error('Failed to fetch courses from database:', error);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) {
      getCourses();
    }
  }, [enrolledCourses, studentId]);

  // Handle enrollment: redirect to fees and payments page for fee payment first
  const handleEnroll = (course: Course) => {
    navigate('/student/fees', { state: { pendingEnrollment: course } });
  };

  // Static fallback suggested courses if database does not return any suggestions
  const fallbackSuggestions: Course[] = [
    {
      _id: 'suggest-1',
      courseName: 'Digital Illustration Mastery',
      courseCode: 'ART009',
      description: 'Learn pro sketching, shading, and painting techniques on iPad using Procreate.',
      skillLevel: 'Beginner',
      thumbnailImage: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&q=80',
      status: 'Active'
    },
    {
      _id: 'suggest-2',
      courseName: 'Watercolor Landscape Vibe',
      courseCode: 'ART012',
      description: 'Understand wet-on-wet techniques, transparency layers, and atmospheric perspective.',
      skillLevel: 'Intermediate',
      thumbnailImage: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=500&q=80',
      status: 'Active'
    },
    {
      _id: 'suggest-3',
      courseName: 'Acrylic Portraits',
      courseCode: 'ART015',
      description: 'Capture realistic skin tones, lighting transitions, and dramatic structures on board.',
      skillLevel: 'Intermediate',
      thumbnailImage: 'https://images.unsplash.com/photo-1579783922641-f2fcfbe0a8b7?w=500&q=80',
      status: 'Active'
    }
  ];

  const displayedSuggestions = suggestedCourses.length > 0 
    ? suggestedCourses 
    : fallbackSuggestions.filter(f => !enrolledCourses.map(e => e.courseName.toLowerCase()).includes(f.courseName.toLowerCase()));

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pb-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Courses</h1>
            <p className="text-slate-500 text-[14px] mt-0.5">Manage your active learning modules and curriculum progress</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {studentGrade}</p>
            </div>
            <img 
              src={studentAvatar} 
              alt={studentName} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => navigate('/student/profile')}
            />
          </div>
        </header>

        {/* Content Container */}
        <div className="px-6 lg:px-10 mt-8 space-y-10 flex-1">
          {location.state?.fromRestricted && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-sm">
              <span className="text-amber-500 text-sm">⚠️</span>
              <span>Please purchase a course to unlock access to the dashboard, assignments, attendance, and profile pages.</span>
            </div>
          )}
          
          {/* Toast Notification commented out */}
          {/*
          {showToast && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
              <div className="p-1 bg-[#4700b3] text-white rounded-full">
                <FiCheckCircle size={16} />
              </div>
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
          )}
          */}

          {/* Section 1: Active Enrolled Courses */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Learning Progress</h2>
                <p className="text-slate-400 text-xs mt-0.5">Your currently enrolled academy courses</p>
              </div>
              <span className="bg-[#4700b3]/10 text-[#4700b3] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                {enrolledCourses.length} Active Modules
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {enrolledCourses.map((course) => {
                // Style variables based on skill level
                let levelColor = "bg-slate-100 text-slate-700";
                if (course.skillLevel === 'Beginner') levelColor = "bg-yellow-100 text-yellow-800";
                if (course.skillLevel === 'Intermediate') levelColor = "bg-orange-100 text-orange-850";
                if (course.skillLevel === 'Advanced') levelColor = "bg-purple-100 text-purple-900";

                return (
                  <div 
                    key={course._id} 
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col group hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-shadow duration-300"
                  >
                    {/* Thumbnail banner */}
                    <div className="relative h-44 w-full bg-slate-100 overflow-hidden shrink-0">
                      <img 
                        src={course.thumbnailImage} 
                        alt={course.courseName} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute top-4 left-4 flex gap-2">
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-sm ${levelColor}`}>
                          {course.skillLevel}
                        </span>
                        <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-black/60 text-white backdrop-blur-md">
                          {course.courseCode}
                        </span>
                      </div>
                      
                      {/* Access status overlay */}
                      <div className="absolute bottom-4 right-4 bg-slate-900/75 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold text-white tracking-wide">
                        Accessed {course.lastAccessed}
                      </div>
                    </div>

                    {/* Body contents */}
                    <div className="p-6 flex flex-col flex-1 text-left">
                      <h3 className="font-extrabold text-[17px] text-slate-900 mb-2 leading-tight tracking-tight min-h-[44px]">
                        {course.courseName}
                      </h3>
                      <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mb-6">
                        {course.description}
                      </p>

                      {/* Instructor details */}
                      <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                        <div className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center text-[#4700b3] shrink-0 font-bold text-xs uppercase">
                          {course.instructor.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Instructor</p>
                          <p className="text-xs font-extrabold text-slate-700 mt-1 leading-none">{course.instructor}</p>
                        </div>
                      </div>

                      {/* Progress section */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between items-center text-xs font-bold">
                          <span className="text-slate-500 uppercase tracking-wider text-[10px]">Course Progress</span>
                          <span className="text-[#4700b3] font-black">{course.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div 
                            className="bg-[#4700b3] h-2 rounded-full transition-all duration-500" 
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Footer schedule */}
                      <div className="mt-auto pt-4 border-t border-slate-50 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                          <FiClock size={14} className="stroke-[2.5]" />
                          <span>{course.nextSession}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Section 2: Explore / Suggest Courses from Admin */}
          <section className="space-y-6 pt-6 border-t border-slate-100">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore New Creative Paths</h2>
              <p className="text-slate-400 text-xs mt-0.5">Admin-approved creative modules available for enrollment</p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4700b3]"></div>
              </div>
            ) : displayedSuggestions.length === 0 ? (
              <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <FiAward size={48} className="mx-auto text-slate-300 mb-3" />
                <p className="font-semibold text-sm">You are enrolled in all active courses!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedSuggestions.map((course: Course) => (
                  <div 
                    key={course._id} 
                    className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="relative h-40 bg-slate-50 shrink-0">
                      {course.thumbnailImage ? (
                        <img src={course.thumbnailImage} alt={course.courseName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-purple-50 text-[#4700b3]/30">
                          <FiBookOpen size={40} />
                        </div>
                      )}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-yellow-100 text-yellow-900 uppercase">
                          {course.skillLevel}
                        </span>
                        <span className="px-2 py-0.5 text-[9px] font-bold rounded bg-black/60 text-white">
                          {course.courseCode || 'NEW'}
                        </span>
                      </div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 text-left justify-between min-h-[180px]">
                      <div>
                        <h4 className="font-extrabold text-[15px] text-slate-900 mb-1 leading-tight tracking-tight line-clamp-2">
                          {course.courseName}
                        </h4>
                        <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-3">
                          {course.description || 'Curriculum description and weekly lectures schedule configured by administrators.'}
                        </p>
                      </div>

                      <button 
                        onClick={() => handleEnroll(course)}
                        className="w-full bg-[#e6e6fa] hover:bg-[#d8d8f6] text-[#4700b3] font-bold rounded-xl py-2.5 mt-4 transition-colors border-none cursor-pointer flex items-center justify-center gap-1.5 text-xs"
                      >
                        <FiPlus size={14} className="stroke-[2.5]" /> Enroll in Course
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

      </main>
    </div>
  );
};

export default StudentCourses;
