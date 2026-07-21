import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import StudentSidebar from '../components/student/StudentSidebar';

const StudentLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isStudentHomePage = location.pathname === '/student/dashboard' || location.pathname === '/student/dashboard/';

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8FAFC] w-full font-sans text-slate-800">
      <StudentSidebar />
      <main className="flex-1 flex flex-col min-h-screen relative w-full min-w-0">
        {/* Separate Top Header Bar for Back Button (mobile view only, hidden on student dashboard home page) */}
        {!isStudentHomePage && (
          <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-700 hover:text-[#4700b3] hover:bg-slate-100 transition-all border border-slate-200 bg-white shadow-xs cursor-pointer shrink-0 group flex items-center justify-center"
              title="Go back"
              aria-label="Go back"
            >
              <FiArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
            </button>
          </div>
        )}

        <div className="flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default StudentLayout;
