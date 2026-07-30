import React from 'react';
import axios from 'axios';
import { FiXCircle, FiCalendar, FiUser, FiArrowRight } from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';
import TransferStatusBadge from './TransferStatusBadge';
import { useAuth } from '../../context/AuthContext';

interface Transfer {
  _id: string;
  studentId: {
    _id: string;
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

interface ActiveTransfersTableProps {
  transfers: Transfer[];
  onRefresh: () => void;
}

const ActiveTransfersTable: React.FC<ActiveTransfersTableProps> = ({ transfers, onRefresh }) => {
  const { user } = useAuth();

  const handleCancel = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to cancel the temporary transfer for ${name}?`)) {
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user?.token}`
        }
      };
      await axios.post(`${API_BASE_URL}/api/transfers/cancel/${id}`, {}, config);
      alert('Temporary transfer cancelled successfully.');
      onRefresh();
    } catch (err: any) {
      console.error('Error cancelling transfer:', err);
      alert(err.response?.data?.message || 'Failed to cancel transfer');
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeOrScheduledTransfers = transfers.filter(t => t.status === 'active' || t.status === 'scheduled');

  return (
    <div className="bg-white rounded-[2rem] border border-slate-50/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden font-sans">
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
              <th className="py-5 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {activeOrScheduledTransfers.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400 italic font-semibold text-sm">
                  No active or scheduled temporary transfers found.
                </td>
              </tr>
            ) : (
              activeOrScheduledTransfers.map((t) => (
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
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleCancel(t._id, t.studentId?.name)}
                      className="px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-xl hover:bg-red-500 hover:text-white transition-all text-xs font-bold cursor-pointer inline-flex items-center gap-1.5"
                    >
                      <FiXCircle size={14} />
                      Cancel
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveTransfersTable;
