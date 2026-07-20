import React, { useState, useEffect } from 'react';
import {
  FiGrid,
  FiActivity,
  FiBook,
  FiClipboard,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser
} from 'react-icons/fi';
import { MdOutlinePayment } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const StudentSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const currentPath = location.pathname;
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath]);

  const links = [
    { name: 'Dashboard', path: '/student/dashboard', icon: <FiGrid size={20} /> },
    { name: 'Attendance Insight', path: '/student/attendance', icon: <FiActivity size={20} /> },
    { name: 'Courses', path: '/student/courses', icon: <FiBook size={20} /> },
    { name: 'Assignments', path: '/student/assignments', icon: <FiClipboard size={20} /> },
    { name: 'Fees & Payment', path: '/student/fees', icon: <MdOutlinePayment size={20} /> },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-sm w-full">
        <div>
          <h1 className="font-extrabold text-[#4700b3] text-lg tracking-wide leading-tight">GloSmart Art</h1>
          <p className="text-[10px] text-slate-500 font-medium">Student Portal</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/student/profile')}
            className="w-8 h-8 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center border border-purple-100 cursor-pointer"
            aria-label="Profile"
          >
            <FiUser size={16} />
          </button>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Slide-Out Drawer */}
      <div
        className={`lg:hidden fixed top-0 left-0 bottom-0 w-[280px] bg-[#fdfcff] z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div>
            <h1 className="font-extrabold text-[#4700b3] text-xl tracking-wide">GloSmart Art</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">Academy Student Portal</p>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-1.5 overflow-y-auto font-sans">
          {links.map((link) => {
            const isActive = currentPath === link.path || (link.name === 'Dashboard' && currentPath === '/student/profile');
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all no-underline ${
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

        <div className="p-5 border-t border-slate-200 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-500 font-semibold hover:text-slate-800 transition-all bg-transparent border-none cursor-pointer text-[15px] rounded-xl hover:bg-slate-50"
          >
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Spacer */}
      <div className="w-[280px] hidden lg:block shrink-0"></div>

      {/* Desktop Fixed Sidebar */}
      <aside className="w-[280px] bg-[#fdfcff] border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex shadow-sm shrink-0">
        <div className="p-8 pb-4">
          <h1 className="font-extrabold text-[#4700b3] text-xl tracking-wide">GloSmart Art</h1>
          <p className="text-xs text-slate-500 font-medium mt-1">Academy Student Portal</p>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-1.5 overflow-y-hidden hover:overflow-y-auto font-sans mt-4">
          {links.map((link) => {
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
