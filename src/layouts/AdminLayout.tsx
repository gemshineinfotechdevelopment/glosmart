import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import AdminSidebar from '../components/admin/AdminSidebar';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminHomePage = location.pathname === '/admin' || location.pathname === '/admin/';

  return (
    <div className="flex flex-col lg:flex-row h-screen overflow-hidden bg-[#fafbfc] font-sans text-slate-800">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Top Header with Back Button (hidden on admin home page) */}
        {!isAdminHomePage && (
          <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 sm:px-6 md:px-10 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs shrink-0">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-700 hover:text-[#005577] hover:bg-slate-100 transition-all border border-slate-200/80 bg-white shadow-xs cursor-pointer group flex items-center justify-center"
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

export default AdminLayout;
