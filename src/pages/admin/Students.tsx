import React, { useState, useEffect } from 'react';
import { 
  FiSearch, FiCalendar, FiFilter, FiPlus, 
  FiEdit2, FiArrowRight, FiVideo,
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import AdminSidebar from '../../components/admin/AdminSidebar';

const Students: React.FC = () => {
  const [batches, setBatches] = useState<any[]>([]);

  useEffect(() => {
    fetch('http://localhost:5000/api/batches')
      .then(res => res.json())
      .then(data => {
        setBatches(data);
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
            
            <button className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors h-full">
              <FiPlus size={16} /> <span className="leading-tight">Add<br/>New Batch</span>
            </button>
          </div>
        </div>

        {/* Batch Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          
          {batches.map((batch, index) => (
            <div key={batch._id || index} className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${batch.statusColor || 'bg-orange-50 text-[#b67323]'} flex items-center justify-center`}>
                  <FiEdit2 size={20} />
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
    </div>
  );
};

export default Students;
