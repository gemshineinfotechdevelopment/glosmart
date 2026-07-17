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

                  {/* Zoom Link Display / Add Prompt */}
                  {batch.zoomLink ? (
                    <div className="flex items-center gap-2 mb-4 p-3 bg-indigo-50 border border-indigo-100 rounded-lg">
                      <FiVideo className="text-indigo-600 shrink-0" size={16} />
                      <a
                        href={batch.zoomLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-indigo-600 hover:text-indigo-800 truncate flex-1 font-medium"
                        title={batch.zoomLink}
                      >
                        {batch.zoomLink.length > 45 ? batch.zoomLink.substring(0, 45) + '...' : batch.zoomLink}
                      </a>
                      <button
                        onClick={() => handleCopyLink(batch.zoomLink, batch._id)}
                        className="p-1.5 text-indigo-400 hover:text-indigo-700 hover:bg-indigo-100 rounded transition-colors bg-transparent border-none cursor-pointer shrink-0"
                        title="Copy link"
                      >
                        {copiedLink === batch._id ? <FiCopy className="text-emerald-600" size={14} /> : <FiCopy size={14} />}
                      </button>
                      {copiedLink === batch._id && (
                        <span className="text-xs text-emerald-600 font-medium">Copied!</span>
                      )}
                    </div>
                  ) : (
                    (user?.role === 'admin' || user?.role === 'teacher') && (
                      <div className="flex items-center justify-between gap-2 mb-4 p-3 bg-slate-50 border border-slate-200 border-dashed rounded-lg">
                        <div className="flex items-center gap-2 text-slate-550">
                          <FiVideo size={16} />
                          <span className="text-xs font-semibold">No Zoom link added yet</span>
                        </div>
                        <button
                          onClick={() => openEditModal(batch)}
                          className="px-2.5 py-1 text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold rounded transition-colors border-none cursor-pointer"
                        >
                          + Add Link
                        </button>
                      </div>
                    )
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

      {/* Modal Form */}
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

                <div className="hidden">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
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

    </div>
  );
}
