import React, { useState } from 'react';
import {
  FiSearch, FiCalendar, FiUpload, FiUserPlus,
  FiUsers, FiCreditCard, FiClock,
  FiEye, FiEdit2, FiFileText, FiChevronLeft, FiChevronRight, FiChevronRight as FiBreadcrumbRight,
  FiX, FiCheck, FiUser
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Student {
  id: number;
  name: string;
  avatar: string;
  phone: string;
  age: number;
  gender: string;
  joiningDate: string;
  feeStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  batchEnd: string;
  remainingDays: number;
  attendanceRate: number;
  attendanceTrend: string;
  batch: string;
  course: string;
  teacher: string;
  admissionDate: string;
  schedule: string;
  address: string;
}

const STUDENTS_DATA: Student[] = [
  {
    id: 1,
    name: "Mia Thompson",
    avatar: "https://i.pravatar.cc/150?img=1",
    phone: "+1 (555) 234-8901",
    age: 16,
    gender: "Female",
    joiningDate: "15 Mar 2024",
    feeStatus: "PAID",
    batchEnd: "28 Aug 2026",
    remainingDays: 12,
    attendanceRate: 92,
    attendanceTrend: "+4%",
    batch: "Batch A",
    course: "Pencil Drawing",
    teacher: "Mrs. Aris",
    admissionDate: "Aug 24, 2023",
    schedule: "Mon, Wed (4-6 PM)",
    address: "892 Creative Lane, Apt 4B, New York"
  },
  {
    id: 2,
    name: "Lucas Bennett",
    avatar: "https://i.pravatar.cc/150?img=3",
    phone: "+1 (555) 098-7654",
    age: 16,
    gender: "Male",
    joiningDate: "12 Apr 2024",
    feeStatus: "PARTIAL",
    batchEnd: "28 Aug 2026",
    remainingDays: 12,
    attendanceRate: 85,
    attendanceTrend: "+2%",
    batch: "Batch A",
    course: "Pencil Drawing",
    teacher: "Mrs. Aris",
    admissionDate: "Apr 12, 2024",
    schedule: "Mon, Wed (4-6 PM)",
    address: "123 Artist Way, Brooklyn, New York"
  },
  {
    id: 3,
    name: "Sophia Rivera",
    avatar: "https://i.pravatar.cc/150?img=5",
    phone: "+1 (555) 234-5678",
    age: 13,
    gender: "Female",
    joiningDate: "20 Feb 2024",
    feeStatus: "PENDING",
    batchEnd: "28 Aug 2026",
    remainingDays: 12,
    attendanceRate: 78,
    attendanceTrend: "-1%",
    batch: "Batch A",
    course: "Pencil Drawing",
    teacher: "Mrs. Aris",
    admissionDate: "Feb 20, 2024",
    schedule: "Mon, Wed (4-6 PM)",
    address: "456 Canvas Court, Queens, New York"
  },
  {
    id: 4,
    name: "Ethan Walker",
    avatar: "https://i.pravatar.cc/150?img=8",
    phone: "+1 (555) 345-6789",
    age: 17,
    gender: "Male",
    joiningDate: "05 May 2024",
    feeStatus: "PAID",
    batchEnd: "28 Aug 2026",
    remainingDays: 12,
    attendanceRate: 95,
    attendanceTrend: "+5%",
    batch: "Batch A",
    course: "Pencil Drawing",
    teacher: "Mrs. Aris",
    admissionDate: "May 05, 2024",
    schedule: "Mon, Wed (4-6 PM)",
    address: "789 Palette Parkway, Manhattan, New York"
  }
];

const PaintPaletteIcon = () => (
  <svg className="text-purple-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 9.5 20 7.5 17.5 7.5H15.5C14.5 7.5 13.5 6.5 13.5 5.5V3.5C13.5 2.5 12.5 2 11.5 2C5.97715 2 1.5 6.47715 1.5 12C1.5 17.5228 5.97715 22 11.5 22H12Z" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
    <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
);

const BatchDetails: React.FC = () => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800">

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiCalendar size={20} />
            </button>

            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">DIRECTOR</p>
              </div>
              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="Admin Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb & Actions Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Link to="/admin/students" className="text-slate-500 hover:text-slate-700">Students</Link>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-slate-500">Pencil Drawing</span>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-[#6247df] font-bold">Batch A</span>
            </div>
            <h2 className="text-[22px] font-bold text-[#1c1c28]">Pencil Drawing – Batch A</h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center shadow-inner">
              <button className="bg-white text-[#6247df] px-6 py-2 rounded-lg font-bold text-sm shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                All
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                Paid
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2 rounded-lg font-bold text-sm transition-colors">
                Pending
              </button>
            </div>

            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <FiUpload size={16} /> Export
            </button>

            <button className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors">
              <FiUserPlus size={16} /> Add Student
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#f3f0ff] text-[#6247df] flex items-center justify-center shrink-0">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">TOTAL STUDENTS</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">18</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#e6f8f8] text-[#108c9f] flex items-center justify-center shrink-0">
              <MdCurrencyRupee size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">FEES PAID</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">₹2,160</h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fcf2ea] text-[#b67323] flex items-center justify-center shrink-0">
              <FiCreditCard size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">PENDING FEES</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">₹540</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fef1f1] text-[#ef4444] flex items-center justify-center shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">BATCH ENDS IN</p>
              <h3 className="text-2xl font-black text-[#ef4444]">12 Days</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <th className="py-5 px-6 font-bold w-16">Profile</th>
                  <th className="py-5 px-4 font-bold">Name</th>
                  <th className="py-5 px-4 font-bold">Age/Gender</th>
                  <th className="py-5 px-4 font-bold">Joining Date</th>
                  <th className="py-5 px-4 font-bold">Fee Status</th>
                  <th className="py-5 px-4 font-bold">Batch End</th>
                  <th className="py-5 px-4 font-bold">Remaining</th>
                  <th className="py-5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {STUDENTS_DATA.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                    </td>
                    <td className="py-4 px-4">
                      <div 
                        className="font-bold text-[#1c1c28] text-sm hover:text-[#6247df] cursor-pointer transition-colors"
                        onClick={() => setSelectedStudent(student)}
                      >
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{student.phone}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.age} / {student.gender}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.joiningDate}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider ${
                        student.feeStatus === 'PAID' ? 'bg-[#e6f8f8] text-[#108c9f]' :
                        student.feeStatus === 'PARTIAL' ? 'bg-[#fcf2ea] text-[#b67323]' :
                        'bg-[#fef1f1] text-[#ef4444]'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.batchEnd}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-[#6247df] h-full rounded-full" 
                            style={{ width: `${student.attendanceRate}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-bold text-[#6247df] leading-tight">
                          {student.remainingDays}<br />Days
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button 
                          onClick={() => setSelectedStudent(student)}
                          className="hover:text-slate-700 transition-colors"
                        >
                          <FiEye size={18} />
                        </button>
                        <button className="hover:text-slate-700 transition-colors"><FiEdit2 size={18} /></button>
                        <button className="hover:text-slate-700 transition-colors"><FiFileText size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-500">
              Showing 4 of 18 students
            </div>

            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors">
                <FiChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6247df] text-white font-bold text-sm shadow-md shadow-purple-200">
                1
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                2
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors">
                3
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Student Details Side Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity" 
            onClick={() => setSelectedStudent(null)}
          />
          
          {/* Drawer Panel */}
          <div className="relative w-full max-w-[460px] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-fade-in border-l border-slate-100">
            {/* Purple Header */}
            <div className="bg-[#6247df] text-white p-8 relative shrink-0">
              {/* Close Button */}
              <button 
                onClick={() => setSelectedStudent(null)}
                className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors focus:outline-none"
              >
                <FiX size={18} />
              </button>

              {/* Avatar and Name */}
              <div className="flex items-center gap-5 mt-12">
                <img 
                  src={selectedStudent.avatar} 
                  alt={selectedStudent.name} 
                  className="w-20 h-20 rounded-[1.25rem] border-4 border-white shadow-md object-cover bg-white shrink-0" 
                />
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Age {selectedStudent.age}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {selectedStudent.batch}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <FiCheck className="stroke-[3]" size={8} /> Active Student
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metrics cards row */}
            <div className="grid grid-cols-2 gap-4 px-8 pt-6 pb-4">
              {/* Attendance Rate */}
              <div className="bg-[#f9f8ff] border border-purple-100/70 rounded-3xl p-5 flex flex-col justify-between">
                <div>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-2">ATTENDANCE RATE</p>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-[#6247df]">{selectedStudent.attendanceRate}%</span>
                    <span className="text-[10px] font-extrabold text-purple-500">{selectedStudent.attendanceTrend}</span>
                  </div>
                </div>
                <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-4">
                  <div 
                    className="bg-[#6247df] h-full rounded-full" 
                    style={{ width: `${selectedStudent.attendanceRate}%` }}
                  />
                </div>
              </div>

              {/* Remaining Days */}
              <div className="bg-[#fefbf7] border border-amber-100/70 rounded-3xl p-5 flex flex-col justify-between relative">
                <span className="absolute top-4 right-4 bg-[#7c631e] text-white text-[8px] font-black px-2 py-0.5 rounded-md uppercase">
                  Expires Soon
                </span>
                <div>
                  <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-2">REMAINING DAYS</p>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-3xl font-black text-[#b67323]">{selectedStudent.remainingDays}</span>
                    <span className="text-[10px] font-bold text-slate-400 ml-1">Days</span>
                  </div>
                </div>
                <p className="text-[9px] text-slate-400 font-semibold italic mt-4">Next term starts Dec 15</p>
              </div>
            </div>

            {/* Academic Details Section */}
            <div className="px-8 py-4">
              <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                <PaintPaletteIcon />
                <h4 className="text-[15px] font-bold">Academic Details</h4>
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 grid grid-cols-2 gap-y-4 gap-x-2">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Course</p>
                  <p className="text-sm font-extrabold text-slate-700">{selectedStudent.course}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Teacher</p>
                  <p className="text-sm font-extrabold text-slate-700">{selectedStudent.teacher}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Admission Date</p>
                  <p className="text-sm font-extrabold text-slate-700">{selectedStudent.admissionDate}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Batch Schedule</p>
                  <p className="text-sm font-extrabold text-slate-700">{selectedStudent.schedule}</p>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div className="px-8 py-4 flex-grow">
              <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                <span className="text-[#6247df]"><FiUser size={18} /></span>
                <h4 className="text-[15px] font-bold">Contact Information</h4>
              </div>

              <div className="flex flex-col gap-3">
                {/* Phone */}
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 mb-0.5">Phone Number</p>
                    <p className="text-sm font-extrabold text-slate-700">{selectedStudent.phone}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
                  <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 mb-0.5">Address</p>
                    <p className="text-sm font-extrabold text-slate-700">{selectedStudent.address}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50 shrink-0">
              <button className="flex-1 bg-white border-2 border-[#6247df] text-[#6247df] font-bold py-3 rounded-2xl text-sm hover:bg-purple-50 transition-colors shadow-sm focus:outline-none">
                Edit Profile
              </button>
              <button className="flex-1 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md shadow-purple-200 focus:outline-none">
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchDetails;
