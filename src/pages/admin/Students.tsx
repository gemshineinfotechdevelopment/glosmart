import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, FiCalendar, FiFilter, FiPlus, 
  FiEdit2, FiArrowRight, FiVideo,
  FiUserPlus, FiX, FiSave, FiCheck, FiBookOpen
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Students: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [batches, setBatches] = useState<any[]>([]);

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

    const newStudent = {
      name: studentName,
      email: phone || '+1(555) 000-0000',
      phone: phone || '+1(555) 000-0000',
      avatar: studentAvatar || 'https://i.pravatar.cc/150?img=12', // fallback avatar
      age: parseInt(age) || 15,
      gender: gender === 'Select Gender' ? 'Male' : gender,
      joiningDate: formatDateString(joiningDate),
      feeStatus: 'PENDING',
      batchEnd: '28 Aug 2026',
      remainingDays: 12,
      attendanceRate: 100,
      attendanceTrend: '+0%',
      batch: selectedBatch,
      course: selectedCourse,
      teacher: 'Assigned Later',
      admissionDate: formatDateString(joiningDate),
      schedule: selectedBatch,
      address: residentialAddress || 'Not provided'
    };

    fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    })
      .then(res => res.json())
      .then(data => {
        setShowAddModal(false);
        resetForm();
        alert('Student registered successfully!');
        // Refresh batches list to update the enrollment count
        fetch('http://localhost:5000/api/batches')
          .then(res => res.json())
          .then(batchesData => setBatches(batchesData))
          .catch(err => console.error("Error refreshing batches:", err));
      })
      .catch(err => {
        console.error("Error creating student:", err);
        setShowAddModal(false);
        resetForm();
      });
  };

  const uniqueCourses = Array.from(new Set(batches.map(b => b.courseName))) as string[];
  const filteredBatchesForSelectedCourse = batches.filter(b => b.courseName === selectedCourse);

  const resetForm = () => {
    setStudentName('');
    setAge('');
    setGender('Select Gender');
    setPhone('');
    setParentName('');
    setResidentialAddress('');
    setJoiningDate('');
    setStudentAvatar(null);
    if (uniqueCourses.length > 0) {
      setSelectedCourse(uniqueCourses[0]);
      const courseBatches = batches.filter(b => b.courseName === uniqueCourses[0]);
      if (courseBatches.length > 0) {
        setSelectedBatch(courseBatches[0].batchName);
      }
    } else {
      setSelectedCourse('');
      setSelectedBatch('');
    }
  };

  const handleCourseChange = (course: string) => {
    setSelectedCourse(course);
    const courseBatches = batches.filter(b => b.courseName === course);
    if (courseBatches.length > 0) {
      setSelectedBatch(courseBatches[0].batchName);
    } else {
      setSelectedBatch('');
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data);
        if (data.length > 0) {
          const uCourses = Array.from(new Set(data.map((b: any) => b.courseName))) as string[];
          if (uCourses.length > 0) {
            setSelectedCourse(uCourses[0]);
            const courseBatches = data.filter((b: any) => b.courseName === uCourses[0]);
            if (courseBatches.length > 0) {
              setSelectedBatch(courseBatches[0].batchName);
            }
          }
        }
      })
      .catch(err => console.error("Failed to fetch batches", err));
  }, []);

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800">
      
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-[28px] font-bold text-[#1c1c28]">Students</h1>
          
          <div className="flex items-center gap-6 w-full md:w-auto">
            {/* Search */}
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Batch..." 
                className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
              />
            </div>
            
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <FiCalendar size={20} />
            </button>
            
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-medium text-slate-500">Administrator</p>
              </div>
              <img 
                src="https://i.pravatar.cc/150?img=11" 
                alt="Admin Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-2 tracking-tight">Student Management</h2>
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
              Manage students batch-wise and monitor enrollments across the academy.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center shadow-inner">
              <button className="bg-white text-[#6247df] px-6 py-2.5 rounded-lg font-bold text-sm shadow-[0_2px_10px_rgb(0,0,0,0.04)]">
                All
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                Active
              </button>
              <button className="text-slate-500 hover:text-slate-700 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                Upcoming
              </button>
            </div>
            
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <FiFilter size={16} /> Filter
            </button>
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors h-full cursor-pointer border-none"
            >
              <FiPlus size={16} /> <span className="leading-tight">Add Student</span>
            </button>
          </div>
        </div>

        {/* Batch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {batches.map((batch, index) => (
            <div key={batch._id || index} className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${batch.statusColor || 'bg-orange-50 text-[#b67323]'} flex items-center justify-center`}>
                  <FiBookOpen size={20} />
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${batch.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-[#d97706]'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${batch.status === 'ACTIVE' ? 'bg-green-600' : 'bg-[#d97706]'}`}></span> {batch.status || 'Upcoming'}
                </span>
              </div>
              
              <h3 className="text-xl font-extrabold text-[#1c1c28] mb-1">{batch.batchName}</h3>
              <p className="text-slate-500 font-medium text-sm mb-6">Course: {batch.courseName}</p>
              
              <div className="flex items-center gap-3 mb-8">
                <img src={batch.instructorAvatar || "https://i.pravatar.cc/150?img=5"} alt="Instructor" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-[#1c1c28]">{batch.instructor}</p>
                  <p className="text-[11px] font-medium text-slate-500">Instructor</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold text-slate-500">Enrollment: {batch.students || 0}/{batch.maxStudents || 30}</span>
                  <span className="text-sm font-extrabold text-[#6247df]">{batch.progressText || '0%'}</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                  <div className={`h-full rounded-full ${batch.progressBg || 'bg-[#6247df]'} ${batch.progressWidth || 'w-0'}`}></div>
                </div>
                
                <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-400">{batch.progressLabel || 'Status'}</span>
                  <Link to={`/admin/students/${batch.batchCode?.toLowerCase() || 'batch-a'}`} className="text-[#6247df] text-sm font-bold flex items-center gap-1 hover:text-[#5035c9] no-underline">
                    View Students <FiArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}

        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Batch Performance Overview */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h3 className="text-[22px] font-extrabold text-[#1c1c28] mb-4">Batch Performance Overview</h3>
              <p className="text-slate-500 font-medium text-[15px] leading-relaxed mb-8">
                Aggregate student performance across all 12 active batches shows a 15% increase in certification rate this month.
              </p>
              
              <div className="flex gap-4">
                {/* Stat 1 */}
                <div className="bg-[#f8f5ff] p-4 rounded-2xl flex-1 border border-purple-50">
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">TOTAL<br/>STUDENTS</p>
                  <h4 className="text-4xl font-black text-[#6247df]">248</h4>
                </div>
                {/* Stat 2 */}
                <div className="bg-[#fdf9f4] p-4 rounded-2xl flex-1 border border-orange-50">
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">AVG<br/>GRADE</p>
                  <h4 className="text-4xl font-black text-[#b67323]">A-</h4>
                </div>
                {/* Stat 3 */}
                <div className="bg-[#f2fbfb] p-4 rounded-2xl flex-1 border border-cyan-50">
                  <p className="text-[10px] font-bold text-slate-500 tracking-wider mb-1">RETENTION</p>
                  <h4 className="text-4xl font-black text-[#108c9f]">94<span className="text-2xl">%</span></h4>
                </div>
              </div>
            </div>
            
            {/* Circular Chart */}
            <div className="shrink-0 w-48 h-48 relative flex items-center justify-center">
              {/* Outer ring */}
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#f1f5f9" 
                  strokeWidth="12" 
                />
                <circle 
                  cx="50" cy="50" r="40" 
                  fill="none" 
                  stroke="#6247df" 
                  strokeWidth="12" 
                  strokeDasharray="251.2" 
                  strokeDashoffset="75.36" 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1c1c28]">70%</span>
                <span className="text-[9px] font-bold text-slate-400 tracking-widest mt-1">FULL CAPACITY</span>
              </div>
            </div>
          </div>

          {/* Campus Activity */}
          <div className="bg-white rounded-[2rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col">
            <div className="bg-slate-50 rounded-2xl mb-6 relative overflow-hidden group">
              {/* Mockup of UI as image placeholder */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80" 
                alt="Campus Activity" 
                className="w-full h-36 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center text-white">
                  <FiVideo size={20} className="ml-1" />
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-[#1c1c28] mb-3">Campus Activity</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-6 flex-1">
              Live view of the main studio during the current Pencil Drawing batch session.
            </p>
            
            <button className="text-[#6247df] text-sm font-bold flex items-center gap-2 hover:text-[#5035c9] w-fit">
              Live Stream <FiVideo size={16} />
            </button>
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
            <div className="p-8 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 font-sans">

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
                        onChange={(e) => handleCourseChange(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        {uniqueCourses.length > 0 ? (
                          uniqueCourses.map(course => (
                            <option key={course} value={course}>{course}</option>
                          ))
                        ) : (
                          <option disabled value="">No courses available</option>
                        )}
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
                        {filteredBatchesForSelectedCourse.length > 0 ? (
                          filteredBatchesForSelectedCourse.map(b => (
                            <option key={b._id || b.id} value={b.batchName}>{b.batchName}</option>
                          ))
                        ) : (
                          <option disabled value="">No batches available</option>
                        )}
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
                className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-50 transition-colors cursor-pointer font-sans"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#6247df] hover:bg-[#5035c9] text-white rounded-xl font-bold text-sm shadow-md shadow-purple-900/20 transition-all flex items-center gap-2 border-none cursor-pointer font-sans"
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

export default Students;
