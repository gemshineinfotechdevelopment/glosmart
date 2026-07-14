import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheck, 
  FiX, 
  FiChevronLeft, 
  FiChevronRight
} from 'react-icons/fi';

interface AttendanceDay {
  day: number;
  status: 'present' | 'absent' | 'late' | 'holiday';
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();
  // Calendar month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2023, 9, 1)); // October 2023
  
  const [attendanceRate, setAttendanceRate] = useState(98);
  const [studentName, setStudentName] = useState('Sarah Jenkins');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');

  // Fetch student data on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/students/first')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setAttendanceRate(data.attendanceRate || 98);
          setStudentName(data.name || 'Sarah Jenkins');
          setStudentGrade(data.grade || '5th Grade');
          setStudentAvatar(data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
        }
      })
      .catch(err => console.error('Error fetching student attendance details:', err));
  }, []);



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

  // Hardcode attendance status for October 2023 to match the exact mockup
  // Sunday starts, Monday starts... Let's map days
  const getDayStatus = (d: number): 'present' | 'absent' | 'late' | 'holiday' => {
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

    // Fallback/Deterministic generator for other months
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0) return 'holiday'; // Sundays are holidays
    
    // Pseudo-random but consistent generator
    const hash = (d * 17 + month * 31 + year) % 10;
    if (hash === 1) return 'absent';
    if (hash === 2) return 'late';
    return 'present';
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
        </header>

        {/* Outer Container */}
        <div className="px-6 lg:px-10 mt-8 space-y-8 flex-1">
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
                  <span className="text-xs font-bold text-[#4700b3] mt-1 block">Excellent!</span>
                </div>
              </div>

              <p className="text-slate-500 text-xs text-center font-medium leading-relaxed max-w-[200px]">
                You've missed only 2 days this semester. Keep it up!
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
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">114 <span className="text-slate-400 text-sm font-medium">/ 118</span></h2>
                </div>
              </div>

              <div className="space-y-2">
                <div className="w-full bg-slate-100 rounded-full h-2">
                  <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: '96.6%' }}></div>
                </div>
                <p className="text-slate-500 text-xs font-medium">96.6% Attendance rate in scheduled sessions</p>
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
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">02</h2>
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
                  
                  {/* Row 1 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-800 text-xs">Advanced Oil Painting</td>
                    <td className="py-4 text-xs font-semibold text-slate-500">Prof. Sarah Jenkins</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">24</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">0</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-extrabold text-[#4700b3]">96%</span>
                        <div className="w-24 bg-slate-100 rounded-full h-2 hidden sm:block">
                          <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: '96%' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-800 text-xs">Introduction to Sculpture</td>
                    <td className="py-4 text-xs font-semibold text-slate-500">Michael Rossi</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">30</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">1</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-extrabold text-[#4700b3]">97%</span>
                        <div className="w-24 bg-slate-100 rounded-full h-2 hidden sm:block">
                          <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: '97%' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 pl-4 font-bold text-slate-800 text-xs">Anatomy for Artists</td>
                    <td className="py-4 text-xs font-semibold text-slate-500">Dr. Elena Kostic</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">28</td>
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">0</td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center justify-end gap-3">
                        <span className="text-xs font-extrabold text-[#4700b3]">100%</span>
                        <div className="w-24 bg-slate-100 rounded-full h-2 hidden sm:block">
                          <div className="bg-[#4700b3] h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    </td>
                  </tr>

                </tbody>
              </table>
            </div>
          </div>

        </div>



      </main>
    </div>
  );
};

export default StudentAttendance;
