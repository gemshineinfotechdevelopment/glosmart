import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

interface NavLinkItem {
  name: string;
  path: string;
}

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const navLinks: NavLinkItem[] = [
    { name: 'ABOUT', path: '/' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'GALLERY', path: '/gallery' },
    { name: 'COURSES', path: '/courses' },
    { name: 'FAQs', path: '/faqs' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-7xl bg-white/90 backdrop-blur-md rounded-full shadow-lg shadow-slate-100 z-50 border border-slate-100/50 px-6 md:px-8 py-3 transition-all duration-300">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <span className="text-xl md:text-2xl font-bold tracking-tight text-[#0ea5e9]">
            Glo<span className="text-[#081f37]">Smart</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden lg:flex items-center gap-8 font-semibold text-xs tracking-wider text-slate-600">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `hover:text-[#0ea5e9] transition-all duration-200 ${
                  isActive ? 'text-[#0ea5e9] font-bold border-b-2 border-[#0ea5e9] pb-0.5' : ''
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </div>

        {/* Desktop CTA Buttons */}
        <div className="hidden lg:flex items-center gap-5">
          <button className="text-sm font-semibold text-slate-700 hover:text-[#0ea5e9] transition-all">
            Log in
          </button>
          <button className="bg-[#0b3142] text-white text-xs md:text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-[#0ea5e9] hover:shadow-lg hover:shadow-sky-100 transition-all duration-300 hover:scale-105">
            Join Academy
          </button>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button className="text-xs font-semibold text-slate-700">Log in</button>
          <button
            onClick={toggleMenu}
            className="text-slate-700 hover:text-[#0ea5e9] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden mt-4 bg-white rounded-3xl p-5 border border-slate-100 flex flex-col gap-4 animate-fade-in">
          <div className="flex flex-col gap-3 font-semibold text-sm tracking-wider text-slate-600">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `hover:text-[#0ea5e9] py-2 border-b border-slate-50 transition-all duration-200 ${
                    isActive ? 'text-[#0ea5e9] font-bold pl-2 border-l-2 border-[#0ea5e9]' : ''
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <button className="w-full bg-slate-50 text-slate-700 font-semibold py-3 rounded-full hover:bg-slate-100 transition-all">
              Log in
            </button>
            <button className="w-full bg-[#0b3142] text-white font-semibold py-3 rounded-full hover:bg-[#0ea5e9] transition-all">
              Join Academy
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
