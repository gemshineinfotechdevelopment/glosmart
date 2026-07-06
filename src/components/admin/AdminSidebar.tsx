import React from 'react';
import { 
  FiGrid, FiUsers, FiBookOpen, FiUserCheck, 
  FiDollarSign, FiCalendar, FiImage, FiBell, 
  FiSettings, FiLogOut, FiPlus
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid size={20} /> },
    { name: 'Students', path: '#', icon: <FiUsers size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <FiBookOpen size={20} /> },
    { name: 'Teachers', path: '#', icon: <FiUserCheck size={20} /> },
    { name: 'Fees & Payments', path: '/admin/fees', icon: <FiDollarSign size={20} /> },
    { name: 'Academy Schedule', path: '#', icon: <FiCalendar size={20} /> },
    { name: 'Notifications', path: '#', icon: <FiBell size={20} /> },
    { name: 'Settings', path: '#', icon: <FiSettings size={20} /> },
  ];

  return (
    <aside className="w-[280px] bg-[#fdfcff] border-r border-slate-100 flex flex-col h-screen sticky top-0 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.01)] shrink-0">
      <div className="p-8 flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#6247df] flex items-center justify-center text-white font-bold text-xl shadow-md relative">
          <span className="text-white font-extrabold text-lg">G</span>
        </div>
        <div>
          <h1 className="font-bold text-[#1c1c28] text-xl leading-tight">GloSmart Art</h1>
          <p className="text-xs text-slate-500 font-medium">Academy Admin</p>
        </div>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = currentPath === link.path;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-semibold transition-all no-underline ${
                isActive
                  ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/20'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-[#6247df]'
              }`}
            >
              {link.icon} {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 mt-auto flex flex-col gap-4">
        <Link 
          to="/admin/courses?mode=create"
          className="w-full bg-[#6247df] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-purple-900/20 hover:bg-[#5035c9] transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm no-underline"
        >
          <FiPlus size={16} /> Create Course
        </Link>
        <button className="flex items-center gap-3 px-4 py-2 text-slate-600 font-semibold hover:text-[#6247df] transition-all bg-transparent border-none cursor-pointer text-sm">
          <FiLogOut size={20} /> Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
