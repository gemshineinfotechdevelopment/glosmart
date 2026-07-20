import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiCalendar, FiFilter, FiPlus, 
  FiArrowRight, FiVideo,
  FiUserPlus, FiX, FiSave, FiBookOpen,
  FiCheck, FiTrash2
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

const Students: React.FC = () => {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [batches, setBatches] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  const isStudentInBatch = (student: any, batch: any) => {
    if (student.approvalStatus === 'PENDING') return false;
    if (!batch || !batch._id) return false;
    const sBatchId = student.batchId?._id || student.batchId;
    return (sBatchId?.toString() === batch._id.toString()) || 
           (student.batch === batch.batchName);
  };

  // Filter states
  const [activeTab, setActiveTab] = useState<'All' | 'ACTIVE' | 'UPCOMING' | 'PENDING'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [courseFilter, setCourseFilter] = useState('');

  // Modal display state
  const [showAddModal, setShowAddModal] = useState(false);

  // Form input states
  const [studentName, setStudentName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Select Gender');
  const [phone, setPhone] = useState('');
  const [parentName, setParentName] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [feeStatus, setFeeStatus] = useState('PENDING');

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
    if (!email.trim()) {
      alert('Please enter the email address.');
      return;
    }
    if (!password.trim() || password.length < 6) {
      alert('Please enter an initial password of at least 6 characters.');
      return;
    }

    const courseObj = courses.find(c => c._id === selectedCourseId);
    const batchObj = batches.find(b => b._id === selectedBatchId);

    const newStudent = {
      name: studentName,
      email: email,
      password: password,
      phone: phone || '+1(555) 000-0000',
      age: parseInt(age) || 15,
      gender: gender === 'Select Gender' ? 'Male' : gender,
      joiningDate: formatDateString(joiningDate),
      feeStatus: feeStatus,
      approvalStatus: user?.role === 'teacher' ? 'PENDING' : 'APPROVED',
      batchEnd: '28 Aug 2026',
      remainingDays: 12,
      attendanceRate: 100,
      attendanceTrend: '+0%',
      batchId: batchObj?._id,
      batch: batchObj?.batchName || '',
      courseId: courseObj?._id,
      course: courseObj?.courseName || '',
      teacher: batchObj?.instructor || 'Assigned Later',
      admissionDate: formatDateString(joiningDate),
      schedule: batchObj?.batchName || '',
      address: residentialAddress || 'Not provided'
    };

    fetch('http://localhost:5000/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudent),
    })
      .then(res => res.json())
      .then(() => {
        setShowAddModal(false);
        resetForm();
        alert(user?.role === 'teacher' ? 'Student registration submitted! Waiting for Admin approval.' : 'Student registered successfully!');
        fetchData();
      })
      .catch(err => {
        console.error("Error creating student:", err);
        setShowAddModal(false);
        resetForm();
      });
  };
  const handleApproveStudent = async (studentId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvalStatus: 'APPROVED' })
      });
      if (res.ok) {
        alert('Student registration approved successfully!');
        fetchData();
      } else {
        alert('Failed to approve student registration.');
      }
    } catch (err) {
      console.error('Error approving student:', err);
    }
  };

  const handleRejectStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to reject and delete this registration request?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/students/${studentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Student registration rejected and request removed.');
        fetchData();
      } else {
        alert('Failed to reject registration.');
      }
    } catch (err) {
      console.error('Error rejecting student:', err);
    }
  };


  const filteredBatchesForSelectedCourse = batches.filter(b => b.courseId?._id === selectedCourseId || b.courseId === selectedCourseId);

  const resetForm = () => {
    setStudentName('');
    setEmail('');
    setPassword('');
    setAge('');
    setGender('Select Gender');
    setPhone('');
    setParentName('');
    setResidentialAddress('');
    setJoiningDate('');
    setFeeStatus('PENDING');
    if (courses.length > 0) {
      setSelectedCourseId(courses[0]._id);
      const courseBatches = batches.filter(b => b.courseId?._id === courses[0]._id || b.courseId === courses[0]._id);
      if (courseBatches.length > 0) {
        setSelectedBatchId(courseBatches[0]._id);
      } else {
        setSelectedBatchId('');
      }
    } else {
      setSelectedCourseId('');
      setSelectedBatchId('');
    }
  };

  const handleCourseChange = (courseId: string) => {
    setSelectedCourseId(courseId);
    const courseBatches = batches.filter(b => b.courseId?._id === courseId || b.courseId === courseId);
    if (courseBatches.length > 0) {
      setSelectedBatchId(courseBatches[0]._id);
    } else {
      setSelectedBatchId('');
    }
  };

  const fetchData = async () => {
    try {
      const [coursesRes, batchesRes] = await Promise.all([
        fetch('http://localhost:5000/api/courses?limit=1000'),
        fetch('http://localhost:5000/api/batches')
      ]);
      const coursesData = await coursesRes.json();
      const batchesData = await batchesRes.json();
      
      const loadedCourses = coursesData.courses || [];
      setCourses(loadedCourses);
      setBatches(batchesData);

      if (loadedCourses.length > 0) {
        setSelectedCourseId(loadedCourses[0]._id);
        const courseBatches = batchesData.filter((b: any) => b.courseId?._id === loadedCourses[0]._id || b.courseId === loadedCourses[0]._id);
        if (courseBatches.length > 0) {
          setSelectedBatchId(courseBatches[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const displayedBatches = batches.filter(batch => {
    // Tab filter
    const status = batch.status || 'UPCOMING';
    if (activeTab === 'ACTIVE' && status !== 'ACTIVE') return false;
    if (activeTab === 'UPCOMING' && status !== 'UPCOMING') return false;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchName = (batch.batchName || '').toLowerCase().includes(q);
      const matchCourse = (batch.courseId?.courseName || batch.courseName || '').toLowerCase().includes(q);
      const matchInstructor = (batch.instructor || '').toLowerCase().includes(q);
      if (!matchName && !matchCourse && !matchInstructor) return false;
    }

    // Course filter
    if (courseFilter) {
      const cId = batch.courseId?._id || batch.courseId;
      if (cId !== courseFilter) return false;
    }

    return true;
  });

  const totalCapacity = batches.reduce((acc, b) => acc + (b.capacity || 30), 0);
  const totalEnrolled = batches.reduce((acc, b) => acc + (b.enrolledStudents || 0), 0);
  const occupancyPercentage = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;
  const strokeDashoffset = 251.2 - (251.2 * occupancyPercentage) / 100;
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
              <button 
                onClick={() => setActiveTab('All')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeTab === 'All'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                All
              </button>
              <button 
                onClick={() => setActiveTab('ACTIVE')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeTab === 'ACTIVE'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                Active
              </button>
              <button 
                onClick={() => setActiveTab('UPCOMING')}
                className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                  activeTab === 'UPCOMING'
                    ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                    : 'text-slate-500 hover:text-slate-700 bg-transparent'
                }`}
              >
                Upcoming
              </button>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => setActiveTab('PENDING')}
                  className={`px-6 py-2.5 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${
                    activeTab === 'PENDING'
                      ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                      : 'text-slate-500 hover:text-slate-700 bg-transparent'
                  }`}
                >
                  Pending Approvals
                </button>
              )}
            </div>
            
            {showFilters ? (
              <div className="flex items-center gap-2">
                <select 
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">All Courses</option>
                  {courses.map(c => (
                    <option key={c._id} value={c._id}>{c.courseName}</option>
                  ))}
                </select>
                <button 
                  onClick={() => { setShowFilters(false); setCourseFilter(''); }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer border-none"
                >
                  <FiX size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <FiFilter size={16} /> Filter
              </button>
            )}
            
            <button 
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors h-full cursor-pointer border-none"
            >
              <FiPlus size={16} /> <span className="leading-tight">Add Student</span>
            </button>
          </div>
        </div>

        {/* Batch Cards Grid */}
        {activeTab !== 'PENDING' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {displayedBatches.map((batch, index) => {
              const enrollmentPercentage = Math.round(((batch.enrolledStudents || 0) / (batch.capacity || 30)) * 100);
              return (
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
                  <p className="text-slate-500 font-medium text-sm mb-6">Course: {batch.courseId?.courseName || batch.courseName}</p>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <img src={batch.instructorAvatar || "https://i.pravatar.cc/150?img=5"} alt="Instructor" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-bold text-[#1c1c28]">{batch.instructor}</p>
                      <p className="text-[11px] font-medium text-slate-500">Instructor</p>
                    </div>
                  </div>
                  
                  <div className="mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-xs font-bold text-slate-500">Enrollment: {batch.enrolledStudents || 0}/{batch.capacity || 30}</span>
                      <span className="text-sm font-extrabold text-[#6247df]">{enrollmentPercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-6">
                      <div className={`h-full rounded-full ${batch.progressBg || 'bg-[#6247df]'}`} style={{ width: `${Math.min(enrollmentPercentage, 100)}%` }}></div>
                    </div>
                    
                    <div className="flex justify-between items-center pt-5 border-t border-slate-100">
                      <span className="text-[11px] font-bold text-slate-400">{batch.status === 'ACTIVE' ? 'Ongoing' : 'Upcoming'}</span>
                      <Link to={`/admin/students/${batch._id}`} className="text-[#6247df] text-sm font-bold flex items-center gap-1 hover:text-[#5035c9] no-underline">
                        View Details <FiArrowRight size={16} />
                      </Link>
                    </div>
                  </div>

                  {/* Students List for this Batch */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-sm font-bold text-[#1c1c28]">Students List</h4>
                    </div>
                    
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                      {students.filter(s => isStudentInBatch(s, batch)).length > 0 ? (
                        students.filter(s => isStudentInBatch(s, batch)).map(student => (
                          <div key={student._id || student.id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                            <img src={student.avatar || "https://i.pravatar.cc/150?img=12"} alt={student.name} className="w-8 h-8 rounded-full object-cover" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-[#1c1c28] truncate">{student.name}</p>
                              <p className="text-[10px] text-slate-500 truncate">{student.email || student.phone}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-400 italic text-center py-4">No students enrolled yet.</p>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 mb-8 overflow-x-auto">
            <h3 className="text-xl font-extrabold text-[#1c1c28] mb-6">Pending Student Registrations</h3>
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="pb-4 font-semibold">Student</th>
                  <th className="pb-4 font-semibold">Age / Gender</th>
                  <th className="pb-4 font-semibold">Requested Course</th>
                  <th className="pb-4 font-semibold">Requested Batch</th>
                  <th className="pb-4 font-semibold">Phone</th>
                  <th className="pb-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {students.filter(s => s.approvalStatus === 'PENDING').length > 0 ? (
                  students.filter(s => s.approvalStatus === 'PENDING').map(student => (
                    <tr key={student._id} className="text-slate-700 text-sm hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 flex items-center gap-3">
                        <img src={student.avatar || "https://i.pravatar.cc/150?img=12"} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-[#1c1c28]">{student.name}</p>
                          <p className="text-xs text-slate-400">{student.email}</p>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-slate-500">
                        {student.age} yrs / {student.gender}
                      </td>
                      <td className="py-4 font-bold text-[#1c1c28]">
                        {student.course || 'Not selected'}
                      </td>
                      <td className="py-4 font-semibold text-slate-500">
                        {student.batch || 'Not selected'}
                      </td>
                      <td className="py-4 text-slate-500 font-medium">
                        {student.phone}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleApproveStudent(student._id)}
                            className="w-9 h-9 rounded-xl bg-green-50 text-green-600 hover:bg-green-100 flex items-center justify-center transition-colors border-none cursor-pointer"
                            title="Approve student"
                          >
                            <FiCheck size={18} />
                          </button>
                          <button
                            onClick={() => handleRejectStudent(student._id)}
                            className="w-9 h-9 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors border-none cursor-pointer"
                            title="Reject registration"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic font-medium">
                      No pending student registrations at the moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

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
                  <h4 className="text-4xl font-black text-[#6247df]">{students.length}</h4>
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
                  strokeDashoffset={strokeDashoffset} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black text-[#1c1c28]">{occupancyPercentage}%</span>
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
            <div className="p-8 overflow-y-auto flex-1 font-sans">

              {/* Form details */}
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

                  {/* Email & Initial Password Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Email ID</label>
                      <input
                        type="email"
                        placeholder="student@example.com"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Initial Password</label>
                      <input
                        type="password"
                        placeholder="Minimum 6 characters"
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
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
                        value={selectedCourseId}
                        onChange={(e) => handleCourseChange(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        {courses.length > 0 ? (
                          courses.map(course => (
                            <option key={course._id} value={course._id}>{course.courseName}</option>
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
                        value={selectedBatchId}
                        onChange={(e) => setSelectedBatchId(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        {filteredBatchesForSelectedCourse.length > 0 ? (
                          filteredBatchesForSelectedCourse.map(b => (
                            <option key={b._id || b.id} value={b._id}>{b.batchName}</option>
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

                    {/* Payment Status */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={feeStatus}
                        onChange={(e) => setFeeStatus(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option value="PAID">PAID</option>
                        <option value="PARTIAL">PARTIAL</option>
                        <option value="PENDING">PENDING</option>
                        <option value="UNPAID">UNPAID</option>
                      </select>
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
