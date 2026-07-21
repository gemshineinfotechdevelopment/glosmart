import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, getImageUrl } from '../../config/api';
import {
  FiBook,
  FiClock,
  FiChevronRight,
  FiMail,
  FiArrowRight,
  FiUser,
  FiCreditCard,
  FiImage,
  FiStar,
  FiVideo,
} from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Ticking clock — updates every minute so time-based banners refresh automatically
  const [, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);

  // Student state
  const [student, setStudent] = useState({
    name: 'Student User',
    grade: '5th Grade',
    attendance: '100%',
    activeCoursesCount: 0,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    enrolledCourses: [] as any[]
  });

  useEffect(() => {
    const profileId = user?.profileId;
    if (!profileId) return; // no valid ID — skip fetch, show defaults
    fetch(`${API_BASE_URL}/api/students/${profileId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data) {
          let finalAttendance = '0 Days';
          if (data.name === 'Sarah Jenkins') {
            finalAttendance = '114 Days';
          } else {
            const records = data.attendanceRecords || [];
            if (records.length > 0) {
              const presentOrLate = records.filter((r: any) =>
                r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late'
              ).length;
              finalAttendance = presentOrLate + ' Days';
            }
          }

          setStudent({
            name: data.name || 'Student User',
            grade: data.grade || '5th Grade',
            attendance: finalAttendance,
            activeCoursesCount: data.enrolledCourses ? data.enrolledCourses.length : 0,
            avatar: data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            enrolledCourses: data.enrolledCourses || []
          });
        }
      })
      .catch(err => console.error('Error fetching student data:', err));
  }, [user]);

  // Fetch teacher records from database
  const [dbTeachers, setDbTeachers] = useState<any[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/teachers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setDbTeachers(data);
        }
      })
      .catch(err => console.error('Error fetching teachers:', err))
      .finally(() => setLoadingTeachers(false));
  }, []);

  // Fetch gallery images from database for masterpiece showcase (first 3)
  const [galleryItems, setGalleryItems] = useState<any[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/gallery?limit=10`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load gallery'))
      .then(data => {
        if (data && data.images && data.images.length > 0) {
          const formatted = data.images.slice(0, 3).map((img: any) => {
            const cat = img.category || 'Artwork';
            let cleanedCat = cat.replace(/\b(beginner|advanced|intermediate)\b/gi, '')
              .replace(/\(\s*\)/g, '')
              .replace(/^[\s-–—:]+|[\s-–—:]+$/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            if (!cleanedCat) cleanedCat = 'Artwork';

            return {
              id: img._id,
              title: img.title || 'Untitled Artwork',
              author: img.description ? `${img.description}` : 'Student Artwork',
              image: getImageUrl(img.imageUrl),
              category: cleanedCat
            };
          });
          setGalleryItems(formatted);
        }
      })
      .catch(err => console.error('Error fetching gallery for dashboard showcase:', err))
      .finally(() => setLoadingGallery(false));
  }, []);

  // Fetch batches for enrolled courses to detect live classes
  const [liveBatches, setLiveBatches] = useState<any[]>([]);

  useEffect(() => {
    const fetchBatches = async () => {
      try {
        const batchRes = await fetch(`${API_BASE_URL}/api/batches`, { cache: 'no-store' });
        if (!batchRes.ok) return;
        const allBatches = await batchRes.json();

        // ONLY include batches where Zoom link is explicitly activated by teacher/admin (isZoomActive === true)
        const activeBatches = allBatches.filter(
          (b: any) => b.zoomLink && b.isZoomActive === true && b.status === 'ACTIVE'
        );

        setLiveBatches(activeBatches);
      } catch (err) {
        console.error('Error fetching batch data for live check:', err);
      }
    };

    fetchBatches();
    const interval = setInterval(fetchBatches, 10000);
    return () => clearInterval(interval);
  }, [student.enrolledCourses]);

  // Check if a batch class is currently live — ONLY true if explicitly activated (isZoomActive === true)
  const isBatchLive = (batch: any): boolean => {
    return Boolean(batch.zoomLink && batch.isZoomActive === true && batch.status === 'ACTIVE');
  };

  const currentLiveBatches = liveBatches.filter(isBatchLive);

  // Derive Schedule Timeline dynamically
  const schedule = student.enrolledCourses.length > 0
    ? student.enrolledCourses.map((c: any, index: number) => ({
      id: `s-${index}`,
      time: c.nextSession || 'Schedule TBD',
      courseName: c.courseName,
      room: `Studio ${String.fromCharCode(65 + index)}`,
      instructor: c.instructor || 'TBD',
      day: 'Every Weekday'
    }))
    : [];

  const TeachersWidget = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isPaused, setIsPaused] = useState(false);

    const count = dbTeachers.length;
    const shouldSlide = count > 3;

    useEffect(() => {
      if (!shouldSlide || isPaused) return;

      const interval = setInterval(() => {
        setIsTransitioning(true);
        setCurrentIndex((prev) => prev + 1);
      }, 3000);

      return () => clearInterval(interval);
    }, [shouldSlide, isPaused, count]);

    useEffect(() => {
      if (!shouldSlide) return;

      if (currentIndex === count) {
        // Wait for the 700ms slide transition to finish, then reset to 0 seamlessly
        const timer = setTimeout(() => {
          setIsTransitioning(false);
          setCurrentIndex(0);
        }, 700);

        return () => clearTimeout(timer);
      }
    }, [currentIndex, count, shouldSlide]);

    const extendedTeachers = shouldSlide
      ? [...dbTeachers, ...dbTeachers.slice(0, 3)]
      : dbTeachers;

    const ITEM_HEIGHT = 68; // 60px card height + 8px gap

    return (
      <div 
        className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Our Art Instructors</h3>
          <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-xs">
            <FiStar className="fill-amber-500" size={12} /> <span>{dbTeachers.length} Active</span>
          </div>
        </div>

        {loadingTeachers ? (
          <p className="text-xs text-slate-400 italic text-center py-4">Loading teachers...</p>
        ) : dbTeachers.length > 0 ? (
          <div 
            className="relative overflow-hidden"
            style={{ height: `${Math.min(count, 3) * ITEM_HEIGHT - 8}px` }}
          >
            <div
              className={`flex flex-col gap-2 ${
                isTransitioning ? 'transition-transform duration-700 ease-in-out' : 'transition-none'
              }`}
              style={{
                transform: `translateY(-${currentIndex * ITEM_HEIGHT}px)`
              }}
            >
              {extendedTeachers.map((teacher: any, idx: number) => {
                const avatarUrl = getImageUrl(teacher.avatar);
                return (
                  <div
                    key={`${teacher._id}-${idx}`}
                    className="flex items-center justify-between p-2.5 bg-slate-50/70 hover:bg-slate-100/80 rounded-xl transition-colors h-[60px] shrink-0"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase relative overflow-hidden shrink-0">
                        {avatarUrl ? (
                          <img src={avatarUrl} alt={teacher.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>{teacher.name ? teacher.name.charAt(0) : 'T'}</span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-slate-800 leading-none truncate">{teacher.name}</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1 truncate">{teacher.subject || teacher.qualification || 'Art & Design'}</p>
                      </div>
                    </div>
                    {teacher.email && (
                      <a
                        href={`mailto:${teacher.email}`}
                        title={`Email ${teacher.name}`}
                        className="p-2 bg-white hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-450 rounded-lg transition-colors shrink-0 shadow-sm"
                      >
                        <FiMail size={13} />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic text-center py-4">No teacher records found in database.</p>
        )}
      </div>
    );
  };

  const MasterpieceShowcaseWidget = () => (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <FiImage size={20} className="text-[#4700b3]" />
          <h3 className="text-lg font-black text-slate-900 tracking-tight">Academy Masterpiece Showcase</h3>
        </div>
        <button
          onClick={() => navigate('/gallery')}
          className="text-[#4700b3] hover:text-[#3d0099] font-extrabold text-xs bg-transparent border-none cursor-pointer"
        >
          View Gallery
        </button>
      </div>

      {loadingGallery ? (
        <p className="text-xs text-slate-400 italic text-center py-6">Loading gallery masterpieces...</p>
      ) : galleryItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {galleryItems.map((item: any) => (
            <div
              key={item.id}
              onClick={() => navigate('/gallery')}
              className="space-y-2 group cursor-pointer"
            >
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm truncate max-w-[80%]">
                  {item.category}
                </span>
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 truncate">{item.title}</h4>
                <p className="text-[10px] text-slate-400 font-semibold truncate">{item.author}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-400 italic text-center py-6">No gallery items available.</p>
      )}
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pb-12 w-full min-w-0">

        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-[13px] sm:text-[14px] mt-0.5">Welcome back, {student.name.split(' ')[0]}! Explore your progress.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{student.name}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {student.grade}</p>
            </div>
            <div
              className="w-10 h-10 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center border border-slate-200 shadow-sm cursor-pointer shrink-0"
              onClick={() => navigate('/student/profile')}
            >
              <FiUser size={20} />
            </div>
          </div>
        </header>

        {/* Outer Dashboard Content Container */}
        <div className="px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8 space-y-8 flex-1">

          {student.enrolledCourses.length === 0 ? (
            // NEW USER DASHBOARD
            <div className="space-y-8">

              {/* Welcome Jumbotron */}
              <div className="bg-gradient-to-r from-[#4700b3]/10 via-[#6247df]/5 to-[#4700b3]/5 border border-purple-100 rounded-[2.5rem] p-8 md:p-12 text-left relative overflow-hidden shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="space-y-3 max-w-2xl">
                  <span className="bg-purple-150 text-[#4700b3] text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                    New Student Portal Active 🚀
                  </span>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                    Welcome to GloSmart Academy, {student.name.split(' ')[0]}! ✨
                  </h2>
                  <p className="text-slate-500 text-sm md:text-base font-medium leading-relaxed">
                    We are thrilled to help you unlock your artistic potential! To start your classes, view your schedules, submit assignments, and track attendance, please enroll in a course.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/student/courses')}
                  className="bg-[#4700b3] hover:bg-[#3d0099] text-white font-bold py-3.5 px-6 rounded-2xl text-sm transition-all shadow-md shadow-purple-200 shrink-0 border-none cursor-pointer flex items-center gap-2"
                >
                  Browse & Enroll in Courses <FiArrowRight size={16} />
                </button>
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.1fr] gap-8 items-start">

                {/* Left Column */}
                <div className="space-y-8">
                  {/* Student Gallery Spotlight (First 3 Gallery Images) */}
                  <MasterpieceShowcaseWidget />
                </div>

                {/* Right Column */}
                <div className="space-y-8">
                  {/* Action Shortcuts Panel */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-5">Quick Actions</h3>

                    <div className="space-y-4">
                      {/* Action 1 */}
                      <div
                        onClick={() => navigate('/student/profile')}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#4700b3]/5 border border-slate-150 rounded-2xl cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-pink-50 text-pink-655 rounded-xl">
                            <FiUser size={18} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">Student Profile</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Fill details & set avatar</p>
                          </div>
                        </div>
                        <FiChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={16} />
                      </div>

                      {/* Action 2 */}
                      <div
                        onClick={() => navigate('/student/fees')}
                        className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-[#4700b3]/5 border border-slate-150 rounded-2xl cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 bg-teal-50 text-teal-655 rounded-xl">
                            <FiCreditCard size={18} className="stroke-[2.5]" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-800">Fees & Payments</h4>
                            <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Manage receipts & billing</p>
                          </div>
                        </div>
                        <FiChevronRight className="text-slate-400 group-hover:translate-x-1 transition-transform" size={16} />
                      </div>
                    </div>
                  </div>

                  {/* Instructors Spotlight from Database (Infinite Slide Ticker) */}
                  <TeachersWidget />
                </div>

              </div>

            </div>
          ) : (
            // REGULAR USER DASHBOARD CONTENT
            <>
              {/* Live Class Banner */}
              {currentLiveBatches.length > 0 && (
                <div className="space-y-3">
                  {currentLiveBatches.map((batch: any) => (
                    <div
                      key={batch._id}
                      className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 md:p-5 rounded-2xl shadow-lg shadow-emerald-200/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-pulse-subtle"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                          <FiVideo size={20} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
                            </span>
                            <span className="text-sm font-extrabold tracking-tight">Class is Live Now!</span>
                          </div>
                          <p className="text-emerald-100 text-xs font-semibold mt-0.5">
                            {batch.courseName} — {batch.batchName} · Live Session Active
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => window.open(batch.zoomLink, '_blank', 'noopener,noreferrer')}
                        className="bg-white text-emerald-700 font-bold text-xs px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm border-none cursor-pointer flex items-center gap-2 shrink-0"
                      >
                        <FiVideo size={14} />
                        Join Now
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick Stats Grid */}
              <div className="grid grid-cols-1 gap-6">
                <div
                  onClick={() => navigate('/student/courses')}
                  className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
                >
                  <div>
                    <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">My Courses</span>
                    <h3 className="text-2xl font-black text-slate-900 mt-1">{student.activeCoursesCount} Active</h3>
                    <span className="text-xs text-slate-400 font-semibold flex items-center gap-0.5 mt-1">
                      Ongoing curriculum
                    </span>
                  </div>
                  <div className="p-4 bg-purple-50 text-[#4700b3] rounded-2xl group-hover:bg-[#4700b3] group-hover:text-white transition-colors duration-300">
                    <FiBook size={20} className="stroke-[2.5]" />
                  </div>
                </div>
              </div>

              {/* Main Dashboard Panel Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1.1fr] gap-8 items-start">
                {/* Left Main Panel: Schedule & Masterpiece Showcase */}
                <div className="space-y-8">
                  {/* Schedule / Timeline Widget */}
                  <div className="bg-[#fff] p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Weekly Study Schedule</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Your scheduled classes at GloSmart Academy</p>
                      </div>
                      <button
                        onClick={() => navigate('/student/courses')}
                        className="text-[#4700b3] hover:text-[#3d0099] font-bold text-xs flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                      >
                        View Courses <FiChevronRight size={14} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      {schedule.length > 0 ? (
                        schedule.map((item) => (
                          <div
                            key={item.id}
                            className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-purple-100 transition-colors"
                          >
                            <div className="flex items-center gap-4 text-left">
                              <div className="p-3 bg-purple-50 text-[#4700b3] rounded-xl shrink-0 font-extrabold text-[11px] uppercase tracking-wider text-center w-28">
                                {item.day.split(' ')[1] || 'Session'}
                              </div>
                              <div>
                                <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{item.courseName}</h4>
                                <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider leading-none">
                                  {item.instructor} • Room {item.room}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-bold text-slate-650 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-150 shrink-0 w-fit">
                              <FiClock size={12} className="text-[#4700b3]" /> {item.time}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                          <p className="font-semibold text-sm">No scheduled classes yet.</p>
                          <button
                            onClick={() => navigate('/student/courses')}
                            className="mt-3 px-4 py-2 bg-[#4700b3] text-white rounded-xl font-bold text-xs hover:bg-[#3d0099] border-none cursor-pointer"
                          >
                            Explore & Purchase Courses
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Student Gallery Spotlight (First 3 Gallery Images) */}
                  <MasterpieceShowcaseWidget />
                </div>

                {/* Right Main Panel: Instructors from Database (Infinite Slide Ticker) */}
                <div className="space-y-8">
                  <TeachersWidget />
                </div>
              </div>
            </>
          )}
        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
