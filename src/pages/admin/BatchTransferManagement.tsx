import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiCalendar, FiUsers, FiClock, FiFileText, FiRefreshCw, 
  FiDownload, FiSliders, FiActivity
} from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import TransferCalendar from '../../components/admin/TransferCalendar';
import ActiveTransfersTable from '../../components/admin/ActiveTransfersTable';
import TransferHistoryTable from '../../components/admin/TransferHistoryTable';

const BatchTransferManagement: React.FC = () => {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'calendar' | 'active' | 'history' | 'reports'>('calendar');
  const [transfers, setTransfers] = useState<any[]>([]);
  const [conversions, setConversions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [cronRunning, setCronRunning] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Redo loading states
  const [redoLoadingId, setRedoLoadingId] = useState<string | null>(null);

  // Report filter states
  const [reportType, setReportType] = useState<'temporary' | 'conversions' | 'active' | 'upcoming' | 'completed'>('temporary');

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      };

      const [transfersRes, conversionsRes, auditLogsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/transfers`, config),
        axios.get(`${API_BASE_URL}/api/transfers/batch-conversions`, config),
        axios.get(`${API_BASE_URL}/api/transfers/audit-logs`, config)
      ]);

      setTransfers(transfersRes.data);
      setConversions(conversionsRes.data);
      setAuditLogs(auditLogsRes.data);
    } catch (err) {
      console.error('Error fetching transfer data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRunCron = async () => {
    setCronRunning(true);
    try {
      const config = {
        headers: { Authorization: `Bearer ${user?.token}` }
      };
      const res = await axios.post(`${API_BASE_URL}/api/transfers/run-cron`, {}, config);
      alert(`Cron Executed successfully.\nActivated: ${res.data.result?.activated || 0} transfers\nCompleted: ${res.data.result?.completed || 0} transfers`);
      fetchData();
    } catch (err) {
      console.error('Error running manual cron:', err);
      alert('Failed to trigger cron job');
    } finally {
      setCronRunning(false);
    }
  };

  // Export CSV handler
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let fileName = `report_${reportType}.csv`;

    if (reportType === 'conversions') {
      headers = ['Student Name', 'Email', 'Course', 'Old Batch', 'New Batch', 'Effective Date', 'Reason'];
      rows = conversions.map(c => [
        c.studentId?.name || 'Unknown',
        c.studentId?.email || '',
        c.courseId?.courseName || '',
        c.oldBatchId?.batchName || '',
        c.newBatchId?.batchName || '',
        new Date(c.effectiveDate).toLocaleDateString(),
        `"${(c.reason || '').replace(/"/g, '""')}"`
      ]);
    } else {
      // Temporary transfer reporting
      let filteredTransfers = transfers;
      if (reportType === 'active') {
        filteredTransfers = transfers.filter(t => t.status === 'active');
      } else if (reportType === 'upcoming') {
        filteredTransfers = transfers.filter(t => t.status === 'scheduled');
      } else if (reportType === 'completed') {
        filteredTransfers = transfers.filter(t => t.status === 'completed');
      }

      headers = ['Student Name', 'Email', 'Course', 'Original Batch', 'Temporary Batch', 'Start Date', 'End Date', 'Status', 'Reason'];
      rows = filteredTransfers.map(t => [
        t.studentId?.name || 'Unknown',
        t.studentId?.email || '',
        t.courseId?.courseName || '',
        t.originalBatchId?.batchName || '',
        t.temporaryBatchId?.batchName || '',
        new Date(t.startDate).toLocaleDateString(),
        new Date(t.endDate).toLocaleDateString(),
        t.status,
        `"${(t.reason || '').replace(/"/g, '""')}"`
      ]);
    }

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRedoTransfer = async (t: any) => {
    const studentName = t.studentId?.name || 'this student';
    const originalBatch = t.originalBatchId?.batchName || 'original batch';
    const confirmed = window.confirm(
      `Redo Transfer Confirmation\n\nThis will revert ${studentName}'s current batch back to "${originalBatch}".\n\nAre you sure you want to proceed?`
    );
    if (!confirmed) return;

    setRedoLoadingId(t._id);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.post(`${API_BASE_URL}/api/transfers/redo/${t._id}`, {}, config);
      alert(`✅ Success: ${res.data.message}`);
      fetchData();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to redo transfer'}`);
    } finally {
      setRedoLoadingId(null);
    }
  };

  const handleRedoConversion = async (c: any) => {
    const studentName = c.studentId?.name || 'this student';
    const oldBatch = c.oldBatchId?.batchName || 'previous batch';
    const confirmed = window.confirm(
      `Redo Conversion Confirmation\n\nThis will revert ${studentName}'s batch back to "${oldBatch}" (the batch before this conversion).\n\nAre you sure you want to proceed?`
    );
    if (!confirmed) return;

    setRedoLoadingId(c._id);
    try {
      const config = { headers: { Authorization: `Bearer ${user?.token}` } };
      const res = await axios.post(`${API_BASE_URL}/api/batch-conversions/redo/${c._id}`, {}, config);
      alert(`✅ Success: ${res.data.message}`);
      fetchData();
    } catch (err: any) {
      alert(`❌ Error: ${err.response?.data?.message || 'Failed to redo conversion'}`);
    } finally {
      setRedoLoadingId(null);
    }
  };

  // Filter audit logs based on search
  const filteredAuditLogs = auditLogs.filter(log => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (log.studentName || '').toLowerCase().includes(q) ||
      (log.adminName || '').toLowerCase().includes(q) ||
      (log.action || '').toLowerCase().includes(q)
    );
  });

  const activeCount = transfers.filter(t => t.status === 'active').length;
  const upcomingCount = transfers.filter(t => t.status === 'scheduled').length;
  const completedCount = transfers.filter(t => t.status === 'completed').length;

  return (
    <div className="p-4 sm:p-6 md:p-10 pb-24 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c28] mb-2 tracking-tight">Batch Transfers & Conversions</h2>
          <p className="text-slate-500 font-medium text-[15px]">
            Manage student schedules, convert batches permanently, view calendars, and generate logs.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} /> Refresh
          </button>
          
          <button
            onClick={handleRunCron}
            disabled={cronRunning}
            className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md hover:bg-[#5035c9] transition-colors cursor-pointer border-none disabled:opacity-50"
          >
            <FiSliders size={16} /> {cronRunning ? 'Running Cron...' : 'Trigger Sync (Cron)'}
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <FiActivity size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">Active Shifts</p>
            <h3 className="text-2xl font-black text-slate-800">{activeCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FiCalendar size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">Upcoming Shifts</p>
            <h3 className="text-2xl font-black text-slate-800">{upcomingCount}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
            <FiUsers size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">Conversions</p>
            <h3 className="text-2xl font-black text-slate-800">{conversions.length}</h3>
          </div>
        </div>
        <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <FiClock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-wider mb-0.5 uppercase">Completed Shifts</p>
            <h3 className="text-2xl font-black text-slate-800">{completedCount}</h3>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6 pb-px">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-4 px-4 font-bold text-sm transition-all border-none bg-transparent cursor-pointer relative ${
            activeTab === 'calendar' ? 'text-[#6247df]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Calendar View
          {activeTab === 'calendar' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6247df] rounded-full animate-scale-up" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('active')}
          className={`pb-4 px-4 font-bold text-sm transition-all border-none bg-transparent cursor-pointer relative ${
            activeTab === 'active' ? 'text-[#6247df]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active Transfers ({activeCount + upcomingCount})
          {activeTab === 'active' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6247df] rounded-full animate-scale-up" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-4 px-4 font-bold text-sm transition-all border-none bg-transparent cursor-pointer relative ${
            activeTab === 'history' ? 'text-[#6247df]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          History & Audit Logs
          {activeTab === 'history' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6247df] rounded-full animate-scale-up" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('reports')}
          className={`pb-4 px-4 font-bold text-sm transition-all border-none bg-transparent cursor-pointer relative ${
            activeTab === 'reports' ? 'text-[#6247df]' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Reports Generator
          {activeTab === 'reports' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6247df] rounded-full animate-scale-up" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div>
        {activeTab === 'calendar' && (
          <TransferCalendar transfers={transfers} />
        )}

        {activeTab === 'active' && (
          <ActiveTransfersTable transfers={transfers} onRefresh={fetchData} />
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <TransferHistoryTable 
              transfers={transfers} 
              conversions={conversions} 
              onRedoTransfer={handleRedoTransfer}
              onRedoConversion={handleRedoConversion}
            />

            {/* Audit Logs Section */}
            <div className="bg-white rounded-[2rem] border border-slate-50/50 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h3 className="font-extrabold text-lg text-slate-800 flex items-center gap-2">
                  <FiFileText className="text-[#6247df]" /> Admin Audit Logs
                </h3>
                
                <input
                  type="text"
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 border-none rounded-full py-2 px-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
                />
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Admin</th>
                      <th className="pb-3">Action</th>
                      <th className="pb-3">Student</th>
                      <th className="pb-3">Old Batch</th>
                      <th className="pb-3">New Batch</th>
                      <th className="pb-3">Timestamp</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-600">
                    {filteredAuditLogs.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400 italic">
                          No audit logs found.
                        </td>
                      </tr>
                    ) : (
                      filteredAuditLogs.map((log) => (
                        <tr key={log._id} className="hover:bg-slate-50/30">
                          <td className="py-3 font-extrabold text-slate-800">{log.adminName}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                              log.action === 'Temporary Transfer' ? 'bg-amber-100 text-amber-700' :
                              log.action === 'Permanent Conversion' ? 'bg-purple-100 text-purple-700' :
                              log.action === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="py-3 font-bold text-slate-800">{log.studentName}</td>
                          <td className="py-3 text-slate-400 line-through">{log.oldBatchName || 'N/A'}</td>
                          <td className="py-3 text-[#6247df] font-bold">{log.newBatchName || 'N/A'}</td>
                          <td className="py-3 text-slate-400">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="bg-white rounded-[2rem] border border-slate-50/50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)] max-w-xl mx-auto space-y-6 font-sans">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 leading-tight">Export Academic Schedule Reports</h3>
              <p className="text-slate-400 text-xs mt-1 font-medium">Download MERN collection metrics for external sheets.</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Report Filter Category</label>
                <select
                  value={reportType}
                  onChange={(e: any) => setReportType(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-semibold text-slate-700"
                >
                  <option value="temporary">All Temporary Transfers</option>
                  <option value="active">Active Temporary Transfers</option>
                  <option value="upcoming">Upcoming (Scheduled) Transfers</option>
                  <option value="completed">Completed Transfers</option>
                  <option value="conversions">Permanent Batch Conversions</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleExportCSV}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-purple-200 cursor-pointer border-none"
                >
                  <FiDownload size={16} /> Export CSV / Excel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Redo loading overlay */}
      {redoLoadingId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 font-sans">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-[#6247df] border-t-transparent rounded-full animate-spin" />
            <p className="font-bold text-slate-700 text-sm">Reverting student batch...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchTransferManagement;
