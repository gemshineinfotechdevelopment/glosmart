import React from 'react';

interface StatItem {
  value: string;
  label: string;
}

const StatsSection: React.FC = () => {
  const stats: StatItem[] = [
    { value: '120+', label: 'Courses' },
    { value: '40+', label: 'Countries' },
    { value: '1M+', label: 'Creations' },
    { value: '4.9', label: 'Rating' },
  ];

  return (
    <section className="my-16 px-4 md:px-0">
      <div className="bg-[#0b3142] text-white rounded-3xl md:rounded-[2.5rem] p-10 md:p-16 text-center relative overflow-hidden shadow-2xl max-w-7xl mx-auto">
        
        {/* Background Decorative Graphic (Faded Circles) */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-sky-950/40 border border-sky-900/30 -mr-20 pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-60 h-60 rounded-full bg-sky-950/20 border border-sky-900/20 -ml-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center gap-10">
          {/* Section Heading */}
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white">
            Art Without Borders
          </h2>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 w-full max-w-5xl">
            {stats.map((stat, index) => (
              <div key={index} className="flex flex-col gap-2">
                <span className="text-4xl md:text-5xl lg:text-6xl font-black text-[#d2ff55] tracking-tight">
                  {stat.value}
                </span>
                <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-slate-300">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="mt-4">
            <button className="bg-[#d2ff55] text-[#081f37] hover:bg-white hover:text-[#0b3142] text-sm md:text-base font-extrabold px-8 py-4 rounded-full shadow-lg shadow-lime-900/10 hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Start Your Art Journey
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};

export default StatsSection;
