import React, { useState } from 'react';
import {
  FiPlay, FiSmile, FiTrendingUp, FiImage, FiShield,
  FiStar, FiCheck, FiChevronDown,
} from 'react-icons/fi';
import { FaPalette, FaRocket, FaPaintBrush } from 'react-icons/fa';

import bgImage from '../assets/background-home.jpeg';

// Mock images since we don't have the exact ones from the design
const mockAvatar1 = "https://i.pravatar.cc/150?img=1";
const mockAvatar2 = "https://i.pravatar.cc/150?img=2";
const mockArtwork1 = "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80";
const mockArtwork2 = "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=400&q=80";
const mockArtwork3 = "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=400&q=80";
const mockArtwork4 = "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&q=80";

const Home: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main
      className="w-full min-h-screen overflow-hidden text-slate-800 font-sans"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: '100% auto',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'top center'
      }}
    >

      {/* 1. Hero Section */}
      <section className="relative w-full pt-40 pb-32 px-6 lg:px-20 overflow-hidden">
        {/* Playful background shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-purple-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob"></div>
        <div className="absolute top-10 right-20 w-40 h-40 bg-pink-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-10 left-1/3 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-2xl opacity-50 animate-blob animation-delay-4000"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="flex flex-col gap-6 text-left">
            <div className="inline-flex">
              <span className="bg-pink-100 text-pink-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Kids Learning
              </span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight text-[#1A254C]">
              Ignite Your<br />Inner<br />
              <span className="text-[#66c2e3]">Masterpiece</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-md leading-relaxed">
              Learn the core of art, involve in growth today! Over 100+ new courses in this month, bring new learning program.
            </p>
            <div className="flex items-center gap-6 mt-4">
              <button className="bg-[#005577] text-white px-8 py-3.5 rounded-full font-bold hover:bg-[#003d55] hover:shadow-xl transition-all hover:-translate-y-1">
                Start for free
              </button>
              <button className="flex items-center gap-3 text-slate-600 font-bold hover:text-[#005577] transition-all group">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <FiPlay className="text-[#005577] ml-1" />
                </div>
                Watch Video
              </button>
            </div>
          </div>

          {/* Hero Image Side */}
          <div className="relative flex justify-center">
            <div className="w-full max-w-[480px] aspect-square rounded-full bg-teal-100/50 flex items-center justify-center p-8 relative shadow-[0_0_60px_rgba(102,194,227,0.3)]">
              {/* Note: In a real app we'd use the provided tablet illustration here */}
              <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-inner overflow-hidden border-8 border-white relative">
                <div className="absolute inset-0 bg-[#e0f7f4]"></div>
                <FaPaintBrush className="text-9xl text-teal-300 relative z-10" />
              </div>
              <div className="absolute top-10 right-10 bg-yellow-300 text-yellow-800 text-xs font-bold px-4 py-2 rounded-full rotate-12 shadow-lg">
                Top Rated
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Stats Floating Bar */}
      <div className="relative max-w-5xl mx-auto -mt-16 z-20 px-6">
        <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] py-8 px-10 flex flex-wrap justify-around items-center border border-slate-50 gap-6">
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#1A254C] relative">
              50<span className="text-[#66c2e3]">+</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#66c2e3] rounded-full"></div>
            </span>
            <span className="text-slate-500 font-semibold mt-4">Mentors</span>
          </div>
          <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#1A254C] relative">
              25<span className="text-pink-400">+</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-pink-400 rounded-full"></div>
            </span>
            <span className="text-slate-500 font-semibold mt-4">Awards</span>
          </div>
          <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#1A254C] relative">
              40<span className="text-green-400">+</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-green-400 rounded-full"></div>
            </span>
            <span className="text-slate-500 font-semibold mt-4">Courses</span>
          </div>
          <div className="w-px h-12 bg-slate-100 hidden md:block"></div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-extrabold text-[#1A254C] relative">
              1M<span className="text-purple-400">+</span>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-1 bg-purple-400 rounded-full"></div>
            </span>
            <span className="text-slate-500 font-semibold mt-4">Students</span>
          </div>
        </div>
      </div>

      {/* 3. Blue Promotional Banner */}
      <div className="w-full bg-[#66c2e3] py-4 mt-16 overflow-hidden">
        <div className="whitespace-nowrap flex animate-marquee">
          {/* Duplicated for seamless marquee */}
          {[...Array(3)].map((_, i) => (
            <span key={i} className="text-white font-bold text-sm tracking-widest mx-10">
              Learn the Core of Art, Involve in Growth Today! OVER 100+ NEW COURSES
            </span>
          ))}
        </div>
      </div>

      {/* 4. Curriculum Section */}
      <section className="relative pt-24 pb-48 bg-[#f4fbff] px-6">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          <div className="mb-2 bg-blue-100 p-2 rounded-full text-blue-500">
            <FaPalette size={24} />
          </div>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A254C] mb-12">
            Our Specialized Curriculum
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
            {/* Pre-Junior */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-50 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-blue-100 text-blue-500 rounded-2xl flex items-center justify-center mb-6">
                <FiSmile size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1A254C] mb-4">Pre-Junior</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Perfect for tiny hands. We focus on basic shapes, primary colors, and messy, joyful experimentation.
              </p>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2"><FiCheck className="text-blue-500" /> Basic Colors</li>
                <li className="flex items-center gap-2"><FiCheck className="text-blue-500" /> Hand-Eye Skills</li>
              </ul>
            </div>

            {/* Junior */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-50 text-left hover:-translate-y-2 transition-transform duration-300 relative">
              <div className="absolute -top-4 right-8 bg-pink-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                Popular
              </div>
              <div className="w-14 h-14 bg-pink-100 text-pink-500 rounded-2xl flex items-center justify-center mb-6">
                <FaRocket size={24} />
              </div>
              <h3 className="text-xl font-bold text-[#1A254C] mb-4">Junior</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Expanding creativity with color theory, basic anatomy, and an introduction to digital tools.
              </p>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2"><FiCheck className="text-pink-500" /> Color Theory</li>
                <li className="flex items-center gap-2"><FiCheck className="text-pink-500" /> Digital Intro</li>
              </ul>
            </div>

            {/* Senior */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-blue-900/5 border border-slate-50 text-left hover:-translate-y-2 transition-transform duration-300">
              <div className="w-14 h-14 bg-green-100 text-green-500 rounded-2xl flex items-center justify-center mb-6">
                <FiTrendingUp size={28} />
              </div>
              <h3 className="text-xl font-bold text-[#1A254C] mb-4">Senior</h3>
              <p className="text-slate-500 text-sm mb-6 leading-relaxed">
                Advanced techniques, portfolio building, and developing a unique personal artistic voice.
              </p>
              <ul className="flex flex-col gap-3 text-sm font-semibold text-slate-700">
                <li className="flex items-center gap-2"><FiCheck className="text-green-500" /> Advanced Skills</li>
                <li className="flex items-center gap-2"><FiCheck className="text-green-500" /> Portfolio Prep</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pink Clouds Divider (Using SVG) */}
        <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-[150px] fill-pink-300 transform rotate-180">
            <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
          </svg>
        </div>
      </section>

      {/* 5. Objectives Section */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A254C] text-center max-w-2xl mb-16">
            Unlock Because to Achieve Your Creative Objectives
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full">
            <div className="flex flex-col justify-center">
              <h3 className="text-2xl font-bold text-[#1A254C] mb-4">Playful Rewards</h3>
              <p className="text-slate-500 leading-relaxed max-w-md">
                Earn badges and points for every masterpiece created. Our gamified system keeps children engaged, motivated, and eager to learn the next creative skill on their journey.
              </p>
              <div className="mt-8 flex gap-4">
                {/* Decorative colorful dots */}
                <div className="w-3 h-3 rounded-full bg-pink-400"></div>
                <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex-1 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-200 text-blue-600 rounded-full flex items-center justify-center mb-6">
                  <FiTrendingUp size={28} />
                </div>
                <h4 className="font-bold text-[#1A254C] mb-2">Skill Analysis</h4>
                <p className="text-sm text-slate-500">Track progress through detailed, positive skill reports.</p>
              </div>
              <div className="bg-pink-50/50 rounded-3xl p-8 border border-pink-100 flex-1 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-pink-200 text-pink-600 rounded-full flex items-center justify-center mb-6">
                  <FiImage size={28} />
                </div>
                <h4 className="font-bold text-[#1A254C] mb-2">Art Expo</h4>
                <p className="text-sm text-slate-500">Participate in monthly digital exhibitions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Leaderboard Section */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-[#fffcf7] rounded-[2.5rem] p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.02)] border border-orange-50 relative overflow-hidden">
            {/* Background decors */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full mix-blend-multiply opacity-50 -translate-y-1/2 translate-x-1/2"></div>

            <div className="flex justify-between items-center mb-8 relative z-10">
              <div>
                <h3 className="text-2xl font-extrabold text-[#1A254C]">Academy Leaderboard</h3>
                <p className="text-slate-500 text-sm mt-1">Top creators this month across all groups.</p>
              </div>
              <button className="text-[#005577] text-sm font-bold flex items-center gap-1 hover:underline">
                View full <FiChevronDown />
              </button>
            </div>

            <div className="flex flex-col gap-4 relative z-10">
              {/* Row 1 */}
              <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                <div className="w-8 font-bold text-slate-400 text-center">#1</div>
                <img src={mockAvatar1} alt="Bella" className="w-12 h-12 rounded-full border-2 border-green-200" />
                <div className="flex-1">
                  <div className="font-bold text-[#1A254C]">Bella</div>
                </div>
                <div className="hidden sm:block">
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Intermediate</span>
                </div>
                <div className="font-bold text-[#005577] text-lg">12,400 Pt</div>
              </div>

              {/* Row 2 */}
              <div className="bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border border-slate-100">
                <div className="w-8 font-bold text-slate-400 text-center">#2</div>
                <img src={mockAvatar2} alt="John" className="w-12 h-12 rounded-full border-2 border-blue-200" />
                <div className="flex-1">
                  <div className="font-bold text-[#1A254C]">John</div>
                </div>
                <div className="hidden sm:block">
                  <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">Beginner</span>
                </div>
                <div className="font-bold text-[#005577] text-lg">10,000 Pt</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Why Families Love Us */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto bg-[#1A254C] rounded-[3rem] p-12 lg:p-20 text-white text-center relative overflow-hidden">
          {/* Subtle background circles */}
          <div className="absolute -top-20 -left-20 w-64 h-64 border-[30px] border-white/5 rounded-full"></div>
          <div className="absolute -bottom-20 -right-20 w-80 h-80 border-[30px] border-white/5 rounded-full"></div>

          <h2 className="text-3xl lg:text-4xl font-extrabold mb-16 relative z-10">Why Families Love Us</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative z-10">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mb-6 text-blue-400">
                <FiShield size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Child-Safe Content</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Fully moderated platforms ensuring a 100% secure environment for children to share art.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mb-6 text-pink-400">
                <FiStar size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Expert Mentors</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Vetted professional artists who know how to communicate and inspire young minds.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-400">
                <FiTrendingUp size={32} />
              </div>
              <h3 className="font-bold text-xl mb-3">Skill Tracking</h3>
              <p className="text-slate-300 text-sm leading-relaxed">Parents can easily monitor growth and see milestone achievements in real-time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Creative Stars */}
      <section className="py-12 px-6 text-center">
        <h2 className="text-3xl font-extrabold text-[#1A254C] mb-2">Creative Stars</h2>
        <p className="text-slate-500 mb-12">Discover our top community masterpieces</p>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[mockArtwork1, mockArtwork2, mockArtwork3, mockArtwork4].map((src, i) => (
            <div key={i} className="aspect-square rounded-3xl overflow-hidden shadow-lg border-4 border-white transform hover:scale-105 transition-transform duration-300">
              <img src={src} alt="Artwork" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* 9. Pricing */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl lg:text-4xl font-extrabold text-[#1A254C] mb-8">Choose Your Art Plan</h2>

          {/* Toggle */}
          <div className="bg-white rounded-full p-1 inline-flex shadow-sm mb-16 border border-slate-100">
            <button
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isYearly ? 'bg-[#005577] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setIsYearly(false)}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isYearly ? 'bg-[#005577] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
              onClick={() => setIsYearly(true)}
            >
              Yearly (Save 20%)
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl items-center">
            {/* Basic */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex flex-col h-full text-left">
              <h3 className="text-xl font-bold text-[#1A254C] mb-2">Basic</h3>
              <p className="text-slate-500 text-sm mb-6">For casual learners</p>
              <div className="text-4xl font-extrabold text-[#1A254C] mb-8">
                $29<span className="text-lg text-slate-400 font-medium">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm font-semibold text-slate-600 mb-8 flex-grow">
                <li className="flex items-center gap-3"><FiCheck className="text-green-500" /> Access to 10 basic courses</li>
                <li className="flex items-center gap-3"><FiCheck className="text-green-500" /> Community gallery access</li>
              </ul>
              <button className="w-full py-4 rounded-full border-2 border-[#005577] text-[#005577] font-bold hover:bg-[#005577] hover:text-white transition-all">
                Select Plan
              </button>
            </div>

            {/* Mastery (Highlighted) */}
            <div className="bg-[#005577] rounded-[2rem] p-8 shadow-2xl shadow-blue-900/20 flex flex-col h-full text-left relative transform md:-translate-y-4">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-pink-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-md">
                MOST POPULAR
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Mastery</h3>
              <p className="text-blue-200 text-sm mb-6">Full academy access</p>
              <div className="text-5xl font-extrabold text-white mb-8">
                $59<span className="text-lg text-blue-300 font-medium">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm font-semibold text-blue-50 mb-8 flex-grow">
                <li className="flex items-center gap-3"><FiCheck className="text-pink-400" /> All 100+ premium courses</li>
                <li className="flex items-center gap-3"><FiCheck className="text-pink-400" /> 1-on-1 monthly review</li>
                <li className="flex items-center gap-3"><FiCheck className="text-pink-400" /> Skill tracking reports</li>
              </ul>
              <button className="w-full py-4 rounded-full bg-white text-[#005577] font-bold hover:bg-slate-100 transition-all shadow-lg">
                Start Free Trial
              </button>
            </div>

            {/* Elite */}
            <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100 flex flex-col h-full text-left">
              <h3 className="text-xl font-bold text-[#1A254C] mb-2">Elite</h3>
              <p className="text-slate-500 text-sm mb-6">For dedicated prodigies</p>
              <div className="text-4xl font-extrabold text-[#1A254C] mb-8">
                $129<span className="text-lg text-slate-400 font-medium">/mo</span>
              </div>
              <ul className="flex flex-col gap-4 text-sm font-semibold text-slate-600 mb-8 flex-grow">
                <li className="flex items-center gap-3"><FiCheck className="text-green-500" /> Everything in Mastery</li>
                <li className="flex items-center gap-3"><FiCheck className="text-green-500" /> Weekly private tutoring</li>
                <li className="flex items-center gap-3"><FiCheck className="text-green-500" /> Priority expo features</li>
              </ul>
              <button className="w-full py-4 rounded-full border-2 border-[#005577] text-[#005577] font-bold hover:bg-[#005577] hover:text-white transition-all">
                Select Plan
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 10. CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-[#c5e85c] rounded-[3rem] p-10 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-xl shadow-lime-900/5">
          {/* Deco circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full mix-blend-overlay -translate-y-1/2 translate-x-1/3"></div>

          <div className="flex-1 z-10 text-left">
            <h2 className="text-4xl lg:text-5xl font-black text-[#1A254C] mb-6 leading-tight">
              Start Your<br />Art Journey<br />Today!
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                <img src={mockAvatar1} className="w-10 h-10 rounded-full border-2 border-white" alt="Student" />
                <img src={mockAvatar2} className="w-10 h-10 rounded-full border-2 border-white" alt="Student" />
                <div className="w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">+1K</div>
              </div>
              <span className="text-sm font-bold text-[#1A254C]">Join with us</span>
            </div>
          </div>

          <div className="flex-1 z-10 flex justify-center md:justify-end">
            <div className="w-64 h-64 bg-white/40 rounded-full flex items-center justify-center backdrop-blur-sm p-8 shadow-inner border-4 border-white/50">
              {/* Placeholder for Crayon Box */}
              <div className="text-center text-[#1A254C]">
                <FaPalette className="text-6xl mx-auto mb-4 text-[#005577]" />
                <span className="font-bold">Creative Box</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-extrabold text-[#1A254C] text-center mb-12">Common Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#1A254C]">What age group is this for?</h4>
                <FiChevronDown className="text-slate-400 mt-1" />
              </div>
              <p className="text-sm text-slate-500">We offer specialized programs for children from ages 4 up to 18, tailored to developmental stages.</p>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#1A254C]">Do I need to buy art supplies?</h4>
                <FiChevronDown className="text-slate-400 mt-1" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#1A254C]">Are the live sessions recorded?</h4>
                <FiChevronDown className="text-slate-400 mt-1" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-[#1A254C]">Can we cancel the subscription?</h4>
                <FiChevronDown className="text-slate-400 mt-1" />
              </div>
            </div>

          </div>
        </div>
      </section>

    </main>
  );
};

export default Home;
