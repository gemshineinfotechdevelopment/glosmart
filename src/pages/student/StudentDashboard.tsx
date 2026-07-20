import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiActivity, 
  FiBook, 
  FiClock, 
  FiTrendingUp, 
  FiChevronRight, 
  FiVolume2, 
  FiUserCheck, 
  FiMail,
  FiArrowRight,
  FiUser,
  FiCreditCard,
  FiImage,
  FiStar,
  FiVideo
} from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

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
    const profileId = user?.profileId || 'first';
    fetch(`http://127.0.0.1:5000/api/students/${profileId}`)
      .then(res => res.json())
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

  // Fetch batches for enrolled courses to detect live classes
  const [liveBatches, setLiveBatches] = useState<any[]>([]);

  useEffect(() => {
    if (student.enrolledCourses.length === 0) return;

    const fetchBatches = async () => {
      try {
        const coursesRes = await fetch('http://localhost:5000/api/courses');
        const coursesData = await coursesRes.json();
        const allCourses = coursesData.courses || [];

        const allBatches: any[] = [];
        for (const ec of student.enrolledCourses) {
          const matched = allCourses.find((c: any) =>
            c.courseName.toLowerCase() === ec.courseName.toLowerCase()
          );
          if (matched) {
            try {
              const batchRes = await fetch(`http://localhost:5000/api/batches/course/${matched._id}`);
              const batchData = await batchRes.json();
              for (const b of batchData) {
                if (b.zoomLink) {
                  allBatches.push({ ...b, courseName: ec.courseName });
                }
              }
            } catch (err) {
              console.error(`Error fetching batches for ${ec.courseName}:`, err);
            }
          }
        }
        setLiveBatches(allBatches);
      } catch (err) {
        console.error('Error fetching batch data for live check:', err);
      }
    };

    fetchBatches();
  }, [student.enrolledCourses]);

  // Check if a batch class is currently live
  const isBatchLive = (batch: any): boolean => {
    if (!batch.zoomLink || batch.status !== 'ACTIVE') return false;
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

  // Academy Announcements
  const announcements = [
    {
      id: 'a1',
      title: 'Annual Spring Art Exhibition 2026',
      desc: 'Submissions for the digital & traditional gallery are officially open. Submit your portfolio before August 10.',
      date: 'July 12, 2026',
      tag: 'Exhibition',
      tagColor: 'bg-purple-100 text-purple-700'
    },
    {
      id: 'a2',
      title: 'Academy Guest Lecture Series',
      desc: 'Join renowned digital designer Alex Thorne for a masterclass on VR Sculpting this Friday in Studio D.',
      date: 'July 10, 2026',
      tag: 'Masterclass',
      tagColor: 'bg-yellow-100 text-yellow-800'
    }
  ];

  // Derive Instructors list dynamically
  const instructors = student.enrolledCourses.length > 0
    ? Array.from(new Set(student.enrolledCourses.map((c: any) => c.instructor)))
        .filter(inst => inst && inst !== 'TBD' && inst !== 'TBD (Assigning)')
        .map((name: any) => {
          const course = student.enrolledCourses.find((c: any) => c.instructor === name);
          return { name, courseName: course ? course.courseName : 'Art Course' };
        })
    : [];

  // Recent Activity Logs
  const recentLogs = student.enrolledCourses.length > 0
    ? [
        {
          id: 'log1',
          action: 'Course Enrolled',
          detail: `Enrolled in ${student.enrolledCourses[student.enrolledCourses.length - 1].courseName}`,
          time: 'Recently'
        },
        ...student.enrolledCourses.slice(0, -1).map((c: any, idx: number) => ({
          id: `log-${idx + 2}`,
          action: 'Course Active',
          detail: `Currently enrolled in ${c.courseName}`,
          time: 'Ongoing'
        }))
      ]
    : [
        {
          id: 'log-empty',
          action: 'Account Registered',
          detail: 'Welcome to GloSmart Academy! Please purchase a course to get started.',
          time: 'Just Now'
        }
      ];

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pb-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard</h1>
            <p className="text-slate-500 text-[14px] mt-0.5">Welcome back, {student.name.split(' ')[0]}! Explore your progress.</p>
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
        </header>        {/* Outer Dashboard Content Container */}
        <div className="px-6 lg:px-10 mt-8 space-y-8 flex-1">
          
          {student.enrolledCourses.length === 0 ? (
            // REDESIGNED NEW USER DASHBOARD
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
                  
                  {/* Weekly Art Challenge */}
                  {/*<div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.01)] border border-amber-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 text-left">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                          <FiAward size={18} className="stroke-[2.5]" />
                        </span>
                        <span className="text-[10px] font-black text-amber-800 uppercase tracking-widest">Prompt of the week</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">"Summer Sunset Reflections" 🌅</h3>
                      <p className="text-slate-500 text-xs md:text-sm font-medium leading-relaxed max-w-xl">
                        Unleash your creativity! Sketch or paint a vibrant sunset showing warm light reflecting on water. Use oil pastels, watercolors, or digital brushes. Submit by Sunday evening to get featured!
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate('/student/courses')}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs transition-all shadow-sm border-none cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      Browse Inspiration <FiChevronRight size={14} />
                    </button>
                  </div>*/}

                  {/* Student Gallery Spotlight */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <FiImage size={20} className="text-[#4700b3]" />
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Academy Masterpiece Showcase</h3>
                      </div>
                      <span className="text-slate-400 text-xs font-semibold">Weekly Highlights</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      {/* Art 1 */}
                      <div className="space-y-2 group cursor-pointer">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                            alt="Floral Still Life" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">Watercolor</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 truncate">Floral Harmony</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">by Chloe Wang (Grade 6)</p>
                        </div>
                      </div>

                      {/* Art 2 */}
                      <div className="space-y-2 group cursor-pointer">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1541701494587-cb58502866ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                            alt="Abstract Fusion" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">Acrylic</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 truncate">Shattered Thoughts</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">by Ethan Davis (Grade 8)</p>
                        </div>
                      </div>

                      {/* Art 3 */}
                      <div className="space-y-2 group cursor-pointer">
                        <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 relative">
                          <img 
                            src="https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" 
                            alt="Digital Splash" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-2 right-2 bg-black/60 text-white text-[9px] font-bold px-2 py-0.5 rounded backdrop-blur-sm">Digital</span>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-800 truncate">Neon Dreams</h4>
                          <p className="text-[10px] text-slate-400 font-semibold">by Maya Patel (Grade 10)</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* General Announcements Widget */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <div className="flex items-center gap-2 mb-6">
                      <FiVolume2 size={20} className="text-[#4700b3]" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Academy Announcements</h3>
                    </div>

                    <div className="space-y-5">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="pb-5 border-b border-slate-100 last:border-none last:pb-0 text-left">
                          <div className="flex justify-between items-center gap-4 mb-2">
                            <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase ${ann.tagColor}`}>
                              {ann.tag}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{ann.date}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{ann.title}</h4>
                          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{ann.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

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

                  {/* Instructors Spotlight */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Our Art Instructors</h3>
                      <div className="flex items-center gap-0.5 text-amber-500 font-extrabold text-xs">
                        <FiStar className="fill-amber-500" size={12} /> <span>4.9 Avg</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {/* Teacher 1 */}
                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Sophia Martinez" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">Sophia Martinez</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">Digital Art & Design</p>
                          </div>
                        </div>
                        <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-450 rounded-lg transition-colors border-none cursor-pointer">
                          <FiMail size={13} />
                        </button>
                      </div>

                      {/* Teacher 2 */}
                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Liam Henderson" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">Liam Henderson</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">Traditional Sketching</p>
                          </div>
                        </div>
                        <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-450 rounded-lg transition-colors border-none cursor-pointer">
                          <FiMail size={13} />
                        </button>
                      </div>

                      {/* Teacher 3 */}
                      <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase relative overflow-hidden">
                            <img src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Olivia Chen" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-800 leading-none">Olivia Chen</p>
                            <p className="text-[9px] text-slate-400 font-semibold mt-1">3D Sculpting & Clay</p>
                          </div>
                        </div>
                        <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-450 rounded-lg transition-colors border-none cursor-pointer">
                          <FiMail size={13} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity Log Widget */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-5">Recent Activity</h3>
                    
                    <div className="space-y-4">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-left">
                          <div className="p-2 bg-purple-50 text-[#4700b3] rounded-xl h-8 w-8 flex items-center justify-center shrink-0 mt-0.5">
                            <FiUserCheck size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight truncate">
                              {log.action}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {log.detail}
                            </p>
                            <span className="text-[9px] text-slate-400 font-bold block mt-1">
                              {log.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

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
                            {batch.courseName} — {batch.batchName} ({batch.startTime} - {batch.endTime})
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
                
                {/* Stat 2: Active Courses */}
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
                
                {/* Left Main Panel: Schedule & Announcements */}
                <div className="space-y-8">
                  
                  {/* Schedule / Timeline Widget */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
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

                  {/* Recent Announcements Widget */}
                  <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <div className="flex items-center gap-2 mb-6">
                      <FiVolume2 size={20} className="text-[#4700b3]" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Academy Announcements</h3>
                    </div>

                    <div className="space-y-5">
                      {announcements.map((ann) => (
                        <div key={ann.id} className="pb-5 border-b border-slate-100 last:border-none last:pb-0 text-left">
                          <div className="flex justify-between items-center gap-4 mb-2">
                            <span className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-md uppercase ${ann.tagColor}`}>
                              {ann.tag}
                            </span>
                            <span className="text-[10px] text-slate-400 font-semibold">{ann.date}</span>
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm">{ann.title}</h4>
                          <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{ann.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Right Main Panel: Course Progress Spotlight & Log Tracker */}
                <div className="space-y-8">
                  
                  {/* Recent Activity Log Widget */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-5">Recent Activity</h3>
                    
                    <div className="space-y-4">
                      {recentLogs.map((log) => (
                        <div key={log.id} className="flex gap-3 text-left">
                          <div className="p-2 bg-purple-50 text-[#4700b3] rounded-xl h-8 w-8 flex items-center justify-center shrink-0 mt-0.5">
                            <FiUserCheck size={14} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-extrabold text-slate-800 leading-tight truncate">
                              {log.action}
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium truncate mt-0.5">
                              {log.detail}
                            </p>
                            <span className="text-[9px] text-slate-400 font-bold block mt-1">
                              {log.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick Action Instructors Contact Widget */}
                  <div className="bg-white p-6 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex flex-col text-left">
                    <h3 className="text-lg font-black text-slate-900 tracking-tight mb-4">My Instructors</h3>
                    
                    <div className="space-y-3">
                      {instructors.length > 0 ? (
                        instructors.map((instructor: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-purple-100 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase">
                                {instructor.name.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-800 leading-none">{instructor.name}</p>
                                <p className="text-[9px] text-slate-400 font-semibold mt-1">{instructor.courseName}</p>
                              </div>
                            </div>
                            <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-400 rounded-lg transition-colors border-none cursor-pointer">
                              <FiMail size={14} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-slate-400 italic text-center py-4">No instructors assigned yet.</p>
                      )}
                    </div>
                  </div>

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
