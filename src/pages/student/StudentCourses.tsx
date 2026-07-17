import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiBookOpen, 
  FiClock, 
  FiPlus, 
  FiAward,
  FiX,
  FiUser,
  FiCalendar
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
  batchId?: string;
  batchName?: string;
  courseId?: string;
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
  const [studentBatchName, setStudentBatchName] = useState<string>('');
  const [studentCourseId, setStudentCourseId] = useState<string>('');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [selectedCourseForModal, setSelectedCourseForModal] = useState<Course | null>(null);
  const [modalBatches, setModalBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);

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
          if (studentData.batch) setStudentBatchName(studentData.batch);
          if (studentData.courseId) setStudentCourseId(studentData.courseId?._id || studentData.courseId);

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

  // Handle enrollment: open batch selection modal and fetch course batches
  const handleEnroll = async (course: Course) => {
    setSelectedCourseForModal(course);
    setIsBatchModalOpen(true);
    setLoadingBatches(true);
    try {
      const res = await fetch(`http://localhost:5000/api/batches/course/${course._id}`);
      if (res.ok) {
        const data = await res.json();
        setModalBatches(data || []);
      } else {
        setModalBatches([]);
      }
    } catch (err) {
      console.error("Error fetching batches for course:", err);
      setModalBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleSelectBatchAndProceed = (course: Course, batch: any) => {
    setIsBatchModalOpen(false);
    navigate('/student/fees', { state: { pendingEnrollment: course, selectedBatch: batch } });
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

                const activeBatchName = course.batchName || 
                  ((studentBatchName && (studentCourseId === course.courseId || studentCourseId === course._id)) ? studentBatchName : '');

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
                      <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mb-4">
                        {course.description}
                      </p>

                      {/* Purchased Batch Details */}
                      {activeBatchName && (
                        <div className="mb-4 p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-[11px] font-semibold text-slate-700 flex flex-col gap-1">
                          <span className="text-[9px] font-bold text-slate-450 uppercase tracking-wider">Purchased Batch</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="w-1.5 h-1.5 bg-[#4700b3] rounded-full"></span>
                            <span className="font-extrabold text-slate-800">{activeBatchName}</span>
                          </div>
                          <span className="text-slate-500 font-medium">{course.nextSession}</span>
                        </div>
                      )}

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

        {/* Modal: Select Batch */}
        {isBatchModalOpen && selectedCourseForModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[650px] overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
              {/* Modal Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiBookOpen size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Select Batch Schedule</h3>
                </div>
                <button 
                  onClick={() => {
                    setIsBatchModalOpen(false);
                    setSelectedCourseForModal(null);
                    setModalBatches([]);
                  }}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-6 overflow-y-auto text-left flex-1 bg-[#F8FAFC]">
                <div>
                  <span className="text-[10px] font-bold text-[#4700b3] bg-[#4700b3]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {selectedCourseForModal.courseCode}
                  </span>
                  <h4 className="font-black text-slate-800 text-lg mt-2 leading-tight">
                    {selectedCourseForModal.courseName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Select a batch timing that fits your schedule. You can purchase this course by enrolling in one of its active sessions below.
                  </p>
                </div>

                {loadingBatches ? (
                  <div className="flex flex-col justify-center items-center py-12 gap-3 bg-white rounded-2xl border border-slate-100 p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4700b3]"></div>
                    <span className="text-xs font-semibold text-slate-400">Loading available schedules...</span>
                  </div>
                ) : modalBatches.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 p-8">
                    <FiCalendar size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-extrabold text-sm text-slate-700">No active batches available</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">There are no batches scheduled for this course at the moment. Please contact the administrator to request a session.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modalBatches.map((batch) => {
                      const seatsLeft = batch.availableSeats !== undefined ? batch.availableSeats : (batch.capacity - (batch.enrolledStudents || 0));
                      const isFull = seatsLeft <= 0;
                      
                      // Seat color coding
                      let seatColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                      if (seatsLeft <= 5) seatColorClass = "text-orange-600 bg-orange-50 border-orange-100";
                      if (isFull) seatColorClass = "text-red-600 bg-red-50 border-red-100";

                      return (
                        <div 
                          key={batch._id} 
                          className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                            isFull ? 'opacity-70 border-slate-100' : 'border-slate-100 hover:border-purple-200 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-3 flex-1">
                            {/* Batch Info */}
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">{batch.batchName}</span>
                              <span className={`px-2 py-0.5 text-[9px] font-extrabold border rounded-md uppercase tracking-wider ${seatColorClass}`}>
                                {isFull ? 'Full' : `${seatsLeft} seats left`}
                              </span>
                            </div>

                            {/* Schedule details */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <FiCalendar className="text-slate-400 shrink-0" size={14} />
                                <span>{batch.days ? batch.days.join(', ') : 'Days TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiClock className="text-slate-400 shrink-0" size={14} />
                                <span>{batch.startTime && batch.endTime ? `${batch.startTime} - ${batch.endTime}` : 'Time TBD'}</span>
                              </div>
                            </div>

                            {/* Instructor info */}
                            <div className="flex items-center gap-2 pt-1">
                              <FiUser className="text-slate-400" size={14} />
                              <span className="text-[11px] font-bold text-slate-500">Instructor: <span className="text-slate-700 font-extrabold">{batch.instructor || 'TBD'}</span></span>
                            </div>
                          </div>

                          {/* Action & Fee */}
                          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 sm:pl-4 sm:border-l border-slate-100 gap-3">
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fee / Price</p>
                              <h5 className="text-base font-black text-slate-900">₹{batch.batchFee || '4,500'}</h5>
                            </div>
                            <button
                              disabled={isFull}
                              onClick={() => handleSelectBatchAndProceed(selectedCourseForModal, batch)}
                              className={`py-2 px-4 rounded-xl font-bold text-xs border-none cursor-pointer transition-all ${
                                isFull 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-[#4700b3] hover:bg-[#3d0099] text-white shadow-sm hover:shadow shadow-purple-200'
                              }`}
                            >
                              Enroll Batch
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => {
                    setIsBatchModalOpen(false);
                    setSelectedCourseForModal(null);
                    setModalBatches([]);
                  }}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-6 rounded-xl font-bold transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentCourses;
