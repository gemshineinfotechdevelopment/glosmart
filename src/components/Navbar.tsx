import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-xs font-bold tracking-wider transition-colors duration-300 no-underline ${
      isActive ? 'text-[#5b21b6]' : 'text-[#616c96] hover:text-[#5b21b6]'
    }`;
  };

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'CONTACT', path: '/contact' },
    { name: 'GALLERY', path: '/gallery' },
    { name: 'COURSES', path: '/courses' },
    { name: 'FAQS', path: '/faqs' },
  ];

  return (
    <header
      className={`flex justify-center items-center px-5 fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'py-3 bg-[#faf7f0]/85 backdrop-blur-md shadow-sm border-b border-[#1e295d]/5'
          : 'py-6 bg-transparent'
      }`}
    >
      <div
        className={`flex justify-between items-center w-full max-w-7xl transition-all duration-300 ${
          isScrolled
            ? 'bg-transparent shadow-none border-transparent px-3 py-1'
            : 'bg-white rounded-full px-6 py-2.5 shadow-xl shadow-slate-100/40 border border-white/80 backdrop-blur-sm'
        }`}
      >
        <Link to="/" className="font-fredoka text-2xl font-bold text-[#004b73] no-underline flex items-center">
          Glo<span className="text-[#0077b6]">Smart</span>
        </Link>
        
        {/* Desktop Nav */}
        <nav className="hidden lg:block">
          <ul className="flex gap-8 list-none m-0 p-0">
            {navLinks.map(link => (
              <li key={link.name}>
                <Link to={link.path} className={getLinkClass(link.path)}>
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop CTA */}
        <div className="hidden lg:flex items-center gap-5">
          <Link to="/login" className="text-sm font-bold text-[#00668f] hover:opacity-80 transition-opacity no-underline">
            Login
          </Link>
          <Link to="/courses" className="bg-[#00668f] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-md shadow-sky-100/50 hover:bg-[#005172] transition-colors no-underline">
            Join Academy
          </Link>
        </div>

        {/* Mobile Hamburger Toggle */}
        <div className="lg:hidden flex items-center gap-4">
          <button
            onClick={toggleMenu}
            className="text-[#004b73] hover:text-[#0077b6] focus:outline-none"
            aria-label="Toggle menu"
          >
            {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 mt-2 mx-5 bg-white rounded-3xl p-5 border border-slate-100 flex flex-col gap-4 shadow-xl">
          <div className="flex flex-col gap-3 font-semibold text-sm tracking-wider text-slate-600">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`py-2 border-b border-slate-50 transition-all duration-200 ${
                  location.pathname === link.path ? 'text-[#5b21b6] font-bold pl-2 border-l-2 border-[#5b21b6]' : 'hover:text-[#5b21b6]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Link 
              to="/login" 
              onClick={() => setIsOpen(false)} 
              className="w-full bg-slate-50 text-slate-700 font-semibold py-3 rounded-full hover:bg-slate-100 transition-all text-center no-underline"
            >
              Log in
            </Link>
            <Link 
              to="/courses" 
              onClick={() => setIsOpen(false)} 
              className="w-full bg-[#00668f] text-white font-semibold py-3 rounded-full hover:bg-[#005172] transition-all text-center no-underline"
            >
              Join Academy
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
