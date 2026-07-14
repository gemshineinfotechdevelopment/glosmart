import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiArrowLeft, FiEdit2, FiTrash2, FiUsers, FiClock, FiCalendar } from 'react-icons/fi';
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
    image: ''
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
      image: ''
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
      image: batch.image || ''
    });
    setShowModal(true);
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
                <p className="text-slate-500 mt-1">Manage schedules, instructors, and capacities.</p>
              </div>
              {user?.role === 'admin' && (
                <button 
                  onClick={() => { resetForm(); setEditingBatch(null); setShowModal(true); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <FiPlus /> Create Batch
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {batches.map(batch => (
                <div key={batch._id} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col">
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
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      batch.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                      batch.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {batch.status}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiCalendar className="text-slate-400" />
                      {batch.startDate || 'TBD'} to {batch.endDate || 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiClock className="text-slate-400" />
                      {batch.startTime || 'TBD'} - {batch.endTime || 'TBD'}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <FiUsers className="text-slate-400" />
                      Enrolled: {batch.enrolledStudents}/{batch.capacity}
                    </div>
                    <div className="text-sm">
                      Days: {batch.days?.length > 0 ? batch.days.join(', ') : 'TBD'}
                    </div>
                    
                    {batch.availableSeats === 0 ? (
                      <div className="text-sm font-medium text-rose-600 bg-rose-50 px-3 py-2 rounded">
                        Batch Full (Enrollments Disabled)
                      </div>
                    ) : (
                      <div className="text-sm font-medium text-emerald-600 bg-emerald-50 px-3 py-2 rounded">
                        {batch.availableSeats} Seats Available
                      </div>
                    )}
                  </div>

                  {user?.role === 'admin' && (
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 mt-auto">
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

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Max Capacity</label>
                  <input type="number" name="capacity" value={formData.capacity} onChange={handleInputChange} min="1" className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Batch Fee Override (₹)</label>
                  <input type="number" name="batchFee" value={formData.batchFee} onChange={handleInputChange} placeholder="Leave blank to use course fee" className="w-full px-3 py-2 border border-slate-200 rounded focus:ring-2 focus:ring-indigo-500 outline-none" />
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
