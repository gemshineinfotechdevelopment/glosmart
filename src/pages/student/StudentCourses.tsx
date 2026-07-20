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
  FiVideo,
  FiUser,
  FiCalendar,
  FiUserCheck,
  FiLayers
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
  const [studentBatchName, setStudentBatchName] = useState<string>('');
  const [studentCourseId, setStudentCourseId] = useState<string>('');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [suggestedCourses, setSuggestedCourses] = useState<Course[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [courseBatches, setCourseBatches] = useState<Record<string, any[]>>({});

  // Batch selection modal states
  const [enrollCourseModal, setEnrollCourseModal] = useState<Course | null>(null);
  const [enrollBatches, setEnrollBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Expanded enrolled course state
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);

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
          if (studentData.batch) setStudentBatchName(studentData.batch);
          if (studentData.courseId) setStudentCourseId(studentData.courseId?._id || studentData.courseId);

          if (studentData.enrolledCourses) {
            setEnrolledCourses(studentData.enrolledCourses);
          }
          if (studentData.attendanceRecords) {
            setAttendanceRecords(studentData.attendanceRecords);
          }
          // Fetch batch & assignment data for enrolled courses
          if (studentData.enrolledCourses && studentData.enrolledCourses.length > 0) {
            try {
              const coursesRes = await fetch('http://localhost:5000/api/courses');
              const coursesData = await coursesRes.json();
              const allCourses = coursesData.courses || [];

              const batchMap: Record<string, any[]> = {};

              for (const ec of studentData.enrolledCourses) {
                const matched = allCourses.find((c: any) => 
                  c.courseName.toLowerCase() === ec.courseName.toLowerCase()
                );
                if (matched) {
                  // Fetch batches for this course
                  try {
                    const batchRes = await fetch(`http://localhost:5000/api/batches/course/${matched._id}`);
                    const batchData = await batchRes.json();
                    batchMap[ec.courseName] = batchData;
                  } catch (err) {
                    console.error(`Error fetching batches for ${ec.courseName}:`, err);
                  }
                }
              }

              setCourseBatches(batchMap);
            } catch (err) {
              console.error('Error fetching batch/assignment data:', err);
            }
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

  // Handle enrollment: open modal to select batch
  const handleEnrollClick = async (course: Course) => {
    setEnrollCourseModal(course);
    setLoadingBatches(true);
    try {
      const courseIdentifier = course._id || (course as any).courseId;
      const res = await fetch(`http://localhost:5000/api/batches/course/${courseIdentifier}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollBatches(data || []);
      } else {
        setEnrollBatches([]);
      }
    } catch (error) {
      console.error('Failed to fetch batches', error);
      setEnrollBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleBatchSelect = (course: Course, batch: any) => {
    setEnrollCourseModal(null);
    navigate('/student/fees', { state: { pendingEnrollment: course, pendingBatch: batch } });
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

  // Check if a batch class is currently live
  const isBatchLive = (batch: any): boolean => {
    if (!batch.zoomLink || batch.isZoomActive === false || batch.status !== 'ACTIVE') return false;
    if (!batch.days || batch.days.length === 0 || !batch.startTime || !batch.endTime) return false;

    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    if (!batch.days.includes(todayName)) return false;

    const [startH, startM] = batch.startTime.split(':').map(Number);
    const [endH, endM] = batch.endTime.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

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
            <p className="text-slate-500 text-[14px] mt-0.5">Manage your active learning modules and enrolled courses</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {studentGrade}</p>
            </div>
            <div 
              className="w-10 h-10 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer shrink-0"
              onClick={() => navigate('/student/profile')}
            >
              <FiUser size={20} />
            </div>
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
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Enrolled Courses</h2>
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
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col group hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-shadow duration-300 cursor-pointer"
                    onClick={() => {
                      if ((course as any).batchId || (course as any).batchName) {
                        setExpandedCourseId(expandedCourseId === course._id ? null : course._id);
                      } else {
                        handleEnrollClick(course as any);
                      }
                    }}
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
                          {course.instructor ? course.instructor.charAt(0) : 'T'}
                        </div>
                        <div className="flex-1">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Instructor</p>
                          <p className="text-xs font-extrabold text-slate-700 mt-1 leading-none">{course.instructor || 'TBD'}</p>
                        </div>
                        {(!((course as any).batchId || (course as any).batchName)) && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEnrollClick(course as any); }}
                            className="bg-[#4700b3] hover:bg-[#3d0099] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            View Batches
                          </button>
                        )}
                      </div>

                      {/* Expanded Section (Purchased Batch Info & Assignments) */}
                      {expandedCourseId === course._id && (
                        <div className="pt-4 border-t border-slate-100/50 mb-6 animate-fade-in">
                          {/* Batch info */}
                          {(() => {
                            let myBatches = courseBatches[course.courseName] || [];
                            if ((course as any).batchId) {
                              myBatches = myBatches.filter(b => b._id === (course as any).batchId);
                            } else if ((course as any).batchName) {
                              myBatches = myBatches.filter(b => b.batchName === (course as any).batchName);
                            }
                            if (myBatches.length === 0) return null;
                            
                            return (
                              <div className="mb-4">
                                <div className="flex items-center gap-1.5 mb-2">
                                  <FiLayers size={13} className="text-[#4700b3]" />
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Enrolled Batch</span>
                                </div>
                                <div className="space-y-2">
                                  {myBatches.map((batch: any) => (
                                  <div key={batch._id} className={`border rounded-xl px-3 py-2 ${isBatchLive(batch) ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 border-slate-100'}`}>
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-bold text-slate-700">{batch.batchName}</span>
                                      <div className="flex items-center gap-1.5">
                                        {isBatchLive(batch) && (
                                          <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            <span className="relative flex h-1.5 w-1.5">
                                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                                            </span>
                                            Live
                                          </span>
                                        )}
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                          batch.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                          batch.status === 'UPCOMING' ? 'bg-blue-50 text-blue-600' :
                                          'bg-slate-100 text-slate-500'
                                        }`}>{batch.status}</span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-slate-400 font-medium">
                                      {batch.startDate && (
                                        <span className="flex items-center gap-1">
                                          <FiCalendar size={10} />
                                          {batch.startDate} – {batch.endDate}
                                        </span>
                                      )}
                                      {batch.startTime && (
                                        <span className="flex items-center gap-1">
                                          <FiClock size={10} />
                                          {batch.startTime} - {batch.endTime}
                                        </span>
                                      )}
                                    </div>
                                    {/* Zoom Join Button */}
                                    {batch.zoomLink && batch.isZoomActive !== false && batch.status === 'ACTIVE' && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          window.open(batch.zoomLink, '_blank', 'noopener,noreferrer');
                                        }}
                                        className={`mt-2 w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-all border-none cursor-pointer ${
                                          isBatchLive(batch)
                                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-200'
                                            : 'bg-[#4700b3] hover:bg-[#3d0099] text-white shadow-sm'
                                        }`}
                                      >
                                        <FiVideo size={13} />
                                        {isBatchLive(batch) ? 'Join Live Class' : 'Join Zoom Meeting'}
                                      </button>
                                    )}
                                  </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}


                        </div>
                      )}

                      {/* Attendance section */}
                      {(() => {
                        const courseRecords = attendanceRecords.filter((r: any) =>
                          r.activity && r.activity.toLowerCase() === course.courseName.toLowerCase()
                        );
                        const totalSessions = courseRecords.length;
                        const presentCount = courseRecords.filter((r: any) =>
                          r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late'
                        ).length;
                        const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
                        return (
                          <div className="flex items-center gap-3 mb-6 bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                            <div className="p-2 bg-purple-50 text-[#4700b3] rounded-xl shrink-0">
                              <FiUserCheck size={16} className="stroke-[2.5]" />
                            </div>
                            <div className="flex-1">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">Attendance</p>
                              <p className="text-xs font-extrabold text-slate-700 mt-1 leading-none">
                                {totalSessions > 0
                                  ? <>{attendanceRate}% <span className="text-slate-400 font-semibold">({presentCount}/{totalSessions} sessions)</span></>
                                  : <span className="text-slate-400 font-semibold">No sessions yet</span>
                                }
                              </p>
                            </div>
                          </div>
                        );
                      })()}

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
                    className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-300 cursor-pointer"
                    onClick={() => handleEnrollClick(course)}
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
                        onClick={(e) => { e.stopPropagation(); handleEnrollClick(course); }}
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
        {enrollCourseModal && (
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
                    setEnrollCourseModal(null);
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
                    {enrollCourseModal.courseCode || 'NEW'}
                  </span>
                  <h4 className="font-black text-slate-800 text-lg mt-2 leading-tight">
                    {enrollCourseModal.courseName}
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
                ) : enrollBatches.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 p-8">
                    <FiCalendar size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-extrabold text-sm text-slate-700">No active batches available</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">There are no batches scheduled for this course at the moment. Please contact the administrator to request a session.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollBatches.map((batch) => {
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
                              onClick={() => handleBatchSelect(enrollCourseModal, batch)}
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
                    setEnrollCourseModal(null);
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
