 import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUsers, FiBookOpen,
  FiCalendar as FiCal,
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';

import { useAuth } from '../../context/AuthContext';


const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    fetch('http://localhost:5000/api/dashboard/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data);
      })
      .catch(err => {
        console.error("Failed to load dashboard stats", err);
      });
  }, []);

  return (
      <div className="p-6 md:p-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-1">Academy Overview</h2>
            <p className="text-slate-500 font-medium">
              Welcome back, {user?.name ? user.name : (user?.role === 'teacher' ? 'Tutor' : 'Admin')}.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">

          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#6247df] flex items-center justify-center">
                <FiUsers size={24} />
              </div>
            </div>
            <p className="text-slate-500 font-semibold text-sm mb-1">Total Students</p>
            <h3 className="text-4xl font-black text-[#1c1c28] mb-4">{stats.totalStudents || 0}</h3>
          </div>


          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 flex items-center justify-center">
                <FiBookOpen size={24} />
              </div>
            </div>
            <p className="text-slate-500 font-semibold text-sm mb-1">Total Courses</p>
            <h3 className="text-4xl font-black text-[#108c9f] mb-4">{stats.totalCourses || 0}</h3>
            <p className="text-xs text-slate-500 mt-auto">{stats.activeCourses || 0} Active Courses</p>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col">
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                <FiCal size={24} />
              </div>
            </div>
            <p className="text-slate-500 font-semibold text-sm mb-1">Total Batches</p>
            <h3 className="text-4xl font-black text-[#1c1c28] mb-4">{stats.totalBatches || 0}</h3>
            <div className="mt-auto flex justify-between text-xs text-slate-500">
              <span>{stats.activeBatches || 0} Active</span>
              <span>{stats.upcomingBatches || 0} Upcoming</span>
              <span>{stats.completedBatches || 0} Done</span>
            </div>
          </div>

        </div>

        {/* Middle Section: Chart & Activity */}
        {user?.role !== 'teacher' && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mb-8">

            {/* Chart Card */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col h-[400px]">
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h3 className="text-xl font-bold text-[#1c1c28]">Student Growth</h3>
                  <p className="text-sm text-slate-500">Overview of registrations over the last 6 months</p>
                </div>
                <button className="bg-slate-50 text-slate-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 transition-colors">
                  Last 6 Months
                </button>
              </div>

              {/* CSS/SVG Area Chart Mockup */}
              <div className="flex-1 relative w-full mt-4">
                {/* Horizontal Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between z-0">
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="w-full h-px bg-slate-100"></div>
                  <div className="w-full h-px bg-slate-100"></div>
                </div>

                {/* SVG Curve */}
                <div className="absolute inset-0 z-10 top-0 bottom-0 left-0 right-0 h-full w-full">
                  <svg viewBox="0 0 800 200" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6247df" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#6247df" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d="M 0 150 C 100 80, 200 120, 300 130 C 400 140, 500 20, 600 20 C 700 20, 750 40, 800 50 L 800 200 L 0 200 Z" fill="url(#areaGradient)" />
                    <path d="M 0 150 C 100 80, 200 120, 300 130 C 400 140, 500 20, 600 20 C 700 20, 750 40, 800 50" fill="none" stroke="#6247df" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute -bottom-8 left-0 right-0 flex justify-between text-xs font-semibold text-slate-400 px-2 z-20">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>
                </div>
              </div>
            </div>

            {/* Activity Card */}
            <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col">
              <h3 className="text-xl font-bold text-[#1c1c28] mb-6">Recent Activities</h3>

              <div className="flex flex-col gap-6 flex-1 relative">
                {/* Timeline Line */}
                <div className="absolute left-6 top-6 bottom-6 w-px bg-slate-100 z-0"></div>

                {/* Item 1 */}
                <div className="flex gap-4 relative z-10 items-start">
                  <div className="w-12 h-12 rounded-full bg-purple-100 text-[#6247df] flex items-center justify-center shrink-0 border-4 border-white">
                    <FiUsers size={18} />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1c1c28] text-sm">New Student Joined</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Mia Thompson enrolled in "Color Magic 101"</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">2 mins ago</span>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex gap-4 relative z-10 items-start">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0 border-4 border-white">
                    <MdCurrencyRupee size={18} />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1c1c28] text-sm">Fee Paid</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">Invoice #3421 paid by Noah's parents (₹120)</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">45 mins ago</span>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex gap-4 relative z-10 items-start">
                  <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 border-4 border-white">
                    <FiBookOpen size={18} />
                  </div>
                  <div className="pt-1">
                    <h4 className="font-bold text-[#1c1c28] text-sm">New Course Added</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">"Digital Illustration for Teens" is now live</p>
                    <span className="text-[10px] font-bold text-slate-400 mt-2 block">2 hours ago</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-3 border border-slate-200 rounded-xl text-[#6247df] font-bold text-sm hover:bg-slate-50 transition-colors">
                View All Activity
              </button>
            </div>
          </div>
        )}

        {/* Bottom Section: Revenue & Quick Actions */}
        <div className={`grid grid-cols-1 ${user?.role !== 'teacher' ? 'lg:grid-cols-[2fr_1fr]' : ''} gap-6`}>

          {/* Revenue Bar Chart */}
          {user?.role !== 'teacher' && (
            <div className="bg-white rounded-[1.5rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex flex-col h-[350px]">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-xl font-bold text-[#1c1c28]">Revenue Comparison</h3>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#a36319]"></div>
                    <span className="text-xs font-semibold text-slate-600">This Month</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#e3dbe7]"></div>
                    <span className="text-xs font-semibold text-slate-600">Last Month</span>
                  </div>
                </div>
              </div>

              {/* CSS Bar Chart */}
              <div className="flex-1 flex items-end justify-around pb-6 mt-4 relative">
                {/* Bars Week 1 */}
                <div className="flex items-end gap-2 h-full">
                  <div className="w-4 sm:w-6 bg-[#e3dbe7] rounded-t-lg h-[40%]"></div>
                  <div className="w-4 sm:w-6 bg-[#a36319] rounded-t-lg h-[50%]"></div>
                </div>
                {/* Bars Week 2 */}
                <div className="flex items-end gap-2 h-full">
                  <div className="w-4 sm:w-6 bg-[#e3dbe7] rounded-t-lg h-[60%]"></div>
                  <div className="w-4 sm:w-6 bg-[#a36319] rounded-t-lg h-[75%]"></div>
                </div>
                {/* Bars Week 3 */}
                <div className="flex items-end gap-2 h-full">
                  <div className="w-4 sm:w-6 bg-[#e3dbe7] rounded-t-lg h-[45%]"></div>
                  <div className="w-4 sm:w-6 bg-[#a36319] rounded-t-lg h-[40%]"></div>
                </div>
                {/* Bars Week 4 */}
                <div className="flex items-end gap-2 h-full">
                  <div className="w-4 sm:w-6 bg-[#e3dbe7] rounded-t-lg h-[70%]"></div>
                  <div className="w-4 sm:w-6 bg-[#a36319] rounded-t-lg h-[85%]"></div>
                </div>

                {/* X-Axis Labels */}
                <div className="absolute -bottom-1 left-0 right-0 flex justify-around text-xs font-semibold text-slate-400">
                  <span>Week 1</span>
                  <span>Week 2</span>
                  <span>Week 3</span>
                  <span>Week 4</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-[#1c1c28] mb-2">Quick Actions</h3>

            <button onClick={() => navigate('/admin/students')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-5 hover:border-purple-200 hover:shadow-md transition-all text-left group">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-[#6247df] flex items-center justify-center group-hover:scale-110 transition-transform">
                <FiUsers size={20} />
              </div>
              <div>
                <h4 className="font-bold text-[#1c1c28]">Add Student</h4>
                <p className="text-xs text-slate-500 mt-1">Register new enrollment</p>
              </div>
            </button>

            {user?.role === 'admin' && (
              <>
                <button onClick={() => navigate('/admin/courses/new')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-5 hover:border-cyan-200 hover:shadow-md transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <FiBookOpen size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1c1c28]">Create Course</h4>
                    <p className="text-xs text-slate-500 mt-1">Design a new curriculum</p>
                  </div>
                </button>

                <button onClick={() => navigate('/admin/fees')} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex items-center gap-5 hover:border-orange-200 hover:shadow-md transition-all text-left group">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MdCurrencyRupee size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#1c1c28]">Collect Fees</h4>
                    <p className="text-xs text-slate-500 mt-1">Manage pending payments</p>
                  </div>
                </button>
              </>
            )}

          </div>
        </div>

      </div>
  ); 
};
  
export default Dashboard;