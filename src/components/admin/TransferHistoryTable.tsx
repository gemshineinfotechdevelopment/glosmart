import React, { useState } from 'react';
import { FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import TransferStatusBadge from './TransferStatusBadge';

interface TransferHistory {
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
  status: 'completed' | 'cancelled';
}

interface ConversionHistory {
  _id: string;
  studentId: {
    name: string;
    email: string;
  };
  courseId: {
    courseName: string;
  };
  oldBatchId: {
    batchName: string;
  };
  newBatchId: {
    batchName: string;
  };
  effectiveDate: string;
  reason: string;
}

interface TransferHistoryTableProps {
  transfers: TransferHistory[];
  conversions: ConversionHistory[];
  onRedoTransfer?: (transfer: any) => void;
  onRedoConversion?: (conversion: any) => void;
}

const TransferHistoryTable: React.FC<TransferHistoryTableProps> = ({ 
  transfers, 
  conversions,
  onRedoTransfer,
  onRedoConversion
}) => {
  const [subTab, setSubTab] = useState<'temporary' | 'permanent'>('temporary');

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const completedOrCancelledTransfers = transfers.filter(t => t.status === 'completed' || t.status === 'cancelled');

  return (
    <div className="space-y-6 font-sans">
      {/* Sub-tabs */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setSubTab('temporary')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer ${
            subTab === 'temporary'
              ? 'bg-white text-[#6247df] shadow-xs'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
          }`}
        >
          Temporary Transfers History ({completedOrCancelledTransfers.length})
        </button>
        <button
          onClick={() => setSubTab('permanent')}
          className={`px-4 py-2 rounded-lg font-bold text-xs transition-all border-none cursor-pointer ${
            subTab === 'permanent'
              ? 'bg-white text-[#6247df] shadow-xs'
              : 'text-slate-500 hover:text-slate-700 bg-transparent'
          }`}
        >
          Permanent Conversions History ({conversions.length})
        </button>
      </div>

      {subTab === 'temporary' ? (
        <div className="bg-white rounded-[2rem] border border-slate-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-5 px-6">Student</th>
                  <th className="py-5 px-6">Course</th>
                  <th className="py-5 px-6">Batch Shift</th>
                  <th className="py-5 px-6">Duration</th>
                  <th className="py-5 px-6">Reason</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {completedOrCancelledTransfers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 italic font-semibold text-sm">
                      No temporary transfer history records found.
                    </td>
                  </tr>
                ) : (
                  completedOrCancelledTransfers.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-600 font-medium">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                          <FiUser size={16} />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1c1c28]">{t.studentId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{t.studentId?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#1c1c28]">
                        {t.courseId?.courseName}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-400 line-through text-xs">{t.originalBatchId?.batchName}</span>
                          <FiArrowRight className="text-slate-400" size={14} />
                          <span className="text-[#6247df]">{t.temporaryBatchId?.batchName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <FiCalendar size={13} className="text-slate-400" />
                          <span>{formatDate(t.startDate)} - {formatDate(t.endDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        {t.reason || <span className="text-slate-300 italic text-xs">Not provided</span>}
                      </td>
                      <td className="py-4 px-6">
                        <TransferStatusBadge status={t.status} />
                      </td>
                      <td className="py-4 px-6">
                        {onRedoTransfer && (
                          <button
                            onClick={() => onRedoTransfer(t)}
                            title={`Revert ${t.studentId?.name || 'student'} back to ${t.originalBatchId?.batchName || 'original batch'}`}
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            ↩ Revert to Original
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-5 px-6">Student</th>
                  <th className="py-5 px-6">Course</th>
                  <th className="py-5 px-6">Batch Change</th>
                  <th className="py-5 px-6">Effective Date</th>
                  <th className="py-5 px-6">Reason</th>
                  <th className="py-5 px-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {conversions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 italic font-semibold text-sm">
                      No permanent batch conversion records found.
                    </td>
                  </tr>
                ) : (
                  conversions.map((c) => (
                    <tr key={c._id} className="hover:bg-slate-50/50 transition-colors text-sm text-slate-600 font-medium">
                      <td className="py-4 px-6 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                          <FiUser size={16} />
                        </div>
                        <div>
                          <p className="font-extrabold text-[#1c1c28]">{c.studentId?.name || 'Unknown'}</p>
                          <p className="text-[10px] text-slate-400 font-semibold">{c.studentId?.email}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 font-bold text-[#1c1c28]">
                        {c.courseId?.courseName}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 font-bold">
                          <span className="text-slate-400 text-xs">{c.oldBatchId?.batchName || 'None'}</span>
                          <FiArrowRight className="text-slate-400" size={14} />
                          <span className="text-green-600">{c.newBatchId?.batchName}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                          <FiCalendar size={13} className="text-slate-400" />
                          <span>{formatDate(c.effectiveDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate">
                        {c.reason || <span className="text-slate-300 italic text-xs">Not provided</span>}
                      </td>
                      <td className="py-4 px-6">
                        {onRedoConversion && (
                          <button
                            onClick={() => onRedoConversion(c)}
                            title={`Revert ${c.studentId?.name || 'student'} back to ${c.oldBatchId?.batchName || 'previous batch'}`}
                            className="bg-purple-50 hover:bg-purple-100 text-[#6247df] border border-purple-200 font-extrabold px-3 py-1.5 rounded-lg text-[10px] transition-colors cursor-pointer flex items-center gap-1"
                          >
                            ↩ Revert Batch
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransferHistoryTable;
