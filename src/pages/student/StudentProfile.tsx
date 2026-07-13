import React from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { FiEdit2, FiDownload, FiPlus } from 'react-icons/fi';

const StudentProfile: React.FC = () => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB] w-full font-sans">
      <StudentSidebar />
      
      <main className="flex-1 flex flex-col min-h-screen relative">
        {/* Top Header */}
        <div className="flex justify-between items-center px-10 py-8">
          <div>
            <h1 className="text-2xl font-bold text-[#111827]">Student Profile</h1>
            <p className="text-[#6B7280] text-[15px] mt-1">Manage and view student progress</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#111827] leading-none">Alex Thompson</p>
              <p className="text-xs text-[#6B7280] mt-1">Head Administrator</p>
            </div>
            <img 
              src="https://ui-avatars.com/api/?name=Alex+Thompson&background=e5e7eb&color=374151" 
              alt="Alex Thompson" 
              className="w-10 h-10 rounded-full object-cover shadow-sm"
            />
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="flex-1 flex items-start justify-center mt-2 px-6">
          <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-10 w-full max-w-[680px] border border-slate-100/50 flex flex-col items-center">
            
            {/* Avatar Section */}
            <div className="relative mb-6">
              <div className="w-[170px] h-[170px] rounded-full bg-[#f0e8ff] flex items-center justify-center shadow-inner">
                <img 
                  src="https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
                  alt="Sarah Jenkins" 
                  className="w-[140px] h-[140px] rounded-full object-cover"
                />
              </div>
              <div className="absolute bottom-2 right-2 bg-[#4ade80] text-[#064e3b] text-[11px] font-bold px-4 py-1.5 rounded-full border-[3px] border-white uppercase tracking-wider shadow-sm">
                Active
              </div>
            </div>

            {/* Name & ID */}
            <h2 className="text-[32px] font-bold text-[#111827] mb-2 tracking-tight">Sarah Jenkins</h2>
            <p className="text-[#6B7280] text-[15px] mb-10">Student ID: GS-2024-8832</p>

            {/* Info Grid */}
            <div className="w-full border-y border-slate-100 py-8 mb-8">
              <div className="grid grid-cols-2 gap-y-8 gap-x-6 px-4">
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Age / Grade</p>
                  <p className="font-bold text-[#111827] text-base">10 yrs / 5th Grade</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Parent</p>
                  <p className="font-bold text-[#111827] text-base">Michael Jenkins</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Contact</p>
                  <p className="font-bold text-[#111827] text-base">+1 (555) 012-3456</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Joined</p>
                  <p className="font-bold text-[#111827] text-base">Jan 12, 2024</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <button className="flex-1 bg-[#4700b3] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d0099] transition-colors border-none cursor-pointer shadow-md shadow-purple-900/10">
                <FiEdit2 size={18} /> Edit Profile
              </button>
              <button className="flex-1 bg-[#eef0f7] text-[#111827] py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#e5e7eb] transition-colors border-none cursor-pointer">
                <FiDownload size={18} /> Download Portfolio
              </button>
            </div>
            
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center pb-6 pt-10 mt-auto">
          <p className="text-[13px] font-medium text-[#9CA3AF]">
            © 2024 GloSmart Art Academy. Cultivating Creativity Daily.
          </p>
        </div>

        {/* Floating Action Button */}
        <button className="absolute bottom-10 right-10 w-16 h-16 bg-[#4700b3] rounded-full shadow-xl shadow-[#4700b3]/30 flex items-center justify-center text-white hover:bg-[#3d0099] transition-transform hover:scale-105 border-none cursor-pointer">
          <FiPlus size={28} />
        </button>

      </main>
    </div>
  );
};

export default StudentProfile;
