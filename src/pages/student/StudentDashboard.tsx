import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { 
  FiActivity, 
  FiBook, 
  FiClock, 
  FiTrendingUp, 
  FiChevronRight, 
  FiVolume2, 
  FiUserCheck, 
  FiMail
} from 'react-icons/fi';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Student state
  const [student, setStudent] = useState({
    name: 'Sarah Jenkins',
    grade: '5th Grade',
    attendance: '98%',
    activeCoursesCount: 3,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
  });

  useEffect(() => {
    fetch('http://localhost:5000/api/students/first')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStudent({
            name: data.name || 'Sarah Jenkins',
            grade: data.grade || '5th Grade',
            attendance: (data.attendanceRate || 98) + '%',
            activeCoursesCount: data.enrolledCourses ? data.enrolledCourses.length : 3,
            avatar: data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80'
          });
        }
      })
      .catch(err => console.error('Error fetching student data:', err));
  }, []);

  // Schedule Timeline
  const schedule = [
    {
      id: 's1',
      time: '09:00 AM - 11:30 AM',
      courseName: 'Advanced Oil Painting',
      room: 'Studio A',
      instructor: 'Prof. Sarah Jenkins',
      day: 'Every Wednesday'
    },
    {
      id: 's2',
      time: '02:00 PM - 04:30 PM',
      courseName: 'Introduction to Sculpture',
      room: 'Sculpture Barn',
      instructor: 'Michael Rossi',
      day: 'Every Friday'
    },
    {
      id: 's3',
      time: '11:30 AM - 01:00 PM',
      courseName: 'Anatomy for Artists',
      room: 'Lecture Hall 2',
      instructor: 'Dr. Elena Kostic',
      day: 'Every Monday'
    }
  ];

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

  // Recent Activity Logs
  const recentLogs = [
    {
      id: 'log1',
      action: 'Submitted Assignment',
      detail: 'Color Theory & Emotional Impact Analysis',
      time: '2 hours ago'
    },
    {
      id: 'log2',
      action: 'Attendance Checked',
      detail: 'Marked Present in Advanced Oil Painting',
      time: 'Yesterday'
    },
    {
      id: 'log3',
      action: 'Payment Successful',
      detail: 'Semester Tuition Invoice #INV-9883',
      time: '3 days ago'
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
            <img 
              src={student.avatar} 
              alt={student.name} 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-sm cursor-pointer"
              onClick={() => navigate('/student/profile')}
            />
          </div>
        </header>

        {/* Outer Dashboard Content Container */}
        <div className="px-6 lg:px-10 mt-8 space-y-8 flex-1">
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Stat 1: Attendance */}
            <div 
              onClick={() => navigate('/student/attendance')}
              className="bg-white p-6 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] border border-slate-100 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow group"
            >
              <div>
                <span className="text-slate-400 font-bold text-xs uppercase tracking-wider">Attendance</span>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{student.attendance}</h3>
                <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-0.5 mt-1">
                  <FiTrendingUp size={12} /> Excellent Standing
                </span>
              </div>
              <div className="p-4 bg-purple-50 text-[#4700b3] rounded-2xl group-hover:bg-[#4700b3] group-hover:text-white transition-colors duration-300">
                <FiActivity size={20} className="stroke-[2.5]" />
              </div>
            </div>

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
                  {schedule.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between md:items-center gap-4 hover:border-purple-100 transition-colors"
                    >
                      <div className="flex items-center gap-4 text-left">
                        <div className="p-3 bg-purple-50 text-[#4700b3] rounded-xl shrink-0 font-extrabold text-[11px] uppercase tracking-wider text-center w-28">
                          {item.day.split(' ')[1]}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{item.courseName}</h4>
                          <p className="text-slate-400 text-[11px] font-bold mt-1 uppercase tracking-wider leading-none">
                            {item.instructor} • Room {item.room}
                          </p>
                        </div>
                      </div>
                      
                      <span className="text-xs font-bold text-slate-600 flex items-center gap-1 bg-white px-3 py-1.5 rounded-lg border border-slate-150 shrink-0 w-fit">
                        <FiClock size={12} className="text-[#4700b3]" /> {item.time}
                      </span>
                    </div>
                  ))}
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
                  <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase">
                        S
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-none">Prof. Sarah Jenkins</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Oil Painting</p>
                      </div>
                    </div>
                    <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-400 rounded-lg transition-colors border-none cursor-pointer">
                      <FiMail size={14} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-all">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-[#4700b3] flex items-center justify-center font-bold text-xs uppercase">
                        M
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 leading-none">Michael Rossi</p>
                        <p className="text-[9px] text-slate-400 font-semibold mt-1">Sculpture</p>
                      </div>
                    </div>
                    <button className="p-2 bg-slate-50 hover:bg-[#e6e6fa] hover:text-[#4700b3] text-slate-400 rounded-lg transition-colors border-none cursor-pointer">
                      <FiMail size={14} />
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>

        </div>

      </main>
    </div>
  );
};

export default StudentDashboard;
