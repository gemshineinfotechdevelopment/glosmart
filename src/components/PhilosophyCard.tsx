import React from 'react';
import type { IconType } from 'react-icons';

interface PhilosophyCardProps {
  title: string;
  description: string;
  bgClass: string;
  textClass: string;
  badgeIcon?: IconType;
  badgeBg?: string;
  badgeColor?: string;
  bgDoodle?: IconType;
  imageSrc?: string;
  gridClass?: string;
}

const PhilosophyCard: React.FC<PhilosophyCardProps> = ({ 
  title, 
  description, 
  bgClass, 
  textClass, 
  badgeIcon: BadgeIcon, 
  badgeBg, 
  badgeColor,
  bgDoodle: BgDoodle,
  imageSrc,
  gridClass
}) => {
  return (
    <div className={`rounded-3xl shadow-xl shadow-slate-100/70 p-8 md:p-10 relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl ${bgClass} ${gridClass} min-h-[260px]`}>
      
      {/* Background Doodles / Graphics */}
      {BgDoodle && (
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
          <BgDoodle size={180} className="text-current" />
        </div>
      )}

      {/* Main Content */}
      <div className={`flex flex-col gap-6 h-full ${imageSrc ? 'md:flex-row md:items-center md:justify-between' : ''}`}>
        
        <div className={`flex flex-col gap-4 ${imageSrc ? 'md:w-3/5' : 'w-full'}`}>
          {/* Badge Icon */}
          {BadgeIcon && (
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${badgeBg} ${badgeColor} shadow-md`}>
              <BadgeIcon size={22} />
            </div>
          )}

          {/* Heading */}
          <h3 className={`text-xl md:text-2xl font-bold tracking-tight ${textClass}`}>
            {title}
          </h3>

          {/* Paragraph Description */}
          <p className={`text-sm md:text-base leading-relaxed ${textClass === 'text-white' ? 'text-slate-200' : 'text-slate-600'}`}>
            {description}
          </p>
        </div>

        {/* Optional Image (For Direct Mentorship) */}
        {imageSrc && (
          <div className="md:w-2/5 mt-6 md:mt-0 flex justify-center md:justify-end">
            <div className="w-full max-w-[200px] h-[140px] rounded-2xl overflow-hidden shadow-lg shadow-slate-300/40">
              <img 
                src={imageSrc} 
                alt={title} 
                className="w-full h-full object-cover object-center transform hover:scale-110 transition-transform duration-500" 
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default PhilosophyCard;
