import React, { useState, useEffect } from 'react';
import { API_BASE_URL, getImageUrl } from '../config/api';
import { 
  FiEdit3, 
  FiFeather, 
  FiSettings, 
  FiSmile, 
  FiPercent, 
  FiImage, 
  FiArrowRight, 
  FiTarget 
} from 'react-icons/fi';
import { FaPalette } from 'react-icons/fa';
import type { IconType } from 'react-icons';

import PhilosophyCard from '../components/PhilosophyCard';
import MentorCard from '../components/MentorCard';
import StatsSection from '../components/StatsSection';

// Import images
import tabletDrawing from '../assets/tablet_drawing.png';
import designui from '../assets/design_ui.png';

interface Mentor {
  _id?: string;
  name: string;
  role: string;
  description: string;
  image?: string;
  badgeIcon: IconType;
  badgeBg: string;
  badgeColor: string;
}

const defaultMentors: Mentor[] = [
  {
    name: 'Elena Vance',
    role: 'Art Tutor',
    description: 'Specializes in digital illustration, creative software, and UI design concepts.',
    badgeIcon: FaPalette,
    badgeBg: 'bg-emerald-100',
    badgeColor: 'text-emerald-600',
  },
];

const badgeIconsList: IconType[] = [FaPalette, FiEdit3, FiFeather, FiSettings];
const badgeBgsList = ['bg-emerald-100', 'bg-pink-100', 'bg-sky-100', 'bg-lime-100'];
const badgeColorsList = ['text-emerald-600', 'text-pink-600', 'text-sky-600', 'text-lime-600'];

const About: React.FC = () => {
  const [tutors, setTutors] = useState<Mentor[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/teachers`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formattedTutors: Mentor[] = data.map((teacher: any, idx: number) => {
            const imgUrl = getImageUrl(teacher.avatar);

            return {
              _id: teacher._id,
              name: teacher.name,
              role: `Tutor • ${teacher.subject || 'Art & Design'}`,
              description: teacher.experience 
                ? `${teacher.experience} experience. ${teacher.qualification || ''}` 
                : teacher.qualification || 'Certified Art Tutor & Creative Educator.',
              image: imgUrl || undefined,
              badgeIcon: badgeIconsList[idx % badgeIconsList.length],
              badgeBg: badgeBgsList[idx % badgeBgsList.length],
              badgeColor: badgeColorsList[idx % badgeColorsList.length]
            };
          });
          setTutors(formattedTutors);
        } else {
          setTutors(defaultMentors);
        }
      })
      .catch((err) => {
        console.error('Error fetching teachers for About page:', err);
        setTutors(defaultMentors);
      });
  }, []);

  return (
    <main className="w-full max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-16 flex flex-col gap-24">
     

      {/* 1. Hero Section */}
   
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Content Column */}
        <div className="lg:col-span-7 flex flex-col gap-6 text-left">
          
          {/* Badge */}
          <div>
            <span className="inline-block bg-indigo-50 text-indigo-600 text-xs font-extrabold px-4 py-2 rounded-full tracking-wider uppercase">
              Our Origin Story
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#081f37] leading-[1.1] tracking-tight">
            Where{' '}
            <span className="text-indigo-600">Imagination</span>
            <br />
            Meets the
            <br />
            Canvas.
          </h1>

          {/* Paragraph */}
          <p className="text-slate-500 text-base md:text-lg leading-relaxed max-w-xl">
            Founded in 2018, GloSmart Academy began with a simple idea: to build a creative sanctuary where children could feel free to explore, learn, and grow. We spark curiosity and nurture lifelong artistic expression through a curriculum designed for the next generation.
          </p>

          {/* Stats Badges */}
          <div className="flex gap-4 md:gap-6 mt-4">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-md p-4 flex-1 max-w-[170px] text-center hover:scale-105 transition-transform duration-300">
              <span className="block text-2xl md:text-3xl font-black text-[#0ea5e9]">5K+</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Young Artists</span>
            </div>
            <div className="bg-white border border-slate-100 rounded-2xl shadow-md p-4 flex-1 max-w-[170px] text-center hover:scale-105 transition-transform duration-300">
              <span className="block text-2xl md:text-3xl font-black text-pink-500">40+</span>
              <span className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">Global Tutors</span>
            </div>
          </div>

        </div>

        {/* Right Image Column */}
        <div className="lg:col-span-5 flex justify-center relative">
          
          {/* Morphing Oval Backdrop Shape */}
          <div className="absolute top-1/2 left-1/2 w-[115%] h-[115%] bg-[#ebe8f5]/80 -z-10 animate-blob-slow pointer-events-none transition-all duration-500"></div>
          
          {/* Main Rounded Image Container */}
          <div className="relative w-full max-w-[420px] aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden shadow-2xl border-4 border-white">
            <img 
              src={designui} 
              alt="Kids Painting on Canvas" 
              className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-500" 
            />
          </div>

          {/* Floating Decorative Badges */}
          {/* Top-Right Yellow Circle */}
          <div className="absolute -top-4 -right-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#d2ff55] text-[#081f37] flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">
            <FiEdit3 className="w-5 h-5 md:w-6 md:h-6" />
          </div>

          {/* Bottom-Left Pink Circle */}
          <div className="absolute -bottom-4 -left-4 w-12 h-12 md:w-14 md:h-14 rounded-full bg-pink-400 text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 hover:-rotate-12 transition-all duration-300 cursor-pointer">
            <FaPalette className="w-5 h-5 md:w-6 md:h-6" />
          </div>

        </div>

      </section>

      {/* 2. Philosophy Section */}
      <section className="flex flex-col gap-10">
        
        {/* Section Heading */}
        <div className="text-center flex flex-col gap-4">
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#081f37] tracking-tight">
            Our Creative Philosophy
          </h2>
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto leading-relaxed">
            We believe in a balance between structured skill development and free, open-ended artistic play to inspire genuine child expression.
          </p>
        </div>

        {/* Philosophy Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mt-4">
          
          {/* Card 1: Play-Led Learning (Wide - Row 1 Left) */}
          <PhilosophyCard 
            title="Play-Led Learning"
            description="Our curriculum encourages curiosity and experimentation. Through sensory exploration, children naturally build creativity, build resilience, and discover their unique voices."
            bgClass="bg-white border border-slate-100/50"
            textClass="text-slate-800"
            badgeIcon={FiSmile}
            badgeBg="bg-lime-100"
            badgeColor="text-lime-600"
            bgDoodle={FiTarget}
            gridClass="lg:col-span-2"
          />

          {/* Card 2: Hybrid Mastery (Narrow - Row 1 Right) */}
          <PhilosophyCard 
            title="Hybrid Mastery"
            description="Seamlessly transitioning between traditional brushes and modern digital tablets to prepare young creators for the multi-disciplinary creative landscape of the future."
            bgClass="bg-[#0b3142]"
            textClass="text-white"
            badgeIcon={FiPercent}
            badgeBg="bg-sky-950"
            badgeColor="text-sky-300"
            gridClass="lg:col-span-1"
          />

          {/* Card 3: Safe Community (Narrow - Row 2 Left) */}
          <PhilosophyCard 
            title="Safe Community"
            description="A supportive, fully-moderated digital ecosystem designed exclusively for kids. Your children can share art, collaborate, and receive positive peer validation safely."
            bgClass="bg-pink-400"
            textClass="text-white"
            badgeIcon={FiImage}
            badgeBg="bg-pink-500"
            badgeColor="text-pink-100"
            gridClass="lg:col-span-1"
          />

          {/* Card 4: Direct Tutoring (Wide - Row 2 Right) */}
          <PhilosophyCard 
            title="Direct Tutoring"
            description="Our handpicked certified art tutors guide young talents individually. Each child receives personal feedback, structured guidance, and motivation customized to their learning speed."
            bgClass="bg-indigo-50"
            textClass="text-slate-800"
            imageSrc={tabletDrawing}
            gridClass="lg:col-span-2"
          />

        </div>

      </section>

      {/* 3. Tutors Section */}
      <section className="flex flex-col gap-10">
        
        {/* Section Heading with "View All Tutors" Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-100 pb-6">
          <div className="text-left flex flex-col gap-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#081f37] tracking-tight">
              Meet Our Tutors
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-md leading-relaxed">
              Our tutors are leading professional artists and educators dedicated to nurturing the next generation of creative minds.
            </p>
          </div>
          <div>
            <button className="flex items-center gap-2 border-2 border-indigo-100 text-indigo-600 bg-indigo-50/20 text-xs md:text-sm font-bold px-6 py-3 rounded-full hover:bg-[#0ea5e9] hover:text-white hover:border-[#0ea5e9] transition-all duration-300 group">
              View All Tutors
              <FiArrowRight className="transform group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tutors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {tutors.map((tutor, index) => (
            <MentorCard 
              key={tutor._id || index}
              name={tutor.name}
              role={tutor.role}
              description={tutor.description}
              image={tutor.image}
              badgeIcon={tutor.badgeIcon}
              badgeBg={tutor.badgeBg}
              badgeColor={tutor.badgeColor}
            />
          ))}
        </div>

      </section>

      {/* 4. Statistics Banner Section */}
      <StatsSection />

    </main>
  );
};

export default About;
