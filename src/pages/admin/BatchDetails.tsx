import React, { useState, useEffect } from 'react';
import {
  FiSearch, FiUpload,
  FiClock,
  FiEye, FiFileText, FiChevronLeft, FiChevronRight,
  FiChevronRight as FiBreadcrumbRight, FiX, FiCheck, FiUser, FiUsers, FiTrash2,
  FiArrowRight, FiCalendar
} from 'react-icons/fi';
import { Link, useParams } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import TemporaryTransferModal from '../../components/admin/TemporaryTransferModal';
import BatchConversionModal from '../../components/admin/BatchConversionModal';
import EffectiveBatchBadge from '../../components/admin/EffectiveBatchBadge';

interface Student {
  _id?: string;
  id: number;
  name: string;
  avatar: string;
  phone: string;
  age: number;
  email: string;
  gender: string;
  joiningDate: string;
  feeStatus: 'PAID' | 'PARTIAL' | 'PENDING' | 'UNPAID';
  batchEnd: string;
  remainingDays: number;
  attendanceRate: number;
  attendanceTrend: string;
  batch: string;
  batchId?: string | { _id: string; batchName?: string };
  course: string;
  courseId?: string | { _id: string; courseName?: string };
  teacher: string;
  admissionDate: string;
  schedule: string;
  address: string;
}

const PaintPaletteIcon = () => (
  <svg className="text-purple-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 9.5 20 7.5 17.5 7.5H15.5C14.5 7.5 13.5 6.5 13.5 5.5V3.5C13.5 2.5 12.5 2 11.5 2C5.97715 2 1.5 6.47715 1.5 12C1.5 17.5228 5.97715 22 11.5 22H12Z" />
    <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
    <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
    <circle cx="16.5" cy="11.5" r="1.5" fill="currentColor" />
  </svg>
);

const BatchDetails: React.FC = () => {
  const { batchId } = useParams<{ batchId: string }>();
  const { user } = useAuth();
  const [studentsList, setStudentsList] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFeeFilter, setActiveFeeFilter] = useState<'All' | 'Paid' | 'Pending'>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportStudent, setReportStudent] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});

  const [batches, setBatches] = useState<any[]>([]);
  const [activeSession, setActiveSession] = useState<any>(null);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showConversionModal, setShowConversionModal] = useState(false);
  const [studentTransfers, setStudentTransfers] = useState<any[]>([]);
  const [studentConversions, setStudentConversions] = useState<any[]>([]);

  const [transferDefaultValues, setTransferDefaultValues] = useState<any>(null);
  const [conversionDefaultValues, setConversionDefaultValues] = useState<any>(null);
  const [deletingTransferId, setDeletingTransferId] = useState<string | null>(null);

  const currentBatch = batches.find(b => b._id === batchId);

  const handleToggleAttendance = async () => {
    if (!currentBatch || !currentBatch._id) return;
    try {
      if (activeSession) {
        if (user?.role === 'teacher' && activeSession.enabledByRole === 'admin') {
          alert('You cannot disable an attendance session enabled by an Admin.');
          return;
        }
        // Disable it
        const res = await fetch(`${API_BASE_URL}/api/attendance/sessions/${activeSession._id}/disable`, {
          method: 'PUT'
        });
        if (res.ok) setActiveSession(null);
      } else {
        // Enable it
        const res = await fetch(`${API_BASE_URL}/api/attendance/sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            batchId: currentBatch._id,
            enabledByUserId: user?._id,
            enabledByName: user?.name || user?.email,
            enabledByRole: user?.role
          })
        });
        if (res.ok) {
          const session = await res.json();
          setActiveSession(session);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExtendBatch = async () => {
    if (!currentBatch || !currentBatch._id) return;
    const newDate = window.prompt('Enter new end date for the batch (YYYY-MM-DD):', currentBatch.endDate);
    if (!newDate) return;
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/${currentBatch._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: newDate })
      });
      if (res.ok) {
        alert('Batch extended successfully!');
        fetchStudentsAndBatches();
      } else {
        alert('Failed to extend batch.');
      }
    } catch (err) {
      console.error(err);
      alert('Error extending batch.');
    }
  };

  const fetchStudentsAndBatches = async () => {
    if (!batchId) return;
    try {
      const [studentsRes, batchesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/students/effective-batch/${batchId}`),
        fetch(`${API_BASE_URL}/api/batches`)
      ]);
      const studentsData = await studentsRes.json();
      const batchesData = await batchesRes.json();
      setStudentsList(studentsData);
      setBatches(batchesData);
    } catch (err) {
      console.error("Failed to load students and batches from API", err);
    }
  };

  useEffect(() => {
    if (selectedStudent && selectedStudent._id) {
      const headers = {
        'Authorization': `Bearer ${user?.token}`
      };

      // Debug: verify studentId is defined and valid before API calls
      console.log('[BatchDetails] Fetching transfers for studentId:', selectedStudent._id);

      fetch(`${API_BASE_URL}/api/transfers?studentId=${selectedStudent._id}`, { headers })
        .then(async res => {
          if (!res.ok) {
            const errText = await res.text();
            console.error(`[BatchDetails] GET /api/transfers failed — ${res.status}:`, errText);
            return [];
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setStudentTransfers(data);
        })
        .catch(err => console.error('[BatchDetails] Transfers fetch error:', err));

      // Debug: verify studentId before batch-conversions call
      console.log('[BatchDetails] Fetching batch-conversions for studentId:', selectedStudent._id);

      fetch(`${API_BASE_URL}/api/transfers/batch-conversions?studentId=${selectedStudent._id}`, { headers })
        .then(async res => {
          if (!res.ok) {
            const errText = await res.text();
            console.error(`[BatchDetails] GET /api/transfers/batch-conversions failed — ${res.status}:`, errText);
            return [];
          }
          return res.json();
        })
        .then(data => {
          if (Array.isArray(data)) setStudentConversions(data);
        })
        .catch(err => console.error('[BatchDetails] Conversions fetch error:', err));
    } else {
      setStudentTransfers([]);
      setStudentConversions([]);
    }
  }, [selectedStudent, user]);

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !selectedStudent._id) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${selectedStudent._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editFormData),
      });
      if (res.ok) {
        const updatedStudent = await res.json();
        setSelectedStudent(updatedStudent);
        setIsEditingStudent(false);
        fetchStudentsAndBatches();
      } else {
        console.error("Failed to update student");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/students/${studentId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        alert("Student deleted successfully!");
        fetchStudentsAndBatches();
        if (selectedStudent && (selectedStudent._id === studentId)) {
          setSelectedStudent(null);
        }
      } else {
        alert("Failed to delete student.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting student.");
    }
  };

  const handleDeleteTransfer = async (transferId: string, status: string) => {
    if (status === 'active') {
      alert('⚠️ This transfer is currently active. Please cancel it first before deleting.');
      return;
    }
    const confirmed = window.confirm(
      'Delete Transfer Record\n\nThis will permanently remove this transfer record. This action cannot be undone.\n\nAre you sure?'
    );
    if (!confirmed) return;

    setDeletingTransferId(transferId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/transfers/${transferId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${user?.token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setStudentTransfers((prev: any[]) => prev.filter((t: any) => t._id !== transferId));
        alert('✅ Transfer record deleted successfully.');
      } else {
        alert(`❌ ${data.message || 'Failed to delete transfer record.'}`);
      }
    } catch (err) {
      console.error('Delete transfer error:', err);
      alert('❌ Network error. Could not delete transfer.');
    } finally {
      setDeletingTransferId(null);
    }
  };

  const studentsInBatch = studentsList;


  useEffect(() => {
    fetchStudentsAndBatches();
    if (batchId) {
      fetch(`${API_BASE_URL}/api/attendance/sessions/batch/${batchId}/active`)
        .then(res => res.json())
        .then(data => setActiveSession(data))
        .catch(err => console.error(err));
    }
  }, [batchId]);



  // Filters students list based on search query and fee status tabs
  const filteredStudents = studentsInBatch.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFee = true;
    if (activeFeeFilter === 'Paid') {
      matchesFee = student.feeStatus === 'PAID';
    } else if (activeFeeFilter === 'Pending') {
      matchesFee = student.feeStatus === 'PENDING' || student.feeStatus === 'PARTIAL';
    }

    return matchesSearch && matchesFee;
  });

  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStudents = filteredStudents.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFeeFilter]);

  const calculateRemainingDays = (endDateStr?: string) => {
    if (!endDateStr) return 'N/A';
    const end = new Date(endDateStr);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} Days` : 'Ended';
  };


  return (
    <div className="p-4 sm:p-6 md:p-10">

        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="relative w-full md:w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400 font-sans"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-medium text-slate-500">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#6247df] text-white flex items-center justify-center font-bold text-lg shadow-sm border-2 border-white">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</div>
            </div>
          </div>
        </div>

        {/* Breadcrumb & Actions Header */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold mb-2">
              <Link to="/admin/students" className="text-slate-500 hover:text-slate-700 no-underline">Students</Link>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-slate-500">{currentBatch ? (currentBatch.courseId?.courseName || currentBatch.courseName || 'Course') : 'Course'}</span>
              <FiBreadcrumbRight className="text-slate-400" size={14} />
              <span className="text-[#6247df] font-bold">{currentBatch ? currentBatch.batchName : 'Batch'}</span>
            </div>
            <h2 className="text-[22px] font-bold text-[#1c1c28]">
              {currentBatch ? `${currentBatch.courseId?.courseName || currentBatch.courseName || 'Course'} – ${currentBatch.batchName}` : 'Student List'}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Tabs */}
            <div className="bg-slate-100/80 p-1 rounded-xl flex items-center shadow-inner">
              <button
                onClick={() => setActiveFeeFilter('All')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${activeFeeFilter === 'All'
                  ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
                  }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFeeFilter('Paid')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${activeFeeFilter === 'Paid'
                  ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
                  }`}
              >
                Paid
              </button>
              <button
                onClick={() => setActiveFeeFilter('Pending')}
                className={`px-6 py-2 rounded-lg font-bold text-sm transition-all border-none cursor-pointer ${activeFeeFilter === 'Pending'
                  ? 'bg-white text-[#6247df] shadow-[0_2px_10px_rgb(0,0,0,0.04)]'
                  : 'text-slate-500 hover:text-slate-700 bg-transparent'
                  }`}
              >
                Pending
              </button>
            </div>

            {(user?.role === 'admin' || user?.role === 'teacher') && (
              <button
                onClick={handleToggleAttendance}
                disabled={activeSession && user?.role === 'teacher' && activeSession.enabledByRole === 'admin'}
                className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all ${activeSession
                    ? (user?.role === 'teacher' && activeSession.enabledByRole === 'admin')
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                      : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                    : 'bg-[#6247df] text-white hover:bg-[#5035c9] shadow-purple-200'
                  }`}
                title={activeSession && user?.role === 'teacher' && activeSession.enabledByRole === 'admin' ? "Cannot disable session enabled by Admin" : ""}
              >
                {activeSession ? 'Disable Attendance' : 'Enable Attendance'}
              </button>
            )}

            {currentBatch?.status === 'INACTIVE' && user?.role === 'admin' && (
              <button 
                onClick={handleExtendBatch}
                className="px-4 py-2.5 rounded-xl font-bold text-sm transition-all bg-[#108c9f] text-white hover:bg-[#0e7c8c] shadow-md cursor-pointer border-none"
              >
                Extend Batch
              </button>
            )}



            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer">
              <FiUpload size={16} /> Export
            </button>


          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#f3f0ff] text-[#6247df] flex items-center justify-center shrink-0">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">TOTAL STUDENTS</p>
              <h3 className="text-2xl font-black text-[#1c1c28]">{studentsInBatch.length}</h3>
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 flex items-center gap-5">
            <div className="w-14 h-14 rounded-full bg-[#fef1f1] text-[#ef4444] flex items-center justify-center shrink-0">
              <FiClock size={24} />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-500 tracking-wider mb-0.5">BATCH ENDS IN</p>
              <h3 className="text-2xl font-black text-[#ef4444]">{calculateRemainingDays(currentBatch?.endDate)}</h3>
            </div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.02)] border border-slate-50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px] font-sans">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold text-slate-500">
                  <th className="py-5 px-4 font-bold">Name</th>
                  <th className="py-5 px-4 font-bold">Age/Gender</th>
                  <th className="py-5 px-4 font-bold">Joining Date</th>
                  <th className="py-5 px-4 font-bold">Fee Status</th>
                  <th className="py-5 px-4 font-bold">Batch End</th>
                  <th className="py-5 px-6 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paginatedStudents.map((student) => (
                  <tr key={student._id || student.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-4">
                      <div
                        className="font-bold text-[#1c1c28] text-sm hover:text-[#6247df] cursor-pointer transition-colors"
                        onClick={() => setSelectedStudent(student)}
                      >
                        {student.name}
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{student.phone}</div>
                      {(() => {
                        const sBatchId = (student.batchId && typeof student.batchId === 'object') ? student.batchId._id : student.batchId;
                        const isTransferred = sBatchId?.toString() !== batchId?.toString();
                        const origName = (student.batchId && typeof student.batchId === 'object') ? student.batchId.batchName : student.batch;
                        return (
                          <div className="mt-1">
                            <EffectiveBatchBadge
                              isTransferred={isTransferred}
                              effectiveBatchName={currentBatch?.batchName || ''}
                              originalBatchName={origName}
                            />
                          </div>
                        );
                      })()}
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.age} / {student.gender || 'Male'}</td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.joiningDate}</td>
                    <td className="py-4 px-4">
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md tracking-wider ${student.feeStatus === 'PAID' ? 'bg-[#e6f8f8] text-[#108c9f]' :
                        student.feeStatus === 'PARTIAL' ? 'bg-[#fcf2ea] text-[#b67323]' :
                          'bg-[#fef1f1] text-[#ef4444]'
                        }`}>
                        {student.feeStatus}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm font-medium text-slate-600">{student.batchEnd}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-3 text-slate-400">
                        <button
                          onClick={() => setSelectedStudent(student)}
                          className="hover:text-slate-700 transition-colors bg-transparent border-none cursor-pointer"
                        >
                          <FiEye size={18} />
                        </button>

                        <button
                          onClick={() => { setReportStudent(student); setShowReportModal(true); }}
                          className="hover:text-slate-700 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <FiFileText size={18} />
                        </button>

                        {user?.role === 'admin' && (
                          <button
                            onClick={() => handleDeleteStudent(student._id || student.id?.toString() || '')}
                            className="hover:text-red-600 text-red-400 transition-colors border-none bg-transparent cursor-pointer"
                            title="Delete Student"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-6 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-slate-500">
              Showing {filteredStudents.length > 0 ? startIndex + 1 : 0}-{Math.min(endIndex, filteredStudents.length)} of {filteredStudents.length} students
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-400 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer"
              >
                <FiChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm transition-colors border-none cursor-pointer ${currentPage === pageNum
                      ? 'bg-[#6247df] text-white shadow-md shadow-purple-200'
                      : 'text-slate-600 hover:bg-slate-50 bg-transparent'
                    }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors bg-transparent cursor-pointer"
              >
                <FiChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>



      {/* Student Details Side Drawer */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-[2px] transition-opacity"
            onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-[460px] bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-fade-in border-l border-slate-100">
            {/* Purple Header */}
            <div className="bg-[#6247df] text-white p-8 relative shrink-0">
              {/* Close Button */}
              <button
                onClick={() => { setSelectedStudent(null); setIsEditingStudent(false); }}
                className="absolute top-6 left-6 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors focus:outline-none"
              >
                <FiX size={18} />
              </button>

              {/* Avatar and Name */}
              <div className="flex items-center gap-5 mt-12">
                <div>
                  <h3 className="text-2xl font-black tracking-tight">{selectedStudent.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      Age {selectedStudent.age}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {selectedStudent.gender || 'Gender'}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                      {selectedStudent.batch}
                    </span>
                    <span className="bg-white/20 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <FiCheck className="stroke-[3]" size={8} /> Active Student
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {!isEditingStudent ? (
              <>
                {/* Metrics cards row */}
                <div className="grid grid-cols-1 gap-4 px-8 pt-6 pb-4">
                  {/* Attendance Rate */}
                  <div className="bg-[#f9f8ff] border border-purple-100/70 rounded-3xl p-5 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] font-bold text-slate-400 tracking-wider mb-2">ATTENDANCE RATE</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-[#6247df]">{selectedStudent.attendanceRate}%</span>
                        <span className="text-[10px] font-extrabold text-purple-500">{selectedStudent.attendanceTrend}</span>
                      </div>
                    </div>
                    <div className="w-full bg-purple-100 h-1.5 rounded-full overflow-hidden mt-4">
                      <div
                        className="bg-[#6247df] h-full rounded-full"
                        style={{ width: `${selectedStudent.attendanceRate}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Academic Details Section */}
                <div className="px-8 py-4">
                  <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                    <PaintPaletteIcon />
                    <h4 className="text-[15px] font-bold">Academic Details</h4>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-3xl p-5 grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Course</p>
                      <p className="text-sm font-extrabold text-slate-700">{selectedStudent.course}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Tutor</p>
                      <p className="text-sm font-extrabold text-slate-700">{selectedStudent.teacher}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Admission Date</p>
                      <p className="text-sm font-extrabold text-slate-700">{selectedStudent.admissionDate}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 mb-0.5 uppercase">Batch Schedule</p>
                      <p className="text-sm font-extrabold text-slate-700">{selectedStudent.schedule}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information Section */}
                <div className="px-8 py-4 flex-grow">
                  <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                    <span className="text-[#6247df]"><FiUser size={18} /></span>
                    <h4 className="text-[15px] font-bold">Contact Information</h4>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Phone */}
                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 mb-0.5">Phone Number</p>
                        <p className="text-sm font-extrabold text-slate-700">{selectedStudent.phone}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl bg-white">
                      <div className="w-10 h-10 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center shrink-0">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 mb-0.5">Address</p>
                        <p className="text-sm font-extrabold text-slate-700">{selectedStudent.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Batch Transfer / Conversion Actions */}
                {user?.role === 'admin' && (
                  <div className="px-8 py-4 border-t border-slate-100/50">
                    <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                      <span className="text-[#6247df]"><FiCalendar size={18} /></span>
                      <h4 className="text-[15px] font-bold">Schedule Actions</h4>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => { setTransferDefaultValues(null); setShowTransferModal(true); }}
                        className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 font-bold py-3.5 rounded-2xl text-xs transition-colors focus:outline-none cursor-pointer"
                      >
                        Temporary Transfer
                      </button>
                      <button
                        onClick={() => { setConversionDefaultValues(null); setShowConversionModal(true); }}
                        className="flex-1 bg-purple-50 hover:bg-purple-100 text-[#6247df] border border-purple-200 font-bold py-3.5 rounded-2xl text-xs transition-colors focus:outline-none cursor-pointer"
                      >
                        Convert Batch
                      </button>
                    </div>
                  </div>
                )}

                {/* Student Transfer History */}
                {studentTransfers.length > 0 && (
                  <div className="px-8 py-4 border-t border-slate-100/50">
                    <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                      <span className="text-[#6247df]"><FiClock size={18} /></span>
                      <h4 className="text-[15px] font-bold">Schedule History</h4>
                    </div>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {studentTransfers.map((t: any) => (
                        <div key={t._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              {new Date(t.startDate).toLocaleDateString()} - {new Date(t.endDate).toLocaleDateString()}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase ${
                              t.status === 'active' ? 'bg-green-100 text-green-700' :
                              t.status === 'scheduled' ? 'bg-blue-100 text-blue-700' :
                              t.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-slate-200 text-slate-600'
                            }`}>
                              {t.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-400 line-through text-[11px]">{t.originalBatchId?.batchName}</span>
                            <FiArrowRight className="text-slate-400" size={12} />
                            <span className="text-[#6247df]">{t.temporaryBatchId?.batchName}</span>
                          </div>
                          {t.reason && <p className="text-[11px] text-slate-500 font-medium italic mb-1">Reason: "{t.reason}"</p>}
                          
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Temporary Shift</span>
                            {user?.role === 'admin' && (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setTransferDefaultValues({
                                      transferBatchId: t.temporaryBatchId?._id || t.temporaryBatchId,
                                      startDate: new Date().toISOString().split('T')[0],
                                      endDate: '',
                                      reason: t.reason,
                                      notes: t.notes
                                    });
                                    setShowTransferModal(true);
                                  }}
                                  className="text-amber-600 hover:text-amber-700 font-extrabold text-[10px] bg-transparent border-none cursor-pointer p-0"
                                >
                                  Redo Transfer
                                </button>
                                <span className="text-slate-200">|</span>
                                <button
                                  onClick={() => handleDeleteTransfer(t._id, t.status)}
                                  disabled={deletingTransferId === t._id}
                                  title={t.status === 'active' ? 'Cancel this transfer first to delete it' : 'Delete transfer record'}
                                  className={`flex items-center gap-1 font-extrabold text-[10px] border-none cursor-pointer p-0 transition-colors ${
                                    t.status === 'active'
                                      ? 'text-slate-300 cursor-not-allowed'
                                      : 'text-red-500 hover:text-red-700'
                                  } ${deletingTransferId === t._id ? 'opacity-50' : ''}`}
                                >
                                  <FiTrash2 size={11} />
                                  {deletingTransferId === t._id ? 'Deleting...' : 'Delete'}
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Student Conversion History */}
                {studentConversions.length > 0 && (
                  <div className="px-8 py-4 border-t border-slate-100/50">
                    <div className="flex items-center gap-2.5 mb-3 text-[#1c1c28]">
                      <span className="text-[#6247df]"><FiClock size={18} /></span>
                      <h4 className="text-[15px] font-bold">Conversion History</h4>
                    </div>
                    <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1">
                      {studentConversions.map((c: any) => (
                        <div key={c._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs font-semibold text-slate-600 space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                              Effective: {new Date(c.effectiveDate).toLocaleDateString()}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-black bg-purple-100 text-purple-700 uppercase">
                              Converted
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 font-bold">
                            <span className="text-slate-400 text-[11px]">{c.oldBatchId?.batchName || 'None'}</span>
                            <FiArrowRight className="text-slate-400" size={12} />
                            <span className="text-green-600">{c.newBatchId?.batchName}</span>
                          </div>
                          {c.reason && <p className="text-[11px] text-slate-500 font-medium italic">Reason: "{c.reason}"</p>}
                          
                          <div className="flex justify-between items-center pt-1.5 border-t border-slate-100 mt-2">
                            <span className="text-[9px] text-slate-400 font-bold uppercase">Permanent Conversion</span>
                            {user?.role === 'admin' && (
                              <button
                                onClick={() => {
                                  setConversionDefaultValues({
                                    newBatchId: c.newBatchId?._id || c.newBatchId,
                                    effectiveDate: new Date().toISOString().split('T')[0],
                                    reason: c.reason
                                  });
                                  setShowConversionModal(true);
                                }}
                                className="text-[#6247df] hover:text-[#5035c9] font-extrabold text-[10px] bg-transparent border-none cursor-pointer p-0"
                              >
                                Redo Conversion
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50 shrink-0">
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => {
                        setEditFormData({
                          name: selectedStudent.name,
                          phone: selectedStudent.phone,
                          address: selectedStudent.address,
                          feeStatus: selectedStudent.feeStatus,
                          age: selectedStudent.age,
                          gender: selectedStudent.gender
                        });
                        setIsEditingStudent(true);
                      }}
                      className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-colors focus:outline-none cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  )}
                  <button
                    onClick={() => { setReportStudent(selectedStudent); setShowReportModal(true); }}
                    className="flex-1 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md shadow-purple-200 focus:outline-none cursor-pointer"
                  >
                    Generate Report
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleUpdateStudent} className="flex-1 flex flex-col overflow-y-auto">
                <div className="px-8 py-6 flex-1 space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Name</label>
                    <input type="text" className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.name || ''} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Age</label>
                      <input type="text" className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.age || ''} onChange={e => setEditFormData({ ...editFormData, age: e.target.value ? parseInt(e.target.value) : undefined })} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Gender</label>
                      <select className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.gender || ''} onChange={e => setEditFormData({ ...editFormData, gender: e.target.value })}>
                        <option>Male</option>
                        <option>Female</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Phone</label>
                    <input type="text" className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.phone || ''} onChange={e => setEditFormData({ ...editFormData, phone: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                    <input type="text" className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.address || ''} onChange={e => setEditFormData({ ...editFormData, address: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Status</label>
                    <select className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans" value={editFormData.feeStatus || ''} onChange={e => setEditFormData({ ...editFormData, feeStatus: e.target.value as 'PAID' | 'UNPAID' | 'PARTIAL' | 'PENDING' })}>
                      <option value="PAID">PAID</option>
                      <option value="PARTIAL">PARTIAL</option>
                      <option value="PENDING">PENDING</option>
                      <option value="UNPAID">UNPAID</option>
                    </select>
                  </div>
                </div>
                <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50 shrink-0">
                  <button type="button" onClick={() => setIsEditingStudent(false)} className="flex-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold py-3.5 rounded-2xl text-sm transition-colors focus:outline-none cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold py-3.5 rounded-2xl text-sm transition-colors shadow-md shadow-purple-200 focus:outline-none cursor-pointer">
                    Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* Modal - Student Report */}
      {showReportModal && reportStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:static">
          <div className="bg-white w-full max-w-2xl rounded-[2rem] overflow-hidden shadow-2xl flex flex-col max-h-[92vh] print:max-h-full print:shadow-none print:rounded-none">
            {/* Modal Header (Hidden on print) */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between print:hidden">
              <h3 className="font-extrabold text-lg text-slate-900">Academic & Enrollment Report</h3>
              <button
                onClick={() => { setShowReportModal(false); setReportStudent(null); }}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Printable area) */}
            <div className="p-8 overflow-y-auto flex-1 space-y-6 print:p-0 print:overflow-visible">
              <div className="text-center pb-6 border-b border-slate-100">
                <h2 className="text-2xl font-black text-[#6247df] tracking-wide">GLOSMART ACADEMY</h2>
                <p className="text-xs font-bold text-slate-400 tracking-widest uppercase mt-1">Official Student Report Card</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
                <div className="flex-1 text-center sm:text-left space-y-1">
                  <h3 className="text-xl font-bold text-slate-900">{reportStudent.name}</h3>
                  <p className="text-sm font-medium text-slate-500">{reportStudent.email}</p>
                  <p className="text-sm font-medium text-slate-500">Phone: {reportStudent.phone}</p>
                  <p className="text-sm font-medium text-slate-500">Address: {reportStudent.address || 'Not provided'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Course Enrolled</span>
                  <span className="text-sm font-extrabold text-slate-800">{reportStudent.course || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Batch Schedule</span>
                  <span className="text-sm font-extrabold text-slate-800">{reportStudent.batch || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Joining Date</span>
                  <span className="text-sm font-extrabold text-slate-800">{reportStudent.joiningDate || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Fee Status</span>
                  <span className={`text-xs font-black px-2 py-0.5 rounded uppercase ${reportStudent.feeStatus === 'PAID' ? 'bg-[#e6f8f8] text-[#108c9f]' :
                      reportStudent.feeStatus === 'PARTIAL' ? 'bg-[#fcf2ea] text-[#b67323]' :
                        'bg-[#fef1f1] text-[#ef4444]'
                    }`}>
                    {reportStudent.feeStatus || 'PENDING'}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">Academic & Attendance Summary</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100/50">
                    <span className="text-[10px] font-bold text-purple-500 uppercase block mb-1">Attendance Rate</span>
                    <span className="text-2xl font-black text-[#6247df]">{reportStudent.attendanceRate || 100}%</span>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-8 italic">
                Generated automatically on {new Date().toLocaleDateString()} by Glosmart Management System.
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-slate-100 flex gap-4 bg-slate-50">
              <button
                onClick={() => { setShowReportModal(false); setReportStudent(null); }}
                className="w-full bg-white border border-slate-200 text-slate-700 font-bold py-3 rounded-2xl text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showTransferModal && selectedStudent && (
        <TemporaryTransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          onSuccess={() => {
            fetchStudentsAndBatches();
            if (selectedStudent?._id) {
              fetch(`${API_BASE_URL}/api/transfers?studentId=${selectedStudent._id}`, {
                headers: {
                  'Authorization': `Bearer ${user?.token}`
                }
              })
                .then(res => res.ok ? res.json() : [])
                .then(data => {
                  if (Array.isArray(data)) setStudentTransfers(data);
                });
            }
          }}
          student={{
            _id: selectedStudent._id || '',
            name: selectedStudent.name,
            course: selectedStudent.course || '',
            courseId: (selectedStudent.courseId && typeof selectedStudent.courseId === 'object') 
              ? (selectedStudent.courseId as any)._id 
              : (selectedStudent.courseId || currentBatch?.courseId?._id || ''),
            batch: (selectedStudent.batchId && typeof selectedStudent.batchId === 'object') 
              ? (selectedStudent.batchId as any).batchName 
              : (selectedStudent.batch || ''),
            batchId: (selectedStudent.batchId && typeof selectedStudent.batchId === 'object') 
              ? (selectedStudent.batchId as any)._id 
              : (selectedStudent.batchId || '')
          }}
          defaultValues={transferDefaultValues}
        />
      )}

      {showConversionModal && selectedStudent && (
        <BatchConversionModal
          isOpen={showConversionModal}
          onClose={() => setShowConversionModal(false)}
          onSuccess={() => {
            fetchStudentsAndBatches();
            setSelectedStudent(null);
          }}
          student={{
            _id: selectedStudent._id || '',
            name: selectedStudent.name,
            course: selectedStudent.course || '',
            courseId: (selectedStudent.courseId && typeof selectedStudent.courseId === 'object') 
              ? (selectedStudent.courseId as any)._id 
              : (selectedStudent.courseId || currentBatch?.courseId?._id || ''),
            batch: (selectedStudent.batchId && typeof selectedStudent.batchId === 'object') 
              ? (selectedStudent.batchId as any).batchName 
              : (selectedStudent.batch || ''),
            batchId: (selectedStudent.batchId && typeof selectedStudent.batchId === 'object') 
              ? (selectedStudent.batchId as any)._id 
              : (selectedStudent.batchId || '')
          }}
          defaultValues={conversionDefaultValues}
        />
      )}
    </div>
  );
};

export default BatchDetails;
