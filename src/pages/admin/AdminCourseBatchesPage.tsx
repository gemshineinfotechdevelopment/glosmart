import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiClock, FiCalendar, FiFileText, FiX, FiVideo, FiCopy, FiLink } from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminCourseBatchesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [course, setCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState<any>(null);
  const [teachers, setTeachers] = useState<any[]>([]);

  // Assignment states
  const [assignmentInputs, setAssignmentInputs] = useState<Record<string, string>>({});
  const [savingAssignment, setSavingAssignment] = useState<string | null>(null);

  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Zoom link inline state
  const [zoomLinkInputs, setZoomLinkInputs] = useState<Record<string, string>>({});
  const [savingZoomBatch, setSavingZoomBatch] = useState<string | null>(null);
  const [zoomStatus, setZoomStatus] = useState<Record<string, 'active' | 'inactive' | 'empty' | null>>({});

  // Deactivate Session Report Modal state
  const [deactivateBatchModal, setDeactivateBatchModal] = useState<any>(null);
  const [sessionReportDescription, setSessionReportDescription] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const [formData, setFormData] = useState({
    batchName: '',
    instructor: '',
    capacity: 30,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    days: [] as string[],
    status: 'UPCOMING',
    batchFee: '',
    image: '',
    zoomLink: ''
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, image: data.imageUrl }));
      } else {
        alert('Upload failed: ' + data.message);
      }
    } catch (error) {
      console.error('Error uploading image', error);
      alert('Error uploading image');
    } finally {
      setUploadingImage(false);
    }
  };

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const courseRes = await fetch(`http://localhost:5000/api/courses/${id}`);
      const courseData = await courseRes.json();
      setCourse(courseData);

      const batchesRes = await fetch(`http://localhost:5000/api/batches/course/${id}`);
      const batchesData = await batchesRes.json();

      setBatches(batchesData);

      // Initialize inline zoom link inputs and status from fetched batches
      const initialZoomInputs: Record<string, string> = {};
      const initialZoomStatus: Record<string, 'active' | 'inactive' | null> = {};
      batchesData.forEach((b: any) => { 
        initialZoomInputs[b._id] = b.zoomLink || ''; 
        initialZoomStatus[b._id] = b.isZoomActive ? 'active' : (b.zoomLink ? 'inactive' : null);
      });
      setZoomLinkInputs(initialZoomInputs);
      setZoomStatus(initialZoomStatus);

      const teachersRes = await fetch('http://localhost:5000/api/teachers');
      const teachersData = await teachersRes.json();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day: string) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day) 
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        courseId: id,
        capacity: Number(formData.capacity),
        batchFee: formData.batchFee ? Number(formData.batchFee) : undefined
      };

      const url = editingBatch 
        ? `http://localhost:5000/api/batches/${editingBatch._id}` 
        : 'http://localhost:5000/api/batches';
      const method = editingBatch ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setShowModal(false);
        setEditingBatch(null);
        resetForm();
        fetchData();
      } else {
        alert('Failed to save batch');
      }
    } catch (error) {
      console.error('Error saving batch', error);
    }
  };

  const handleDelete = async (batchId: string) => {
    if (window.confirm('Delete this batch?')) {
      try {
        await fetch(`http://localhost:5000/api/batches/${batchId}`, { method: 'DELETE' });
        fetchData();
      } catch (error) {
        console.error('Delete failed', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      batchName: '',
      instructor: '',
      capacity: 30,
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      days: [] as string[],
      status: 'UPCOMING',
      batchFee: '',
      image: '',
      zoomLink: ''
    });
  };

  const openEditModal = (batch: any) => {
    setEditingBatch(batch);
    setFormData({
      batchName: batch.batchName || '',
      instructor: batch.instructor || '',
      capacity: batch.capacity || 30,
      startDate: batch.startDate || '',
      endDate: batch.endDate || '',
      startTime: batch.startTime || '',
      endTime: batch.endTime || '',
      days: batch.days || ([] as string[]),
      status: batch.status || 'UPCOMING',
      batchFee: batch.batchFee?.toString() || '',
      image: batch.image || '',
      zoomLink: batch.zoomLink || ''
    });
    setShowModal(true);
  };

  // Check if a batch class is currently live
  const isBatchLive = (batch: any): boolean => {
    if (!batch.zoomLink || batch.status !== 'ACTIVE') return false;
    if (!batch.days || batch.days.length === 0 || !batch.startTime || !batch.endTime) return false;

    const now = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = dayNames[now.getDay()];

    if (!batch.days.includes(todayName)) return false;

    const [startH, startM] = batch.startTime.split(':').map(Number);
    const [endH, endM] = batch.endTime.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  };

  const handleCopyLink = (link: string, batchId: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(batchId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleSaveZoomLink = async (batch: any, activate: boolean) => {
    const linkValue = zoomLinkInputs[batch._id]?.trim();
    if (!linkValue) {
      setZoomStatus(prev => ({ ...prev, [batch._id]: 'empty' }));
      return;
    }

    if (activate) {
      // Activating Zoom Link: set status = ACTIVE, isZoomActive = true, zoomActivatedAt = new Date()
      setSavingZoomBatch(batch._id);
      try {
        const payload = {
          ...batch,
          zoomLink: linkValue,
          isZoomActive: true,
          zoomActivatedAt: new Date().toISOString(),
          status: 'ACTIVE',
        };
        const res = await fetch(`http://localhost:5000/api/batches/${batch._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setZoomStatus(prev => ({ ...prev, [batch._id]: 'active' }));
          fetchData();
        } else {
          alert('Failed to save zoom link');
        }
      } catch (err) {
        console.error('Error saving zoom link', err);
      } finally {
        setSavingZoomBatch(null);
      }
    } else {
      // Deactivating Zoom Link
      if (user?.role === 'teacher') {
        // Teachers: Open Deactivate Report Modal Popup to send report to Admin!
        setDeactivateBatchModal(batch);
        setSessionReportDescription('');
      } else {
        // Admins: Deactivate directly without sending a report
        setSavingZoomBatch(batch._id);
        try {
          const payload = {
            ...batch,
            zoomLink: linkValue,
            isZoomActive: false,
            zoomActivatedAt: null,
            status: 'UPCOMING',
          };
          const res = await fetch(`http://localhost:5000/api/batches/${batch._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (res.ok) {
            setZoomStatus(prev => ({ ...prev, [batch._id]: 'inactive' }));
            fetchData();
          } else {
            alert('Failed to save zoom link');
          }
        } catch (err) {
          console.error('Error saving zoom link', err);
        } finally {
          setSavingZoomBatch(null);
        }
      }
    }
  };

  const handleSubmitDeactivationReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deactivateBatchModal) return;

    const linkValue = zoomLinkInputs[deactivateBatchModal._id]?.trim() || deactivateBatchModal.zoomLink || '';

    setSubmittingReport(true);
    try {
      // 1. Submit Tutor Report to /api/tutor-reports
      const reportPayload = {
        teacherName: user?.name || (user?.role === 'teacher' ? 'Tutor User' : 'Admin User'),
        courseName: course?.courseName || deactivateBatchModal.courseName || 'Art Course',
        batchName: deactivateBatchModal.batchName,
        batchCode: deactivateBatchModal.batchCode || '',
        zoomLink: linkValue,
        activatedAt: deactivateBatchModal.zoomActivatedAt || new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        deactivatedAt: new Date().toISOString(),
        description: sessionReportDescription.trim() || 'No session notes provided.'
      };

      await fetch('http://localhost:5000/api/tutor-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reportPayload)
      });

      // 2. Update Batch to deactivate Zoom link
      const batchPayload = {
        ...deactivateBatchModal,
        zoomLink: linkValue,
        isZoomActive: false,
        zoomActivatedAt: null,
        status: 'UPCOMING'
      };

      await fetch(`http://localhost:5000/api/batches/${deactivateBatchModal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(batchPayload)
      });

      setZoomStatus(prev => ({ ...prev, [deactivateBatchModal._id]: 'inactive' }));
      setDeactivateBatchModal(null);
      setSessionReportDescription('');
      fetchData();
    } catch (err) {
      console.error('Error submitting deactivation report', err);
      alert('Failed to submit report and deactivate link.');
    } finally {
      setSubmittingReport(false);
    }
  };

  // Assignment handlers
  const handleAddAssignment = async (batchId: string) => {
    const text = assignmentInputs[batchId]?.trim();
    if (!text) return;

    setSavingAssignment(batchId);
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${batchId}/assignments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: text })
      });
      if (res.ok) {
        setAssignmentInputs(prev => ({ ...prev, [batchId]: '' }));
        fetchData();
      } else {
        alert('Failed to add assignment');
      }
    } catch (error) {
      console.error('Error adding assignment', error);
    } finally {
      setSavingAssignment(null);
    }
  };

  const handleDeleteAssignment = async (batchId: string, assignmentId: string) => {
    try {
      const res = await fetch(`http://localhost:5000/api/batches/${batchId}/assignments/${assignmentId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error deleting assignment', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        
        <button 
          onClick={() => navigate('/admin/courses')}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <FiArrowLeft /> Back to Courses
        </button>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
                  Batches for {course?.courseName}
                  <span className="text-sm font-normal px-2 py-1 bg-slate-200 text-slate-700 rounded">
                    {course?.courseCode}
                  </span>
                </h1>
                <p className="text-slate-500 mt-1">Manage schedules, instructors, and assignments.</p>
              </div>
              {(user?.role === 'admin' || user?.role === 'teacher') && (
                <button 
                  onClick={() => { resetForm(); setEditingBatch(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus /> Create Batch
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {batches.map(batch => (
                <div key={batch._id} className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col ${isBatchLive(batch) ? 'border-emerald-300 ring-2 ring-emerald-100' : 'border-slate-200'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex gap-4">
                      {batch.image && (
                        <img src={batch.image} alt={batch.batchName} className="w-12 h-12 rounded-lg object-cover" />
                      )}
                      <div>
                        <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded mb-2 inline-block">
                          {batch.batchCode}
                        </span>
                        <h3 className="font-bold text-lg text-slate-800">{batch.batchName}</h3>
                        <p className="text-sm text-slate-500">Instructor: {batch.instructor || 'Unassigned'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isBatchLive(batch) && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          Live Now
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        batch.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                        batch.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar className="text-slate-400" />
                      {batch.startDate || 'TBD'} to {batch.endDate || 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiClock className="text-slate-400" />
                      {batch.startTime || 'TBD'} - {batch.endTime || 'TBD'}
                    </div>
                    <div className="text-sm">
                      Days: {batch.days?.length > 0 ? batch.days.join(', ') : 'TBD'}
                    </div>
                  </div>

                  {/* Zoom Link — Inline Input */}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <div className="mb-4 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-1.5 mb-2">
                        <FiVideo className="text-indigo-600" size={14} />
                        <span className="text-xs font-semibold text-slate-600">Zoom Link</span>
                        {batch.zoomLink && (
                          <>
                            <button
                              onClick={() => handleCopyLink(batch.zoomLink, batch._id)}
                              className="ml-auto p-1 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded transition-colors bg-transparent border-none cursor-pointer"
                              title="Copy link"
                            >
                              <FiCopy size={13} />
                            </button>
                            {copiedLink === batch._id && (
                              <span className="text-[10px] text-emerald-600 font-semibold">Copied!</span>
                            )}
                          </>
                        )}
                      </div>
                      <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                          <FiLink className="text-slate-400" size={13} />
                        </div>
                        <input
                          type="url"
                          value={zoomLinkInputs[batch._id] ?? ''}
                          onChange={(e) => {
                            setZoomLinkInputs(prev => ({ ...prev, [batch._id]: e.target.value }));
                            if (zoomStatus[batch._id] === 'empty') {
                              setZoomStatus(prev => ({ ...prev, [batch._id]: null }));
                            }
                          }}
                          placeholder="https://zoom.us/j/..."
                          className="w-full pl-7 pr-3 py-1.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-400 outline-none text-xs bg-white"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSaveZoomLink(batch, false)}
                          disabled={savingZoomBatch === batch._id}
                          className="flex-1 py-1.5 text-xs font-semibold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          Deactivate
                        </button>
                        <button
                          onClick={() => handleSaveZoomLink(batch, true)}
                          disabled={savingZoomBatch === batch._id}
                          className="flex-1 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-60"
                        >
                          {savingZoomBatch === batch._id ? 'Saving...' : 'Activate'}
                        </button>
                      </div>

                      {/* Status feedback after action */}
                      {zoomStatus[batch._id] === 'empty' && (
                        <div className="mt-2 flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                          <span className="text-[11px] font-bold">Please fill out the Zoom link field before activating or deactivating!</span>
                        </div>
                      )}
                      {zoomStatus[batch._id] === 'active' && (
                        <div className="mt-2 flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                          <span className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                          </span>
                          <span className="text-[11px] font-bold">Link is Active — students can see the Zoom link</span>
                        </div>
                      )}
                      {zoomStatus[batch._id] === 'inactive' && (
                        <div className="mt-2 flex items-center gap-1.5 text-slate-500 bg-slate-100 border border-slate-200 rounded-lg px-3 py-1.5">
                          <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0"></span>
                          <span className="text-[11px] font-bold">Link is Deactivated — hidden from students</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Assignments Section */}
                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <div className="border-t border-slate-100 pt-4 mt-auto">
                      <div className="flex items-center gap-2 mb-3">
                        <FiFileText className="text-indigo-600" size={16} />
                        <h4 className="text-sm font-bold text-slate-700">
                          Assignments
                          {batch.assignments?.length > 0 && (
                            <span className="ml-2 text-xs font-normal text-slate-400">({batch.assignments.length})</span>
                          )}
                        </h4>
                      </div>

                      {/* Existing assignments list */}
                      {batch.assignments?.length > 0 && (
                        <div className="space-y-2 mb-3 max-h-48 overflow-y-auto">
                          {batch.assignments.map((a: any) => (
                            <div key={a._id} className="flex items-start justify-between gap-2 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2.5 group">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-slate-700 font-medium leading-snug">{a.title}</p>
                                <p className="text-[10px] text-slate-400 mt-1">
                                  {new Date(a.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteAssignment(batch._id, a._id)}
                                className="p-1 text-slate-300 hover:text-rose-500 rounded opacity-0 group-hover:opacity-100 transition-all bg-transparent border-none cursor-pointer shrink-0"
                                title="Delete assignment"
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add assignment input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type assignment text..."
                          value={assignmentInputs[batch._id] || ''}
                          onChange={(e) => setAssignmentInputs(prev => ({ ...prev, [batch._id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddAssignment(batch._id);
                            }
                          }}
                          className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                        />
                        <button
                          onClick={() => handleAddAssignment(batch._id)}
                          disabled={!assignmentInputs[batch._id]?.trim() || savingAssignment === batch._id}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors border-none cursor-pointer flex items-center gap-1.5 ${
                            assignmentInputs[batch._id]?.trim()
                              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          }`}
                        >
                          <FiPlus size={14} />
                          {savingAssignment === batch._id ? 'Saving...' : 'Add'}
                        </button>
                      </div>
                    </div>
                  )}

                  {(user?.role === 'admin' || user?.role === 'teacher') && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-4">
                      <button 
                        onClick={() => openEditModal(batch)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                        title="Edit"
                      >
                        <FiEdit2 />
                      </button>
                      <button 
                        onClick={() => handleDelete(batch._id)}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                        title="Delete"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              
              {batches.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                  <p>No batches created for this course yet.</p>
                </div>
              )}
            </div>
          </>
        )}

      </div>


      {/* Batch Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-800">
                {editingBatch ? 'Edit Batch' : 'Create New Batch'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Name *</label>
                  <input required type="text" name="batchName" value={formData.batchName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Instructor</label>
                  <select name="instructor" value={formData.instructor} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="">Select Instructor...</option>
                    {teachers.map(teacher => (
                      <option key={teacher._id} value={teacher.name}>{teacher.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Image</label>
                  <div className="flex gap-4 items-center">
                    {formData.image && (
                      <img src={formData.image} alt="Thumbnail" className="w-12 h-12 rounded-lg object-cover" />
                    )}
                    <div className="flex-1">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                        className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                      />
                      {uploadingImage && <p className="text-sm text-indigo-600 mt-1">Uploading to Cloudinary...</p>}
                    </div>
                  </div>
                </div>
                
                <div className="hidden">
                  {/* Status is now computed automatically on the backend */}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                  <input type="date" name="startDate" value={formData.startDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                  <input type="date" name="endDate" value={formData.endDate} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Start Time</label>
                  <input type="time" name="startTime" value={formData.startTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">End Time</label>
                  <input type="time" name="endTime" value={formData.endTime} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity *</label>
                  <input required type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Fee Override (₹)</label>
                  <input type="number" name="batchFee" value={formData.batchFee} onChange={handleInputChange} placeholder="Leave blank to use course fee" className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Zoom Meeting Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiLink className="text-slate-400" size={14} />
                    </div>
                    <input 
                      type="url" 
                      name="zoomLink" 
                      value={formData.zoomLink} 
                      onChange={handleInputChange} 
                      placeholder="https://zoom.us/j/..." 
                      className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Paste the Zoom meeting link for this session. Update it before each class.</p>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-2">Days of the Week</label>
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                          formData.days.includes(day) 
                            ? 'bg-indigo-100 border-indigo-200 text-indigo-700 font-medium'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Class Session Report Modal */}
      {deactivateBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-[fadeIn_0.15s_ease-out]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-purple-900/5 via-indigo-900/5 to-purple-900/5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-2xl">
                  <FiVideo size={20} />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">Deactivate Session & Submit Report</h3>
                  <p className="text-xs text-slate-500 font-medium">Record session notes and end live class for students</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDeactivateBatchModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center border-none cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitDeactivationReport} className="p-6 md:p-8 space-y-5">
              {/* Batch & Time Metadata Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Course</span>
                  <span className="font-extrabold text-slate-800 truncate block">{course?.courseName || 'Art Course'}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Batch</span>
                  <span className="font-extrabold text-slate-800 truncate block">{deactivateBatchModal.batchName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Session Activated</span>
                  <span className="font-bold text-emerald-600">
                    {deactivateBatchModal.zoomActivatedAt 
                      ? new Date(deactivateBatchModal.zoomActivatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : 'Earlier Today'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 font-bold block mb-0.5">Deactivation Time</span>
                  <span className="font-bold text-rose-600">
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-700 uppercase tracking-wider mb-2">
                  Session Description / Class Summary <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={sessionReportDescription}
                  onChange={(e) => setSessionReportDescription(e.target.value)}
                  placeholder="What happened during this course and batch session? (e.g. Topics covered, student questions, exercises completed, next class preview)..."
                  className="w-full p-4 border border-slate-200 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-400 outline-none transition-all resize-none text-slate-800 font-medium"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeactivateBatchModal(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport || !sessionReportDescription.trim()}
                  className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors cursor-pointer shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {submittingReport ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Submitting Report...
                    </>
                  ) : (
                    'Submit Report & Deactivate'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
