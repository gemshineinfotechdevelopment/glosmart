import React from 'react';

interface TransferStatusBadgeProps {
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

const TransferStatusBadge: React.FC<TransferStatusBadgeProps> = ({ status }) => {
  const styles = {
    scheduled: 'bg-blue-50 text-blue-700 border-blue-200',
    active: 'bg-green-50 text-green-700 border-green-200',
    completed: 'bg-slate-100 text-slate-600 border-slate-200',
    cancelled: 'bg-red-50 text-red-700 border-red-200'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider ${styles[status] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'active' ? 'bg-green-500 animate-pulse' :
        status === 'scheduled' ? 'bg-blue-500' :
        status === 'cancelled' ? 'bg-red-500' :
        'bg-slate-400'
      }`}></span>
      {status}
    </span>
  );
};

export default TransferStatusBadge;
