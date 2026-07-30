import React, { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiCalendar, FiArrowRight, FiUser } from 'react-icons/fi';
import TransferStatusBadge from './TransferStatusBadge';

interface Transfer {
  _id: string;
  studentId: {
    name: string;
    email: string;
  };
  courseId: {
    courseName: string;
  };
  originalBatchId: {
    batchName: string;
  };
  temporaryBatchId: {
    batchName: string;
  };
  startDate: string;
  endDate: string;
  reason: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

interface TransferCalendarProps {
  transfers: Transfer[];
}

const TransferCalendar: React.FC<TransferCalendarProps> = ({ transfers }) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  // Generate calendar days
  const firstDayIndex = new Date(year, month, 1).getDay();
  const lastDay = new Date(year, month + 1, 0).getDate();
  const prevLastDay = new Date(year, month, 0).getDate();

  const days: { date: Date; isCurrentMonth: boolean }[] = [];

  // Padding from previous month
  for (let i = firstDayIndex; i > 0; i--) {
    days.push({
      date: new Date(year, month - 1, prevLastDay - i + 1),
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= lastDay; i++) {
    days.push({
      date: new Date(year, month, i),
      isCurrentMonth: true
    });
  }

  // Padding for next month
  const totalCells = 42; // 6 rows of 7 days
  const nextMonthPadding = totalCells - days.length;
  for (let i = 1; i <= nextMonthPadding; i++) {
    days.push({
      date: new Date(year, month + 1, i),
      isCurrentMonth: false
    });
  }

  const isSameDay = (d1: Date, d2: Date) => {
    return d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate();
  };

  // Get transfers active on a specific date
  const getTransfersOnDate = (date: Date) => {
    return transfers.filter(t => {
      const start = new Date(t.startDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(t.endDate);
      end.setHours(23, 59, 59, 999);
      
      const check = new Date(date);
      check.setHours(12, 0, 0, 0); // avoid tz offsets
      
      return check >= start && check <= end;
    });
  };

  const selectedDateTransfers = getTransfersOnDate(selectedDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      {/* Calendar Grid */}
      <div className="lg:col-span-2 bg-white rounded-[2rem] border border-slate-50/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <FiCalendar className="text-[#6247df]" size={20} />
            <h3 className="font-extrabold text-lg text-slate-800">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors bg-transparent"
            >
              <FiChevronLeft size={16} />
            </button>
            <button
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center cursor-pointer transition-colors bg-transparent"
            >
              <FiChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Week Days Headers */}
        <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 uppercase mb-4 tracking-wider">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, idx) => {
            const dateTransfers = getTransfersOnDate(day.date);
            const isSelected = isSameDay(day.date, selectedDate);
            const isToday = isSameDay(day.date, new Date());

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(day.date)}
                className={`h-16 rounded-xl flex flex-col items-center justify-between p-1.5 transition-all relative border border-transparent text-left cursor-pointer group hover:border-[#6247df]/20 ${
                  day.isCurrentMonth ? 'text-slate-800' : 'text-slate-300'
                } ${
                  isSelected 
                    ? 'bg-[#6247df] text-white hover:bg-[#6247df]/90 shadow-md shadow-purple-200' 
                    : isToday 
                      ? 'bg-purple-50 text-[#6247df] font-black' 
                      : 'bg-slate-50/50 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs font-bold self-start">{day.date.getDate()}</span>
                
                {/* Dot Indicators */}
                <div className="flex gap-1 overflow-x-hidden justify-center max-w-full">
                  {dateTransfers.slice(0, 3).map((t, dotIdx) => {
                    const dotColors = {
                      active: 'bg-green-500',
                      scheduled: 'bg-blue-500',
                      completed: 'bg-slate-400',
                      cancelled: 'bg-red-500'
                    };
                    return (
                      <span 
                        key={t._id || dotIdx} 
                        className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : dotColors[t.status] || 'bg-slate-400'}`}
                      />
                    );
                  })}
                  {dateTransfers.length > 3 && (
                    <span className={`text-[8px] font-black leading-none ${isSelected ? 'text-white' : 'text-[#6247df]'}`}>
                      +{dateTransfers.length - 3}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-6 pt-5 border-t border-slate-100 text-xs font-bold text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span> Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Scheduled
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Cancelled
          </span>
        </div>
      </div>

      {/* Date Details Panel */}
      <div className="bg-slate-50 border border-slate-100 rounded-[2rem] p-6 flex flex-col shadow-[0_8px_30px_rgb(0,0,0,0.01)] min-h-[350px]">
        <h4 className="font-extrabold text-sm text-[#1c1c28] uppercase tracking-wider mb-4 border-b border-slate-200/60 pb-3">
          Transfers for {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </h4>

        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {selectedDateTransfers.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 italic">
              <FiCalendar size={24} className="mb-2 text-slate-300" />
              <p className="text-xs font-semibold">No transfers active or scheduled on this day.</p>
            </div>
          ) : (
            selectedDateTransfers.map((t) => (
              <div 
                key={t._id} 
                className="bg-white p-4 rounded-2xl border border-slate-150 shadow-sm space-y-3 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center">
                      <FiUser size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-extrabold text-slate-800 leading-tight">{t.studentId?.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">{t.courseId?.courseName}</p>
                    </div>
                  </div>
                  <TransferStatusBadge status={t.status} />
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-50 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 line-through">{t.originalBatchId?.batchName}</span>
                    <FiArrowRight className="text-slate-400" size={12} />
                    <span className="text-[#6247df]">{t.temporaryBatchId?.batchName}</span>
                  </div>
                </div>

                {t.reason && (
                  <p className="text-xs text-slate-500 font-medium italic border-l-2 border-purple-200 pl-2 mt-1">
                    "{t.reason}"
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TransferCalendar;
