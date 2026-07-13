import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useNavigate } from 'react-router-dom';
import { 
  FiCheck, 
  FiX, 
  FiClock, 
  FiChevronLeft, 
  FiChevronRight, 
  FiCalendar, 
  FiAlertCircle,
  FiSend,
  FiActivity
} from 'react-icons/fi';

interface AttendanceDay {
  day: number;
  status: 'present' | 'absent' | 'late' | 'holiday';
}

interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedOn: string;
}

const StudentAttendance: React.FC = () => {
  const navigate = useNavigate();
  // Calendar month state
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2023, 9, 1)); // October 2023
  
  // Leave request modal state
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveType, setLeaveType] = useState('Excused');
  const [leaveReason, setLeaveReason] = useState('');
  const [studentId, setStudentId] = useState('');
  const [attendanceRate, setAttendanceRate] = useState(98);
  const [studentName, setStudentName] = useState('Sarah Jenkins');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [studentAvatar, setStudentAvatar] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');

  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch student data on mount
  useEffect(() => {
    fetch('http://localhost:5000/api/students/first')
      .then(res => res.json())
      .then(data => {
        if (data) {
          setStudentId(data._id);
          setAttendanceRate(data.attendanceRate || 98);
          setStudentName(data.name || 'Sarah Jenkins');
          setStudentGrade(data.grade || '5th Grade');
          setStudentAvatar(data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80');
          
          if (data.leaveRequests && data.leaveRequests.length > 0) {
            setLeaveRequests(data.leaveRequests);
          } else {
            const defaultLeave: LeaveRequest[] = [
              {
                id: 'LR-9981',
                startDate: '2026-07-06',
                endDate: '2026-07-06',
                type: 'Excused',
                reason: 'Medical checkup',
                status: 'Approved',
                appliedOn: '2026-07-04'
              }
            ];
            setLeaveRequests(defaultLeave);
            // Save it
            fetch(`http://localhost:5000/api/students/${data._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ leaveRequests: defaultLeave })
            });
          }
        }
      })
      .catch(err => console.error('Error fetching student attendance details:', err));
  }, []);

  // Log details modal state
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [isLateDetailsOpen, setIsLateDetailsOpen] = useState(false);

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

  // Handle submit leave
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) {
      alert("Please fill in all fields.");
      return;
    }
    const newRequest: LeaveRequest = {
      id: `LR-${Math.floor(1000 + Math.random() * 9000)}`,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      type: leaveType,
      reason: leaveReason,
      status: 'Pending',
      appliedOn: new Date().toISOString().split('T')[0]
    };
    
    const updated = [newRequest, ...leaveRequests];
    setLeaveRequests(updated);

    // Save to DB
    fetch(`http://localhost:5000/api/students/${studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leaveRequests: updated })
    })
      .catch(err => console.error('Error saving leave request to database:', err));

    setIsLeaveModalOpen(false);
    
    // Clear inputs
    setLeaveStartDate('');
    setLeaveEndDate('');
    setLeaveReason('');
    
    // Toast
    setToastMessage('Leave request submitted successfully!');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 4000);
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
          
          {/* Toast Notification */}
          {showToast && (
            <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
              <div className="p-1 bg-[#4700b3] text-white rounded-full">
                <FiCheck size={16} />
              </div>
              <span className="font-semibold text-sm">{toastMessage}</span>
            </div>
          )}

          {/* First Row: 4 Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            
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
                <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                  <FiX size={22} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Absent</p>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">02</h2>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-50">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-red-500">Excused: 1</span>
                  <span className="text-slate-350">•</span>
                  <span className="text-amber-600">Unexcused: 1</span>
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  <span className="w-full bg-red-100 h-1.5 rounded-full"></span>
                  <span className="w-full bg-amber-100 h-1.5 rounded-full"></span>
                </div>
              </div>
            </div>

            {/* Card 4: Total Late */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col justify-between min-h-[220px]">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-teal-50 text-teal-600 rounded-2xl">
                  <FiClock size={22} className="stroke-[2.5]" />
                </div>
                <div className="text-left">
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Total Late</p>
                  <h2 className="text-3xl font-black text-slate-950 tracking-tight mt-0.5">02</h2>
                </div>
              </div>

              <button 
                onClick={() => setIsLateDetailsOpen(true)}
                className="w-full text-left flex items-center justify-between text-teal-600 hover:text-teal-700 transition-colors font-bold text-xs bg-teal-50/50 hover:bg-teal-50 p-3 rounded-xl border border-teal-100/50 cursor-pointer"
              >
                <span>View Details</span>
                <FiChevronRight size={16} />
              </button>
            </div>

          </div>

          {/* Second Row: Calendar (Left) & Actions (Right) */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Left/Middle Calendar column */}
            <div className="xl:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 sm:p-8 flex flex-col">
              
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
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
                  <span>Late</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-350 bg-white"></span>
                  <span>Holiday</span>
                </div>
              </div>

            </div>

            {/* Right side options column */}
            <div className="space-y-6 flex flex-col justify-between">
              
              {/* Card 1: Leave Planning */}
              <div className="bg-[#4700b3] rounded-3xl p-6 text-white flex flex-col justify-between shadow-[0_12px_24px_rgba(71,0,179,0.15)] relative overflow-hidden flex-1 min-h-[220px]">
                {/* Background decorative blob */}
                <div className="absolute -right-10 -bottom-10 w-36 h-36 bg-white/5 rounded-full blur-2xl"></div>
                
                <div>
                  <h3 className="text-xl font-extrabold tracking-tight">Planning a break?</h3>
                  <p className="text-white/80 text-xs font-medium mt-3 leading-relaxed">
                    Submit your leave requests at least 48 hours in advance for approval.
                  </p>
                </div>

                <button 
                  onClick={() => setIsLeaveModalOpen(true)}
                  className="w-full bg-white text-[#4700b3] py-3.5 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors border-none cursor-pointer mt-6 shadow-sm"
                >
                  <FiCalendar size={18} /> Request Leave
                </button>
              </div>

              {/* Card 2: Recent Logs */}
              <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex flex-col justify-between flex-1 min-h-[260px]">
                <h3 className="text-slate-900 font-extrabold text-base tracking-tight mb-4">Recent Logs</h3>
                
                <div className="space-y-4">
                  
                  {/* Log 1 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-55/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F3EEFF] text-[#4700b3] rounded-xl">
                        <FiActivity size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">Painting 101</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Today, 09:00 AM</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#4700b3] bg-[#F3EEFF] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Present
                    </span>
                  </div>

                  {/* Log 2 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-55/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
                        <FiClock size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">Art History</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Yesterday, 02:00 PM</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-teal-600 bg-teal-50 px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Late (12m)
                    </span>
                  </div>

                  {/* Log 3 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-55/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#F3EEFF] text-[#4700b3] rounded-xl">
                        <FiActivity size={18} />
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-bold text-slate-800">Digital Media</h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">Oct 26, 11:30 AM</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-extrabold text-[#4700b3] bg-[#F3EEFF] px-2.5 py-1 rounded-full uppercase tracking-wide">
                      Present
                    </span>
                  </div>

                </div>

                <button 
                  onClick={() => setIsLogsModalOpen(true)}
                  className="w-full text-center text-[#4700b3] hover:text-[#3d0099] font-bold text-xs mt-4 py-2 hover:bg-slate-50 rounded-xl transition-all border-none bg-transparent cursor-pointer"
                >
                  View All Logs
                </button>
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
                    <th className="pb-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Late</th>
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
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">1</td>
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
                    <td className="py-4 text-xs font-bold text-slate-700 text-center">0</td>
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

        {/* Modal: Request Leave */}
        {isLeaveModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
              {/* Modal Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiCalendar size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Request Leave</h3>
                </div>
                <button 
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleRequestLeave} className="p-6 space-y-4 overflow-y-auto flex-1 text-left">
                
                {/* Leave Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Leave Type</label>
                  <select 
                    value={leaveType}
                    onChange={(e) => setLeaveType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                  >
                    <option value="Excused">Excused (Medical/Sick/Family)</option>
                    <option value="Casual">Casual Leave</option>
                    <option value="Other">Other Reason</option>
                  </select>
                </div>

                {/* Date Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Start Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveStartDate}
                      onChange={(e) => setLeaveStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">End Date</label>
                    <input 
                      type="date"
                      required
                      value={leaveEndDate}
                      onChange={(e) => setLeaveEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    />
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reason</label>
                  <textarea 
                    required
                    rows={3}
                    placeholder="Provide details about your absence request..."
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3] resize-none"
                  ></textarea>
                </div>

                {/* Notice Text */}
                <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-2xl border border-amber-100 text-[11px] font-semibold leading-relaxed">
                  <FiAlertCircle size={18} className="shrink-0 mt-0.5" />
                  <p>All leave requests will be sent to the academy administration for approval. You will receive an email status update once processed.</p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-2">
                  <button 
                    type="button"
                    onClick={() => setIsLeaveModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold transition-all border-none cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#4700b3] hover:bg-[#3d0099] text-white py-3.5 rounded-2xl font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm"
                  >
                    <FiSend size={16} /> Submit
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* Modal: View All Logs */}
        {isLogsModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[550px] overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
              
              {/* Modal Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiActivity size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">All Attendance Logs</h3>
                </div>
                <button 
                  onClick={() => setIsLogsModalOpen(false)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-4 text-left">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Logs for October 2023</p>
                
                <div className="divide-y divide-slate-100 max-h-[350px] overflow-y-auto pr-1">
                  {[
                    { name: "Painting 101", date: "Oct 31, 09:00 AM", status: "Present" },
                    { name: "Anatomy for Artists", date: "Oct 30, 11:30 AM", status: "Present" },
                    { name: "Advanced Oil Painting", date: "Oct 29, 09:00 AM", status: "Late" },
                    { name: "Introduction to Sculpture", date: "Oct 27, 02:00 PM", status: "Absent" },
                    { name: "Digital Media", date: "Oct 26, 11:30 AM", status: "Present" },
                    { name: "Painting 101", date: "Oct 24, 09:00 AM", status: "Absent" },
                    { name: "Advanced Oil Painting", date: "Oct 23, 09:00 AM", status: "Late" },
                    { name: "Art History", date: "Oct 22, 02:00 PM", status: "Absent" },
                  ].map((log, index) => (
                    <div key={index} className="flex justify-between items-center py-3">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{log.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{log.date}</p>
                      </div>
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                        log.status === 'Present' ? 'bg-[#F3EEFF] text-[#4700b3]' :
                        log.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-teal-50 text-teal-600'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex">
                  <button 
                    onClick={() => setIsLogsModalOpen(false)}
                    className="w-full bg-[#4700b3] hover:bg-[#3d0099] text-white py-3 rounded-2xl font-bold transition-all border-none cursor-pointer text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Modal: View Late Details */}
        {isLateDetailsOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[450px] overflow-hidden border border-slate-100 flex flex-col">
              
              {/* Header */}
              <div className="p-6 bg-teal-600 text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiClock size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Late Logs Details</h3>
                </div>
                <button 
                  onClick={() => setIsLateDetailsOpen(false)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                  You have recorded late entries for the following classes this semester:
                </p>

                <div className="space-y-3">
                  <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100/50 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Advanced Oil Painting</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Oct 29, 09:00 AM</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase tracking-wider">
                      Late (12m)
                    </span>
                  </div>

                  <div className="p-3 bg-teal-50/50 rounded-2xl border border-teal-100/50 flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">Advanced Oil Painting</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Oct 23, 09:00 AM</p>
                    </div>
                    <span className="text-[10px] font-extrabold bg-teal-100 text-teal-800 px-3 py-1 rounded-full uppercase tracking-wider">
                      Late (8m)
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={() => setIsLateDetailsOpen(false)}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-2xl font-bold transition-all border-none cursor-pointer text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentAttendance;
