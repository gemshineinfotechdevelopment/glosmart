import React, { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiClock, 
  FiUser, 
  FiSearch, 
  FiRefreshCw, 
  FiTrendingUp
} from 'react-icons/fi';
import { API_BASE_URL } from '../../config/api';

interface ReportItem {
  _id: string;
  teacherName: string;
  courseName: string;
  batchName: string;
  batchCode?: string;
  zoomLink?: string;
  activatedAt: string;
  deactivatedAt: string;
  durationMinutes: number;
  description: string;
  createdAt: string;
}

const TutorReports: React.FC = () => {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/api/tutor-reports`);
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch tutor reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = reports.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.teacherName.toLowerCase().includes(query) ||
      r.courseName.toLowerCase().includes(query) ||
      r.batchName.toLowerCase().includes(query) ||
      (r.batchCode && r.batchCode.toLowerCase().includes(query)) ||
      (r.description && r.description.toLowerCase().includes(query))
    );
  });

  const totalMinutes = reports.reduce((acc, r) => acc + (r.durationMinutes || 0), 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const uniqueTutors = new Set(reports.map(r => r.teacherName)).size;

  const formatDuration = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs}h`;
  };

  return (
    <div className="p-4 sm:p-6 md:p-10 pb-24">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#1c1c28] mb-1 flex items-center gap-3">
                <FiFileText className="text-[#6247df]" />
                Tutor Class Reports
              </h2>
              <p className="text-slate-500 font-medium">
                Comprehensive activity log: session start/end timestamps, duration, and class reports submitted by tutors.
              </p>
            </div>
            
            <button
              onClick={fetchReports}
              disabled={loading}
              className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh Reports
            </button>
          </div>

          {/* Stats Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex items-center justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Reports</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{reports.length}</h3>
              </div>
              <div className="p-3 bg-purple-50 text-[#6247df] rounded-xl">
                <FiFileText size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex items-center justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Total Class Hours</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{totalHours} hrs</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <FiClock size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex items-center justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Active Tutors</p>
                <h3 className="text-2xl font-black text-slate-900 mt-1">{uniqueTutors}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <FiUser size={22} />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.015)] flex items-center justify-between">
              <div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Latest Session</p>
                <h3 className="text-sm font-bold text-slate-900 mt-1">
                  {reports.length > 0 ? new Date(reports[0].createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
                </h3>
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <FiTrendingUp size={22} />
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
            <FiSearch className="text-slate-400 ml-2" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tutor name, course, batch code, or description content..."
              className="w-full bg-transparent border-none outline-none text-sm font-medium placeholder:text-slate-400"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 bg-slate-100 rounded-lg"
              >
                Clear
              </button>
            )}
          </div>

          {/* Reports Content List / Table */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#6247df] border-t-transparent"></div>
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm space-y-3">
              <div className="w-16 h-16 bg-purple-50 text-[#6247df] rounded-full flex items-center justify-center mx-auto">
                <FiFileText size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No Tutor Reports Found</h3>
              <p className="text-slate-400 text-sm max-w-md mx-auto">
                When a tutor activates a class link and deactivates it, their session summary and duration report will be displayed here automatically.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                      <th className="py-4 px-6">Tutor Name</th>
                      <th className="py-4 px-6">Course & Batch</th>
                      <th className="py-4 px-6">Start Time</th>
                      <th className="py-4 px-6">End Time</th>
                      <th className="py-4 px-6">Duration</th>
                      <th className="py-4 px-6 min-w-[320px] max-w-[500px]">Description / Reports</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {filteredReports.map((report) => (
                      <tr key={report._id} className="hover:bg-slate-50/50 transition-colors align-top">
                        {/* Tutor Name */}
                        <td className="py-4 px-6 font-bold text-slate-900 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-100 text-[#6247df] flex items-center justify-center font-black text-xs uppercase">
                              {report.teacherName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{report.teacherName}</p>
                              <span className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                                Tutor
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Course & Batch */}
                        <td className="py-4 px-6">
                          <p className="font-bold text-slate-800 leading-tight">{report.courseName}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-slate-500">{report.batchName}</span>
                            {report.batchCode && (
                              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                                {report.batchCode}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Start Time */}
                        <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                          <p className="font-semibold">{new Date(report.activatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{new Date(report.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        {/* End Time */}
                        <td className="py-4 px-6 text-xs text-slate-600 whitespace-nowrap">
                          <p className="font-semibold">{new Date(report.deactivatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          <span className="text-[11px] text-slate-400 font-medium">{new Date(report.deactivatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </td>

                        {/* Duration */}
                        <td className="py-4 px-6 whitespace-nowrap">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 inline-flex items-center gap-1">
                            <FiClock size={12} />
                            {formatDuration(report.durationMinutes)}
                          </span>
                        </td>

                        {/* Description / Reports */}
                        <td className="py-4 px-6 min-w-[320px] max-w-[500px]">
                          <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-2xl text-xs font-medium text-slate-700 leading-relaxed whitespace-pre-wrap break-words max-h-36 overflow-y-auto shadow-sm">
                            {report.description || <span className="text-slate-400 italic">No description provided.</span>}
                          </div>
                          {report.description && (
                            <button
                              onClick={() => setSelectedReport(report)}
                              className="mt-1.5 text-[11px] font-bold text-[#6247df] hover:underline bg-transparent border-none cursor-pointer p-0 inline-flex items-center gap-1"
                            >
                              View full modal ↗
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>


      {/* Description Popup Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.15s_ease-out]">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-100">
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-purple-900/5 via-indigo-900/5 to-purple-900/5 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-[#6247df] text-white rounded-2xl">
                  <FiFileText size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-xl">Tutor Session Report & Description</h3>
                  <p className="text-xs text-slate-500 font-medium">Submitted by {selectedReport.teacherName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Content Body */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto overflow-x-hidden flex-1 w-full">
              {/* Horizontal Metadata Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 text-xs w-full">
                <div>
                  <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Course</span>
                  <span className="font-extrabold text-slate-800 text-sm block">{selectedReport.courseName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Batch</span>
                  <span className="font-extrabold text-slate-800 text-sm block">{selectedReport.batchName} {selectedReport.batchCode && `(${selectedReport.batchCode})`}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Session Duration</span>
                  <span className="font-extrabold text-emerald-600 text-sm block">{formatDuration(selectedReport.durationMinutes)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-1 uppercase tracking-wider text-[10px]">Session Time</span>
                  <span className="font-extrabold text-slate-800 text-xs block">
                    {new Date(selectedReport.activatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} – {new Date(selectedReport.deactivatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Wide Horizontal Description Field */}
              <div className="w-full">
                <label className="text-xs font-extrabold text-slate-400 uppercase tracking-wider block mb-3">
                  Full Session Description / Report Notes
                </label>
                <div className="w-full bg-slate-50 p-6 rounded-2xl border border-slate-200 text-sm text-slate-800 font-medium whitespace-pre-wrap break-words leading-relaxed shadow-inner overflow-x-hidden">
                  {selectedReport.description || 'No session notes submitted.'}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedReport(null)}
                className="px-6 py-2.5 bg-[#6247df] text-white rounded-xl font-bold text-xs hover:bg-[#5236cc] transition-colors border-none cursor-pointer shadow-md"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TutorReports;
