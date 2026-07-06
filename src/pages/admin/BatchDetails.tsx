import React, { useState, useRef } from 'react';
import {
  FiSearch, FiCalendar, FiUpload, FiUserPlus,
  FiUsers, FiCreditCard, FiClock,
  FiEye, FiEdit2, FiFileText, FiChevronLeft, FiChevronRight, 
  FiChevronRight as FiBreadcrumbRight, FiX, FiSave, FiInfo, FiCheck
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

interface Student {
  id: number;
  name: string;
  email: string;
  avatar: string;
  age: string;
  gender: string;
  joiningDate: string;
  feeStatus: 'PAID' | 'PARTIAL' | 'PENDING';
  batchEnd: string;
  remainingDays: string;
  remainingPercent: number;
}

const initialStudents: Student[] = [
  {
    id: 1,
    name: 'Mia Thompson',
    email: '+1(555) 012-3456',
    avatar: 'https://i.pravatar.cc/150?img=1',
    age: '14',
    gender: 'Female',
    joiningDate: '15 Mar 2024',
    feeStatus: 'PAID',
    batchEnd: '28 Aug 2026',
    remainingDays: '12 Days',
    remainingPercent: 100
  },
  {
    id: 2,
    name: 'Lucas Bennett',
    email: '+1(555) 098-7654',
    avatar: 'https://i.pravatar.cc/150?img=3',
    age: '16',
    gender: 'Male',
    joiningDate: '12 Apr 2024',
    feeStatus: 'PARTIAL',
    batchEnd: '28 Aug 2026',
    remainingDays: '12 Days',
    remainingPercent: 80
  },
  {
    id: 3,
    name: 'Sophia Rivera',
    email: '+1(555) 234-5678',
    avatar: 'https://i.pravatar.cc/150?img=5',
    age: '13',
    gender: 'Female',
    joiningDate: '20 Feb 2024',
    feeStatus: 'PENDING',
    batchEnd: '28 Aug 2026',
    remainingDays: '12 Days',
    remainingPercent: 50
  },
  {
    id: 4,
    name: 'Ethan Walker',
    email: '+1(555) 345-6789',
    avatar: 'https://i.pravatar.cc/150?img=8',
    age: '17',
    gender: 'Male',
    joiningDate: '05 May 2024',
    feeStatus: 'PAID',
    batchEnd: '28 Aug 2026',
    remainingDays: '12 Days',
    remainingPercent: 90
  }
];

const BatchDetails: React.FC = () => {
  const [studentsList, setStudentsList] = useState<Student[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeeFilter, setActiveFeeFilter] = useState<'All' | 'Paid' | 'Pending'>('All');

  // Modal display state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form input states
  const [studentName, setStudentName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('Digital Illustration');
  const [selectedBatch, setSelectedBatch] = useState('Morning (09:00 - 11:00)');
  const [joiningDate, setJoiningDate] = useState('');
  const [studentAvatar, setStudentAvatar] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle avatar file upload
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Format date helper: e.g. "2026-07-06" to "06 Jul 2026"
  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '06 Jul 2026';
    const date = new Date(dateStr);
    const day = String(date.getDate()).padStart(2, '0');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Submit and save new student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();

    if (!studentName.trim()) {
      alert('Please enter the student\'s name.');
      return;
    }

    const newStudent: Student = {
      id: Date.now(),
      name: studentName,
      email: phone || '+1(555) 000-0000',
      avatar: studentAvatar || 'https://i.pravatar.cc/150?img=12', // fallback avatar
      age: age || '15',
      gender: gender === 'Select Gender' ? 'Male' : gender,
      joiningDate: formatDateString(joiningDate),
      feeStatus: 'PENDING', // auto-assigned as prospective / pending
      batchEnd: '28 Aug 2026',
      remainingDays: '12 Days',
      remainingPercent: 100
    };

    setStudentsList([newStudent, ...studentsList]);
    setShowAddModal(false);
    resetForm();
  };

  const resetForm = () => {
    setStudentName('');
    setAge('');
    setGender('Select Gender');
    setPhone('');
    setParentName('');
    setResidentialAddress('');
    setSelectedCourse('Digital Illustration');
    setSelectedBatch('Morning (09:00 - 11:00)');
    setJoiningDate('');
    setStudentAvatar(null);
  };

  // Filters students list based on search query and fee status tabs
  const filteredStudents = studentsList.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          student.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFee = true;
    if (activeFeeFilter === 'Paid') {
      matchesFee = student.feeStatus === 'PAID';
    } else if (activeFeeFilter === 'Pending') {
      matchesFee = student.feeStatus === 'PENDING' || student.feeStatus === 'PARTIAL';
    }

    return matchesSearch && matchesFee;
  });

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800 relative">

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
              className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400 font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <button className="text-slate-400 hover:text-slate-600 transition-colors bg-transparent border-none cursor-pointer">
              <FiCalendar size={20} />
            </button>

            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-bold text-slate-400 tracking-wider">DIRECTOR</p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop"
                alt="Admin Profile"
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Breadcrumb & Actions Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Link to="/admin/students" className="text-slate-500 hover:text-slate-700 no-underline">Students</Link>
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
              <button 
                onClick={() => setActiveFeeFilter('All')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeFeeFilter === 'All'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveFeeFilter('Paid')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeFeeFilter === 'Paid'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                Paid
              </button>
              <button 
                onClick={() => setActiveFeeFilter('Pending')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeFeeFilter === 'Pending'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                Pending
              </button>
            </div>

            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <FiUpload size={16} /> Export
            </button>

            {/* Trigger modal click */}
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#6247df] hover:bg-[#5035c9] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 transition-colors cursor-pointer border-none"
            >
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
              <h3 className="text-2xl font-black text-[#1c1c28]">{studentsList.length}</h3>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#e6f8f8] text-[#108c9f] flex items-center justify-center shrink-0">
              <MdCurrencyRupee size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">FEES PAID</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">
                ₹{studentsList.filter(s => s.feeStatus === 'PAID').length * 120 + studentsList.filter(s => s.feeStatus === 'PARTIAL').length * 60}
              </h3>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fcf2ea] text-[#b67323] flex items-center justify-center shrink-0">
              <FiCreditCard size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">PENDING FEES</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">
                ₹{studentsList.filter(s => s.feeStatus === 'PENDING').length * 120 + studentsList.filter(s => s.feeStatus === 'PARTIAL').length * 60}
              </h3>
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
            <table className="w-full text-left border-collapse min-w-[900px] font-sans">
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
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#1c1c28] text-sm">{student.name}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{student.email}</div>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.age} / {student.gender}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">
                      {student.joiningDate.split(' ')[0]} {student.joiningDate.split(' ')[1]}<br />
                      {student.joiningDate.split(' ')[2] || ''}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider ${
                        student.feeStatus === 'PAID'
                          ? 'bg-[#e6f8f8] text-[#108c9f]'
                          : student.feeStatus === 'PARTIAL'
                            ? 'bg-[#fcf2ea] text-[#b67323]'
                            : 'bg-[#fef1f1] text-[#ef4444]'
                      }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">
                      {student.batchEnd.split(' ')[0]} {student.batchEnd.split(' ')[1]}<br />
                      {student.batchEnd.split(' ')[2] || ''}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-10 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#6247df] h-full rounded-full" style={{ width: `${student.remainingPercent}%` }}></div>
                        </div>
                        <span className="text-[10px] font-bold text-[#6247df] leading-tight">12<br />Days</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button className="hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer"><FiEye size={18} /></button>
                        <button className="hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer"><FiEdit2 size={18} /></button>
                        <button className="hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer"><FiFileText size={18} /></button>
                        <button 
                          onClick={() => setStudentsList(studentsList.filter(s => s.id !== student.id))}
                          className="hover:text-red-500 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <FiX size={18} />
                        </button>
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
              Showing {filteredStudents.length} of {studentsList.length} students
            </div>

            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 transition-colors bg-transparent cursor-pointer">
                <FiChevronLeft size={16} />
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#6247df] text-white font-bold text-sm shadow-md shadow-purple-200 border-none cursor-pointer">
                1
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors bg-transparent border-none cursor-pointer">
                2
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:bg-slate-50 font-bold text-sm transition-colors bg-transparent border-none cursor-pointer">
                3
              </button>
              <button className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors bg-transparent cursor-pointer">
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Modal - New Student Enrollment */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form 
            onSubmit={handleSaveStudent}
            className="bg-white w-full max-w-4xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] animate-scale-up"
          >
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#f3f0ff] text-[#6247df] flex items-center justify-center">
                  <FiUserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-xl text-slate-900 leading-tight">New Student Enrollment</h3>
                  <p className="text-slate-400 text-xs mt-1 font-medium">Complete the form below to register a new artist to the academy.</p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8">
              
              {/* Left Column (Upload Photo & Admission Tips) */}
              <div className="space-y-6">
                
                {/* Upload Photo */}
                <div className="border-2 border-dashed border-indigo-100 bg-[#F6F5FB]/40 rounded-2xl p-6 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleAvatarChange}
                  />

                  {studentAvatar ? (
                    <>
                      <img src={studentAvatar} className="w-24 h-24 rounded-full object-cover border border-white shadow-md mb-2" alt="Avatar Preview" />
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-xs text-[#6247df] font-bold hover:underline cursor-pointer bg-transparent border-none mt-2"
                      >
                        Change Photo
                      </button>
                    </>
                  ) : (
                    <>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#6247df] shadow-sm mb-3 cursor-pointer hover:scale-105 transition-transform"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold text-slate-700">Upload Photo</span>
                      <span className="text-[10px] text-slate-400 mt-1.5 leading-normal">JPEG, PNG up to 5MB<br />Square ratio recommended</span>
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-4 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-[#6247df] rounded-xl text-xs font-bold transition-all border-none cursor-pointer"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>

                {/* Admission Tips */}
                <div className="bg-[#f5f3ff] rounded-2xl p-5 border border-purple-50 space-y-4">
                  <span className="text-xs font-bold text-[#6247df] uppercase tracking-wider block">ADMISSION TIPS</span>
                  <ul className="space-y-3 p-0 m-0">
                    <li className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                      <div className="bg-[#6247df] text-white p-0.5 rounded-full mt-0.5 flex items-center justify-center shrink-0">
                        <FiCheck className="w-2.5 h-2.5" />
                      </div>
                      <span>Verify age for junior batches.</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-slate-600 font-medium">
                      <div className="bg-[#6247df] text-white p-0.5 rounded-full mt-0.5 flex items-center justify-center shrink-0">
                        <FiCheck className="w-2.5 h-2.5" />
                      </div>
                      <span>Emergency contact is mandatory.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right Column (Form details) */}
              <div className="space-y-6">
                
                {/* Personal Details Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">— PERSONAL DETAILS</span>
                  </div>

                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Student Name</label>
                    <input
                      type="text"
                      placeholder="Full legal name"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                    />
                  </div>

                  {/* Age & Gender Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <input
                        type="text"
                        placeholder="Years"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={gender}
                        onChange={(e) => setGender(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option disabled>Select Gender</option>
                        <option>Female</option>
                        <option>Male</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Phone & Parent Guardian Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                      <input
                        type="text"
                        placeholder="+1 (000) 000-0000"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Parent/Guardian Name</label>
                      <input
                        type="text"
                        placeholder="Primary contact person"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Residential Address */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Residential Address</label>
                    <input
                      type="text"
                      placeholder="Full street address"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                      value={residentialAddress}
                      onChange={(e) => setResidentialAddress(e.target.value)}
                    />
                  </div>
                </div>

                {/* Enrollment Details Section */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs font-bold tracking-widest uppercase">— ENROLLMENT DETAILS</span>
                  </div>

                  {/* Course & Batch Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Course</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option>Digital Illustration</option>
                        <option>Pencil Drawing</option>
                        <option>Oil Painting</option>
                        <option>Watercolor</option>
                        <option>Sculpting</option>
                        <option>Animation</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Batch</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={selectedBatch}
                        onChange={(e) => setSelectedBatch(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option>Morning (09:00 - 11:00)</option>
                        <option>Noon (12:00 - 14:00)</option>
                        <option>Evening (15:00 - 17:00)</option>
                      </select>
                    </div>
                  </div>

                  {/* Joining Date & Status Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Joining Date</label>
                      <input
                        type="date"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={joiningDate}
                        onChange={(e) => setJoiningDate(e.target.value)}
                      />
                    </div>

                    {/* Status indicator */}
                    <div className="py-3 flex flex-col gap-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#e0f7fa] text-[#006064] text-[10px] font-black px-3 py-1.5 rounded-md tracking-wider shadow-sm select-none">
                          PROSPECTIVE
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Auto-assigned</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3 shrink-0 font-sans">
              <button 
                type="button"
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-6 py-2.5 bg-[#6247df] hover:bg-[#5035c9] text-white rounded-xl font-bold text-sm shadow-md shadow-purple-900/20 transition-all flex items-center gap-2 border-none cursor-pointer"
              >
                <FiSave size={16} /> Save Student
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};

export default BatchDetails;
