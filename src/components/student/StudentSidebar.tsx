import React from 'react';
import {
  FiGrid,
  FiActivity,
  FiBook,
  FiClipboard,
  FiLogOut
} from 'react-icons/fi';
import { MdOutlinePayment } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <FiGrid size={20} /> },
    { name: 'Attendance Insight', path: '/student/attendance', icon: <FiActivity size={20} /> },
    { name: 'Courses', path: '/student/courses', icon: <FiBook size={20} /> },
    { name: 'Assignments', path: '/student/assignments', icon: <FiClipboard size={20} /> },
    { name: 'Fees & Payment', path: '/student/fees', icon: <MdOutlinePayment size={20} /> },
  ];

  return (
    <>
      {/* Spacer to preserve layout space for the fixed sidebar */}
      <div className="w-[280px] hidden lg:block shrink-0"></div>

      <aside className="w-[280px] bg-[#fdfcff] border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex shadow-sm shrink-0">
        <div className="p-8 pb-4">
          <h1 className="font-extrabold text-[#4700b3] text-xl tracking-wide">GloSmart Art</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Academy Student Portal</p>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-hidden hover:overflow-y-auto font-sans mt-4">
          {links.map((link) => {
            // For the profile page preview, let's treat dashboard as active just like in the mockup
            // Or we can check if it's the current path or '/student/profile'
            const isActive = currentPath === link.path || (link.name === 'Dashboard' && currentPath === '/student/profile');
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold transition-all no-underline ${
                  isActive
                    ? 'bg-[#4700b3] text-white shadow-md'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-[#4700b3]'
                }`}
              >
                {link.icon} <span className="text-[15px]">{link.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-6 py-6 border-t border-slate-200 mt-auto flex flex-col gap-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-slate-500 font-semibold hover:text-slate-800 transition-all bg-transparent border-none cursor-pointer text-[15px]">
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default StudentSidebar;
