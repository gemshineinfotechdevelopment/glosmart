import React from 'react';
import type { IconType } from 'react-icons';
import { FiUser } from 'react-icons/fi';

interface MentorCardProps {
  name: string;
  role: string;
  description: string;
  image?: string;
  badgeIcon?: IconType;
  badgeBg?: string;
  badgeColor?: string;
}

const MentorCard: React.FC<MentorCardProps> = ({ 
  name, 
  role, 
  description, 
  image, 
  badgeIcon: BadgeIcon, 
  badgeBg, 
  badgeColor 
}) => {
  return (
    <div className="group bg-white rounded-3xl shadow-xl shadow-slate-100/60 p-5 flex flex-col gap-5 border border-slate-100/30 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
      
      {/* Image Container with Floating Badge */}
      <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-100 flex items-center justify-center">
        {image ? (
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-100 via-indigo-50 to-purple-50 text-indigo-400 p-4 select-none">
            <FiUser className="w-16 h-16 md:w-20 md:h-20 text-indigo-300 mb-2" />
            <span className="text-sm font-black text-indigo-600 uppercase tracking-wider">{name.split(' ').map(n => n[0]).join('')}</span>
          </div>
        )}
        
        {/* Floating Custom Badge */}
        {BadgeIcon && (
          <div className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300 group-hover:rotate-12 ${badgeBg} ${badgeColor}`}>
            <BadgeIcon size={18} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col gap-2 px-1">
        <h4 className="text-lg font-bold text-slate-800 tracking-tight group-hover:text-[#0ea5e9] transition-colors">
          {name}
        </h4>
        <span className="text-xs font-bold uppercase tracking-wider text-[#0ea5e9]">
          {role}
        </span>
        <p className="text-xs md:text-sm text-slate-500 leading-relaxed mt-1">
          {description}
        </p>
      </div>

    </div>
  );
};

export default MentorCard;
