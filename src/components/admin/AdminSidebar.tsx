import React, { useState, useEffect } from 'react';
import {
  FiGrid, FiUsers, FiBookOpen, FiUserCheck,
  FiBell, FiSettings, FiLogOut, FiImage, FiFileText,
  FiMenu, FiX
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { API_BASE_URL } from '../../config/api';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const currentPath = location.pathname;
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/notifications`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setUnreadCount(data.filter((n: any) => !n.isRead).length);
        }
      })
      .catch(console.error);
  }, [currentPath]);

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <FiUsers size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <FiBookOpen size={20} /> },
    ...(user?.role === 'admin' ? [
      { name: 'Tutors', path: '/admin/teachers', icon: <FiUserCheck size={20} /> },
      { name: 'Fees & Payments', path: '/admin/fees', icon: <MdCurrencyRupee size={20} /> },
      { name: 'Tutor Reports', path: '/admin/tutor-reports', icon: <FiFileText size={20} /> }
    ] : []),
    { name: 'Gallery', path: '/admin/gallery', icon: <FiImage size={20} /> },
    { name: 'Attendance', path: '/admin/attendance', icon: <FiUserCheck size={20} /> },
    { name: 'Notifications', path: '/admin/notifications', icon: <FiBell size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <FiSettings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Top Navigation Bar */}
      <div className="lg:hidden bg-white border-b border-slate-100 px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-sm w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#6247df] flex items-center justify-center text-white font-bold text-base shadow-sm">
            <span>G</span>
          </div>
          <div>
            <h1 className="font-extrabold text-[#1c1c28] text-base leading-tight">GloSmart Art</h1>
            <p className="text-[10px] text-slate-500 font-medium">
              {user?.role === 'teacher' ? 'Academy Tutor' : 'Academy Admin'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Link to="/admin/notifications" className="relative p-1.5 text-slate-600 hover:text-[#6247df]">
              <FiBell size={20} />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#6247df] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            </Link>
          )}

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#6247df] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              <span>G</span>
            </div>
            <div>
              <h1 className="font-bold text-[#1c1c28] text-lg leading-tight">GloSmart Art</h1>
              <p className="text-xs text-slate-500 font-medium">
                {user?.role === 'teacher' ? 'Academy Tutor' : 'Academy Admin'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1 border-none bg-transparent cursor-pointer"
          >
            <FiX size={22} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 flex flex-col gap-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl font-semibold text-sm transition-all no-underline ${
                  isActive
                    ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#6247df]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon} <span>{link.name}</span>
                </div>
                {link.name === 'Notifications' && unreadCount > 0 && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm shrink-0 ${
                    isActive ? 'bg-white text-[#6247df]' : 'bg-[#6247df] text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-5 border-t border-slate-100 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-slate-600 font-semibold hover:text-[#6247df] transition-all bg-transparent border-none cursor-pointer text-sm rounded-xl hover:bg-slate-50"
          >
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </div>

      {/* Desktop Sidebar Spacer */}
      <div className="w-[280px] hidden lg:block shrink-0"></div>

      {/* Desktop Fixed Sidebar */}
      <aside className="w-[280px] bg-[#fdfcff] border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.01)] shrink-0">
        <div className="p-8 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#6247df] flex items-center justify-center text-white font-bold text-xl shadow-md relative">
            <span className="text-white font-extrabold text-lg">G</span>
          </div>
          <div>
            <h1 className="font-bold text-[#1c1c28] text-xl leading-tight">GloSmart Art</h1>
            <p className="text-xs text-slate-500 font-medium">
              {user?.role === 'teacher' ? 'Academy Tutor' : 'Academy Admin'}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto font-sans">
          {links.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`flex items-center justify-between px-4 py-3.5 rounded-2xl font-semibold transition-all no-underline ${
                  isActive
                    ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/20'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#6247df]'
                }`}
              >
                <div className="flex items-center gap-3">
                  {link.icon} <span>{link.name}</span>
                </div>
                {link.name === 'Notifications' && unreadCount > 0 && (
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold shadow-sm shrink-0 ${
                    isActive ? 'bg-white text-[#6247df]' : 'bg-[#6247df] text-white'
                  }`}>
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 mt-auto flex flex-col gap-4">
          <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-2 text-slate-600 font-semibold hover:text-[#6247df] transition-all bg-transparent border-none cursor-pointer text-sm">
            <FiLogOut size={20} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
