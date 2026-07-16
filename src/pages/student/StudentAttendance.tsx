import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  FiCheck, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight,
  FiBook,
  FiUser,
  FiFileText,
  FiAward
} from 'react-icons/fi';

interface AttendanceDay {
  day: number;
  status: 'present' | 'absent' | 'late' | 'holiday';
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Calendar month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  
  const [attendanceRate, setAttendanceRate] = useState(100);
  const [totalPresent, setTotalPresent] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [studentName, setStudentName] = useState('Student User');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);

  // Fetch student data on mount
  useEffect(() => {
    const profileId = user?.profileId || 'first';
    fetch(`http://127.0.0.1:5000/api/students/${profileId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const records = data.attendanceRecords || [];
          setAttendanceRecords(records);
          
          let rate = 0;
          let presentCount = 0;
          let absentCount = 0;
          let sessionsCount = 0;

          if (data.name === 'Sarah Jenkins') {
            rate = data.attendanceRate || 100;
            presentCount = 114;
            absentCount = 2;
            sessionsCount = 118;
            setCurrentDate(new Date(2023, 9, 1)); // October 2023 for demo student
          } else {
            sessionsCount = records.length;
            presentCount = records.filter((r: any) => r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late').length;
            absentCount = records.filter((r: any) => r.status.toLowerCase() === 'absent').length;
            if (sessionsCount > 0) {
              rate = Math.round((presentCount / sessionsCount) * 100);
            } else {
              rate = 100; // Default to 100% when no sessions have happened yet
            }
            setCurrentDate(new Date());
          }

          setAttendanceRate(rate);
          setTotalPresent(presentCount);
          setTotalAbsent(absentCount);
          setTotalSessions(sessionsCount);
          setStudentName(data.name || 'Student User');
          setStudentGrade(data.grade || '5th Grade');
          setStudentAvatar(data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
          setEnrolledCourses(data.enrolledCourses || []);
        }
      })
      .catch(err => console.error('Error fetching student attendance details:', err));
  }, [user]);



  // Month navigation
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get start day of month (0 = Sun, 1 = Mon, ..., 6 = Sat)
  const startDayOfWeek = new Date(year, month, 1).getDay();
  // Adjust so Monday is 0, Sunday is 6
  const adjustedStartDay = startDayOfWeek === 0 ? 6 : startDayOfWeek - 1;

  // Get total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();

  // Hardcode attendance status for October 2023 to match the exact mockup for demo student
  // Sunday starts, Monday starts... Let's map days
  const getDayStatus = (d: number): 'present' | 'absent' | 'late' | 'holiday' => {
    if (studentName === 'Sarah Jenkins') {
      if (year === 2023 && month === 9) { // October 2023
        // Custom mapping based on screenshot
        const absentDays = [1, 3, 6, 7, 17, 22, 24, 27];
        const lateDays = [9, 11, 13, 16, 23, 29];
        const holidayDays: number[] = []; // In screenshot, weekends have statuses, let's keep some holiday days as example if needed, or follow image
        
        if (absentDays.includes(d)) return 'absent';
        if (lateDays.includes(d)) return 'late';
        if (holidayDays.includes(d)) return 'holiday';
        return 'present';
      }

      // Fallback/Deterministic generator for other months for demo student
      const dayOfWeek = new Date(year, month, d).getDay();
      if (dayOfWeek === 0) return 'holiday'; // Sundays are holidays
      
      // Pseudo-random but consistent generator
      const hash = (d * 17 + month * 31 + year) % 10;
      if (hash === 1) return 'absent';
      if (hash === 2) return 'late';
      return 'present';
    }

    // For new students, check their actual database attendance records
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const record = attendanceRecords.find(r => r.date === formattedDate);
    if (record) {
      if (record.status.toLowerCase() === 'present') return 'present';
      if (record.status.toLowerCase() === 'absent') return 'absent';
      if (record.status.toLowerCase() === 'late') return 'late';
    }

    // Default to holiday/blank for Sundays or non-marked days for new students
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0) return 'holiday';
    return 'holiday'; // Show unmarked days as greyed out holiday/no class
  };

  // Generate calendar cells
  const calendarCells: (AttendanceDay | null)[] = [];
  
  // Empty slots before the first day of the month
  for (let i = 0; i < adjustedStartDay; i++) {
    calendarCells.push(null);
  }

  // Days of the month
  for (let d = 1; d <= totalDays; d++) {
    calendarCells.push({
      day: d,
      status: getDayStatus(d)
    });
  }



  return (
    <div className="flex min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen relative overflow-x-hidden pb-12">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-6 lg:px-10 py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Insight</h1>
            <p className="text-slate-500 text-[14px] mt-0.5">Track your class engagement and active status</p>
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
        </header>        {/* Outer Container */}
        <div className="px-6 lg:px-10 mt-8 space-y-8 flex-1">
          {totalSessions === 0 && studentName !== 'Sarah Jenkins' ? (
            // Onboarding/Welcome Dashboard for new students
            <div className="bg-gradient-to-br from-[#4700b3]/5 to-[#6247df]/5 border border-purple-100 rounded-[2.5rem] p-8 md:p-12 text-center max-w-4xl mx-auto shadow-[0_20px_50px_rgba(71,0,179,0.02)]">
              <div className="w-20 h-20 bg-purple-100 text-[#4700b3] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                <FiAward size={40} className="stroke-[1.5]" />
              </div>
              
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
                Welcome to GloSmart Academy, <span className="text-[#4700b3]">{studentName}</span>! 🎨
              </h2>
              <p className="text-slate-500 text-sm md:text-base font-medium max-w-xl mx-auto mt-4 leading-relaxed">
                Your creative journey is just getting started. Once your first class session is scheduled and marked by your instructor, your attendance logs, class history, and engagement analytics will automatically sync here.
              </p>

              <div className="w-full h-px bg-slate-100 my-10"></div>

              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Quick steps to get started</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                {/* Step 1 */}
                <div 
                  onClick={() => navigate('/student/courses')}
                  className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:border-[#4700b3]/25 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-indigo-50 text-[#4700b3] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiBook size={20} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    Explore Courses <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Browse our syllabus and enroll in digital paint, sketching, or 3D classes.
                  </p>
                </div>

                {/* Step 2 */}
                <div 
                  onClick={() => navigate('/student/profile')}
                  className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:border-[#4700b3]/25 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiUser size={20} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    Complete Profile <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Set up your personal details, age, avatar, and parent contact information.
                  </p>
                </div>

                {/* Step 3 */}
                <div 
                  onClick={() => navigate('/student/fees')}
                  className="bg-white rounded-3xl border border-slate-100 p-6 hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] hover:border-[#4700b3]/25 transition-all cursor-pointer group"
                >
                  <div className="w-12 h-12 bg-teal-50 text-teal-650 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <FiFileText size={20} className="stroke-[2.5]" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1">
                    Manage Invoices <FiChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={14} />
                  </h4>
                  <p className="text-slate-500 text-xs font-medium leading-relaxed">
                    Verify enrollment receipts, download statements, and complete pending payments.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <>
              {/* First Row: 3 Metric Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                
                {/* Card 1: Overall Attendance */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col items-center justify-between min-h-[220px]">
                  <h3 className="text-slate-700 text-sm font-semibold self-start">Overall Attendance</h3>
                  
                  <div className="relative flex items-center justify-center my-2">
                    {/* SVG Progress Circle */}
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="48" 
                        stroke="#F1F5F9" 
                        strokeWidth="10" 
                        fill="transparent" 
                      />
                      <circle 
                        cx="64" 
                        cy="64" 
                        r="48" 
                        stroke="#4700b3" 
                        strokeWidth="10" 
                        fill="transparent" 
                        strokeDasharray={301.6} 
                        strokeDashoffset={301.6 - (301.6 * attendanceRate) / 100}
                        strokeLinecap="round"
                      />
                    </svg>
                    {/* Inner Text */}
                    <div className="absolute text-center">
                      <span className="text-[28px] font-black text-slate-900 block leading-none">{attendanceRate}%</span>
                      <span className="text-xs font-bold text-[#4700b3] mt-1 block">
                        {attendanceRate >= 90 ? 'Excellent!' : attendanceRate >= 75 ? 'Good Job!' : 'Needs Action'}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs text-center font-medium leading-relaxed max-w-[200px]">
                    {studentName === 'Sarah Jenkins' 
                      ? "You've missed only 2 days this semester. Keep it up!" 
                      : totalSessions === 0 
                        ? "No attendance records registered yet." 
                        : `You've missed ${totalAbsent} day${totalAbsent === 1 ? '' : 's'} this semester.`}
                  </p>
                </div>

                {/* Card 2: Total Present */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#EEF2F6] text-[#4700b3] rounded-2xl">
                      <FiCheck size={22} className="stroke-[2.5]" />
                    </div>
                    <div className="text-left">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Present</p>
                      <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">{totalPresent} <span className="text-slate-400 text-sm font-medium">/ {totalSessions}</span></h2>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: `${totalSessions > 0 ? (totalPresent / totalSessions) * 100 : 0}%` }}></div>
                    </div>
                    <p className="text-slate-500 text-xs font-medium">
                      {totalSessions > 0 ? `${attendanceRate}%` : '0%'} Attendance rate in scheduled sessions
                    </p>
                  </div>
                </div>

                {/* Card 3: Total Absent */}
                <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col justify-between min-h-[220px]">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-50 text-red-650 rounded-2xl">
                      <FiX size={22} className="stroke-[2.5]" />
                    </div>
                    <div className="text-left">
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Absent</p>
                      <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">{String(totalAbsent).padStart(2, '0')}</h2>
                    </div>
                  </div>

                  <p className="text-slate-500 text-xs font-medium">Please notify in advance for planned absences.</p>
                </div>

              </div>

              {/* Second Row: Calendar */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 sm:p-8 flex flex-col">
                
                {/* Calendar Header */}
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-slate-900 font-extrabold text-lg tracking-tight">
                      {monthNames[month]} {year}
                    </h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">Academic Year 2023-24</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePrevMonth}
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer bg-white"
                    >
                      <FiChevronLeft className="text-slate-600" size={18} />
                    </button>
                    <button 
                      onClick={handleNextMonth}
                      className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer bg-white"
                    >
                      <FiChevronRight className="text-slate-600" size={18} />
                    </button>
                  </div>
                </div>

                {/* Days of Week grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 mb-4 text-center">
                  {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map((d) => {
                    let textClass = "text-slate-400";
                    if (d === 'SAT') textClass = "text-teal-600 font-bold";
                    if (d === 'SUN') textClass = "text-red-500 font-bold";
                    return (
                      <div key={d} className={`text-xs font-bold tracking-wider ${textClass}`}>
                        {d}
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 sm:gap-4 flex-1">
                  {calendarCells.map((cell, idx) => {
                    if (!cell) {
                      return <div key={`empty-${idx}`} className="aspect-square bg-slate-50/20 rounded-xl"></div>;
                    }

                    // Determine dot styling based on status
                    let dotColor = "bg-transparent";
                    if (cell.status === 'present') dotColor = "bg-[#4700b3]";
                    if (cell.status === 'absent') dotColor = "bg-red-500";
                    if (cell.status === 'late') dotColor = "bg-teal-500";
                    if (cell.status === 'holiday') dotColor = "border border-slate-300 bg-white";

                    return (
                      <div 
                        key={`day-${cell.day}`} 
                        className="aspect-square rounded-2xl border border-slate-100 flex flex-col items-center justify-center p-1 sm:p-2 hover:bg-slate-50 transition-colors relative group"
                      >
                        <span className="text-sm font-bold text-slate-800">{cell.day}</span>
                        <span className={`w-1.5 h-1.5 rounded-full mt-1.5 ${dotColor}`}></span>
                        
                        {/* Tooltip on hover */}
                        <div className="absolute bottom-full mb-1 scale-0 group-hover:scale-100 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-md transition-all shadow-lg z-10 pointer-events-none capitalize">
                          {cell.status}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Calendar Legend */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 mt-8 pt-6 border-t border-slate-100 justify-start text-xs font-semibold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4700b3]"></span>
                    <span>Present</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                    <span>Absent</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-slate-350 bg-white"></span>
                    <span>Holiday</span>
                  </div>
                </div>

              </div>

              {/* Third Row: Course-wise Attendance table */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 sm:p-8">
                <h3 className="text-slate-900 font-extrabold text-base tracking-tight mb-6">Course-wise Attendance</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-left">
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider pl-4">Course Name</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Present</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Absent</th>
                        <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right pr-4">Percentage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-sans">
                      
                      {enrolledCourses.length > 0 ? (
                        enrolledCourses.map((c: any, index: number) => {
                          let rate = 100;
                          let present = 0;
                          let absent = 0;

                          if (studentName === 'Sarah Jenkins') {
                            rate = index === 0 ? 96 : index === 1 ? 97 : 100;
                            present = index === 0 ? 24 : index === 1 ? 30 : 28;
                            absent = index === 0 ? 0 : index === 1 ? 1 : 0;
                          } else {
                            // Filter records matching the course name (in activity)
                            const courseRecords = attendanceRecords.filter((r: any) => 
                              r.activity && r.activity.toLowerCase() === c.courseName.toLowerCase()
                            );
                            if (courseRecords.length > 0) {
                              present = courseRecords.filter((r: any) => r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late').length;
                              absent = courseRecords.filter((r: any) => r.status.toLowerCase() === 'absent').length;
                              rate = Math.round((present / courseRecords.length) * 100);
                            } else {
                              rate = 100;
                              present = 0;
                              absent = 0;
                            }
                          }
                          return (
                            <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                              <td className="py-4 pl-4 font-bold text-slate-800 text-xs">{c.courseName}</td>
                              <td className="py-4 text-xs font-semibold text-slate-500">{c.instructor || 'TBD'}</td>
                              <td className="py-4 text-xs font-bold text-slate-700 text-center">{present}</td>
                              <td className="py-4 text-xs font-bold text-slate-700 text-center">{absent}</td>
                              <td className="py-4 pr-4">
                                <div className="flex items-center justify-end gap-3">
                                  <span className="text-xs font-extrabold text-[#4700b3]">{rate}%</span>
                                  <div className="w-24 bg-slate-100 rounded-full h-2 hidden sm:block">
                                    <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: `${rate}%` }}></div>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-8 text-center text-slate-400 italic">No courses enrolled yet.</td>
                        </tr>
                      )}

                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>



      </main>
    </div>
  );
};

export default StudentAttendance;
