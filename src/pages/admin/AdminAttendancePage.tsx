import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { FiCheck, FiX, FiUserCheck, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const AdminAttendancePage: React.FC = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [sessionRecords, setSessionRecords] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const url = `http://localhost:5000/api/attendance/sessions?role=${user?.role}&userId=${user?.profileId}&name=${user?.name}`;
      const res = await fetch(url);
      const data = await res.json();
      setSessions(data);

      const statsRes = await fetch('http://localhost:5000/api/attendance/stats');
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    }
  };

  const handleDisable = async (id: string) => {
    if (!window.confirm("Are you sure you want to disable this session?")) return;
    try {
      await fetch(`http://localhost:5000/api/attendance/sessions/${id}/disable`, {
        method: 'PUT'
      });
      fetchSessions();
    } catch (error) {
      console.error(error);
    }
  };

  const openSessionDetails = async (session: any) => {
    setSelectedSession(session);
    try {
      const res = await fetch(`http://localhost:5000/api/attendance/records/session/${session._id}`);
      const data = await res.json();
      setSessionRecords(data);
      setShowModal(true);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800 relative">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-2 tracking-tight">Attendance Management</h2>
          <p className="text-slate-500 font-medium text-[15px]">
            Manage attendance sessions and view student attendance records.
          </p>
        </div>

        {stats && (user?.role === 'admin') && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Sessions</p>
                <p className="text-3xl font-black text-slate-800">{stats.totalSessions}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <FiUserCheck size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Active Sessions</p>
                <p className="text-3xl font-black text-slate-800">{stats.activeSessions}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <FiCheck size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Attended</p>
                <p className="text-3xl font-black text-slate-800">{stats.totalStudentsAttended}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                <FiUsers size={24} />
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Batch Name</th>
                  <th className="py-4 px-6">Enabled By</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6 text-center">Total Students</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {sessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-medium">
                      No attendance sessions found.
                    </td>
                  </tr>
                ) : (
                  sessions.map((session) => (
                    <tr key={session._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-800 text-sm">
                        {session.batchId?.batchName}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-600">
                        {session.enabledByName}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-600 capitalize">
                        {session.enabledByRole}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-slate-600">
                        {new Date(session.enabledAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <button 
                          onClick={() => openSessionDetails(session)}
                          className="bg-purple-50 text-[#6247df] hover:bg-purple-100 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer border-none"
                        >
                          {session.totalAttended} Attended
                        </button>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`text-xs font-black px-2.5 py-1 rounded-md tracking-wider ${session.status === 'Enabled' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {session.status === 'Enabled' && (user?.role === 'admin' || user?.name === session.enabledByName) && (
                          <button 
                            onClick={() => handleDisable(session._id)}
                            className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-red-200"
                          >
                            Disable
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
      </main>

      {/* Session Details Modal */}
      {showModal && selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-xl font-extrabold text-[#1c1c28]">Attendance Details</h3>
                <p className="text-sm font-medium text-slate-500 mt-1">
                  {selectedSession.batchId?.batchName} - {new Date(selectedSession.enabledAt).toLocaleDateString()}
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors border-none cursor-pointer"
              >
                <FiX size={16} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Attended</p>
                  <p className="text-2xl font-black text-[#6247df]">{sessionRecords.length}</p>
                </div>
              </div>

              <div className="border border-slate-100 rounded-2xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase">
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Student ID</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionRecords.map(record => (
                      <tr key={record._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50">
                        <td className="py-3 px-4 font-bold text-sm text-slate-800">{record.studentId?.name}</td>
                        <td className="py-3 px-4 text-xs font-medium text-slate-500">{record.studentId?._id}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">{record.attendanceDate}</td>
                        <td className="py-3 px-4 text-sm font-medium text-slate-600">{record.attendanceTime}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttendancePage;
