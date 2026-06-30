import React from 'react';
import { Link } from 'react-router-dom';
import { FiPhone, FiMail, FiMapPin, FiInstagram, FiTwitter, FiYoutube } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1e233d] text-slate-300 rounded-t-[2.5rem] md:rounded-t-[4rem] pt-16 pb-8 px-6 md:px-16 mt-20">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12 border-b border-slate-700/50">
        
        {/* Column 1: Brand Info */}
        <div className="flex flex-col gap-5">
          <Link to="/" className="text-2xl font-bold tracking-tight text-white">
            Glo<span className="text-[#0ea5e9]">Smart</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs">
            Empowering young minds to explore their creative potential and paint their dreams.
          </p>
          <div className="flex gap-4 mt-2">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0ea5e9] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-md">
              <FiInstagram size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0ea5e9] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-md">
              <FiTwitter size={18} />
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 hover:bg-[#0ea5e9] flex items-center justify-center text-white transition-all duration-300 hover:scale-110 shadow-md">
              <FiYoutube size={18} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-white font-semibold text-lg mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#0ea5e9]">
            Quick Links
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><Link to="/" className="hover:text-white transition-colors">Home</Link></li>
            <li><Link to="/" className="hover:text-white transition-colors">About</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition-colors">Gallery</Link></li>
            <li><Link to="/faqs" className="hover:text-white transition-colors">FAQs</Link></li>
          </ul>
        </div>

        {/* Column 3: Courses */}
        <div>
          <h4 className="text-white font-semibold text-lg mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#0ea5e9]">
            Our Courses
          </h4>
          <ul className="flex flex-col gap-3 text-sm">
            <li><a href="#" className="hover:text-white transition-colors">Pre-Junior (Ages 4-6)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Junior (Ages 7-10)</a></li>
            <li><a href="#" className="hover:text-white transition-colors">Senior (Ages 11-15)</a></li>
          </ul>
        </div>

        {/* Column 4: Contact */}
        <div className="flex flex-col gap-4">
          <h4 className="text-white font-semibold text-lg mb-5 relative pb-2 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#0ea5e9]">
            Contact Us
          </h4>
          <div className="flex items-center gap-3 text-sm">
            <FiPhone className="text-[#0ea5e9] shrink-0" size={16} />
            <span>+1 234 567 890</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <FiMail className="text-[#0ea5e9] shrink-0" size={16} />
            <span>hello@glosmartacademy.com</span>
          </div>
          <div className="flex items-start gap-3 text-sm">
            <FiMapPin className="text-[#0ea5e9] shrink-0 mt-0.5" size={16} />
            <span className="leading-relaxed">123 Art Avenue, Creative District, New York, NY 10001</span>
          </div>
        </div>

      </div>

      {/* Copyright row */}
      <div className="max-w-7xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-medium">
        <p>© 2026 GloSmart Academy. All rights reserved.</p>
        <div className="flex items-center gap-2">
          <span>Designed with</span>
          <span className="text-red-500">❤</span>
          <span>for kids creativity.</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
