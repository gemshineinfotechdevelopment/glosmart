import React from 'react';
import { 
  FiGrid, FiUsers, FiBookOpen, FiUserCheck, 
  FiCalendar, FiImage, FiBell, 
  FiSettings, FiLogOut, FiPlus
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';
import { Link, useLocation } from 'react-router-dom';

const AdminSidebar: React.FC = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <FiGrid size={20} /> },
    { name: 'Students', path: '/admin/students', icon: <FiUsers size={20} /> },
    { name: 'Courses', path: '/admin/courses', icon: <FiBookOpen size={20} /> },
    { name: 'Teachers', path: '#', icon: <FiUserCheck size={20} /> },
    { name: 'Fees & Payments', path: '/admin/fees', icon: <MdCurrencyRupee size={20} /> },
    { name: 'Academy Schedule', path: '#', icon: <FiCalendar size={20} /> },
    { name: 'Gallery', path: '#', icon: <FiImage size={20} /> },
    { name: 'Notifications', path: '#', icon: <FiBell size={20} /> },
    { name: 'Settings', path: '#', icon: <FiSettings size={20} /> },
  ];

  return (
    <>
      {/* Spacer to preserve layout space for the fixed sidebar */}
      <div className="w-[280px] hidden lg:block shrink-0"></div>

      <aside className="w-[280px] bg-[#fdfcff] border-r border-slate-100 flex flex-col h-screen fixed left-0 top-0 z-40 hidden lg:flex shadow-[4px_0_24px_rgba(0,0,0,0.01)] shrink-0">
        <div className="p-8 flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-xl shadow-lg relative overflow-hidden">
            <div className="absolute inset-1.5 rounded-lg bg-white/15 backdrop-blur-sm flex items-center justify-center text-white font-extrabold text-lg">
              G
            </div>
          </div>
          <div>
            <h1 className="font-bold text-[#6247df] text-xl leading-tight">GloSmart Art</h1>
            <p className="text-xs text-slate-500 font-medium">Academy Admin</p>
          </div>
        </div>

        <nav className="flex-1 px-4 flex flex-col gap-2 overflow-y-hidden hover:overflow-y-auto">
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
        <button className="w-full bg-[#6247df] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-purple-900/20 hover:bg-[#5035c9] transition-all border-none cursor-pointer flex items-center justify-center gap-2 text-sm">
          <FiPlus size={16} /> Create Coùrse
        </button>
        <button className="flex items-center gap-3 px-4 py-2 text-slate-600 font-semibold hover:text-[#6247df] transition-all bg-transparent border-none cursor-pointer text-sm">
          <FiLogOut size={20} /> Logoùt
        </button>
      </div>
    </aside>
    </>
  );
};

export default AdminSidebar;
