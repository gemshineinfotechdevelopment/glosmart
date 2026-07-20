import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

export default function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    courseName: '',
    skillLevels: ['Beginner'],
    maxStudents: 30,
    status: 'Active',
    description: '',
    thumbnailImage: ''
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: uploadData
      });
      const data = await res.json();
      if (res.ok) {
        setFormData(prev => ({ ...prev, thumbnailImage: data.imageUrl }));
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

  useEffect(() => {
    if (isEdit) {
      fetchCourse();
    }
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses/${id}`);
      const data = await res.json();
      setFormData({
        ...data,
        skillLevels: [data.skillLevel || 'Beginner'],
      });
    } catch (error) {
      console.error('Failed to fetch course', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox' && name === 'skillLevels') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        const newLevels = checked 
          ? [...prev.skillLevels, value]
          : prev.skillLevels.filter(lvl => lvl !== value);
        return { ...prev, skillLevels: newLevels };
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseFloat(value) || 0 : value
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.skillLevels.length === 0) {
      alert('Please select at least one skill level.');
      return;
    }
    setLoading(true);
    
    try {
      if (isEdit) {
        const payload = { ...formData, skillLevel: formData.skillLevels[0] };
        const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        if (response.ok) {
          navigate('/admin/courses');
        } else {
          alert('Failed to save course.');
        }
      } else {
        let allOk = true;
        for (const level of formData.skillLevels) {
          const payload = { 
            ...formData, 
            skillLevel: level, 
            courseName: formData.skillLevels.length > 1 ? `${formData.courseName} - ${level}` : formData.courseName
          };
          const res = await fetch(`${API_BASE_URL}/api/courses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          if (!res.ok) {
            allOk = false;
          }
        }
        
        if (allOk) {
          navigate('/admin/courses');
        } else {
          alert('Failed to save some courses.');
        }
      }
    } catch (error) {
      console.error('Save failed', error);
      alert('Error saving course.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/courses/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        navigate('/admin/courses');
      } else {
        alert('Failed to delete course.');
      }
    } catch (error) {
      console.error('Delete failed', error);
      alert('Error deleting course.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-6 md:mb-8">
            {isEdit ? 'Edit Course' : 'Create New Course'}
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Name *</label>
                <input 
                  required
                  type="text" 
                  name="courseName" 
                  value={formData.courseName} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">Skill Level (Select multiple to create separate courses)</label>
                <div className="flex gap-4">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <label key={level} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        name="skillLevels"
                        value={level}
                        checked={formData.skillLevels.includes(level)}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                      />
                      <span className="text-sm font-medium text-slate-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>



              <div className="hidden">
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Fee (₹)</label>
              </div>

              <div className="hidden">
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Students</label>
                <input 
                  type="number" 
                  name="maxStudents" 
                  value={formData.maxStudents} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Materials checkbox removed */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Course Image</label>
                <div className="flex gap-4 items-center">
                  {formData.thumbnailImage && (
                    <img src={formData.thumbnailImage} alt="Thumbnail" className="w-16 h-16 rounded-lg object-cover" />
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {uploadingImage && <p className="text-sm text-indigo-600 mt-1">Uploading to Cloudinary...</p>}
                  </div>
                </div>
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2 bg-red-50 text-red-600 font-medium rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 mr-auto"
                >
                  Delete Course
                </button>
              )}
              <button 
                type="button" 
                onClick={() => navigate('/admin/courses')}
                className="px-6 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Course' : 'Save Course')}
              </button>
            </div>
            
          </form>
      </div>
    </div>
  );
}
