import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { API_BASE_URL } from '../../config/api';

const AVAILABLE_AGE_GROUPS = [
  { id: 'Pre-Junior', label: 'Pre-Junior (4–6 yrs)' },
  { id: 'Junior', label: 'Junior (7–9 yrs)' },
  { id: 'Senior', label: 'Senior (10–12 yrs)' },
  { id: 'Special', label: 'Special (12+ yrs)' },
  { id: 'All Ages', label: 'All Ages (Open)' }
];

const DRAWING_CATEGORIES = [
  'General Drawing',
  'Coloring & Shapes',
  'Cartoon & Character Drawing',
  'Object & Nature Drawing',
  'Portrait & Human Anatomy',
  'Realistic & Still Life',
  'Digital Art & Illustration',
  'Advanced Shading & Perspective',
  'Sculpture & 3D Clay',
  'Oil & Acrylic Painting'
];

export default function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    courseName: '',
    skillLevels: ['Beginner'],
    targetAgeGroups: ['All Ages'],
    minAge: 4,
    maxAge: 99,
    drawingCategory: 'General Drawing',
    duration: '8 Weeks',
    lessonsCount: 16,
    price: '₹3,999',
    rating: 4.8,
    instructor: 'GloSmart Faculty',
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
        targetAgeGroups: data.targetAgeGroups && data.targetAgeGroups.length > 0 ? data.targetAgeGroups : ['All Ages'],
        minAge: data.minAge || 4,
        maxAge: data.maxAge || 99,
        drawingCategory: data.drawingCategory || 'General Drawing',
        duration: data.duration || '8 Weeks',
        lessonsCount: data.lessonsCount || 16,
        price: data.price || '₹3,999',
        instructor: data.instructor || 'GloSmart Faculty'
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
    } else if (type === 'checkbox' && name === 'targetAgeGroups') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => {
        let newGroups = checked
          ? [...prev.targetAgeGroups, value]
          : prev.targetAgeGroups.filter(g => g !== value);
        if (newGroups.length === 0) newGroups = ['All Ages'];
        return { ...prev, targetAgeGroups: newGroups };
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
        const payload = { 
          ...formData, 
          skillLevel: formData.skillLevels[0],
          difficulty: formData.skillLevels[0]
        };
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
            difficulty: level,
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
            {isEdit ? 'Edit Course Configuration' : 'Create New Drawing Course'}
          </h1>
          
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Course Name */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Name *</label>
                <input 
                  required
                  type="text" 
                  name="courseName" 
                  value={formData.courseName} 
                  onChange={handleChange}
                  placeholder="e.g. Creative Cartoon & Character Drawing"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Target Age Groups (Multi-select) */}
              <div className="col-span-2 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                <label className="block text-sm font-bold text-purple-900 mb-2">
                  Target Age Groups (Recommendation Engine Target) *
                </label>
                <p className="text-xs text-purple-600 mb-3">Select single or multiple age groups that this course is tailored for.</p>
                <div className="flex flex-wrap gap-3">
                  {AVAILABLE_AGE_GROUPS.map(ag => (
                    <label key={ag.id} className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-purple-200 text-xs font-semibold hover:border-purple-400 transition-colors shadow-2xs">
                      <input
                        type="checkbox"
                        name="targetAgeGroups"
                        value={ag.id}
                        checked={formData.targetAgeGroups.includes(ag.id)}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-600 rounded border-slate-300"
                      />
                      <span className="text-slate-700">{ag.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Drawing Category */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Drawing Category</label>
                <select 
                  name="drawingCategory" 
                  value={formData.drawingCategory} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                >
                  {DRAWING_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Skill Levels */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Skill Level</label>
                <div className="flex gap-3 pt-1">
                  {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                    <label key={level} className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                      <input
                        type="checkbox"
                        name="skillLevels"
                        value={level}
                        checked={formData.skillLevels.includes(level)}
                        onChange={handleChange}
                        className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                      />
                      <span className="text-slate-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Min & Max Age */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Min Age (Years)</label>
                <input 
                  type="number" 
                  name="minAge" 
                  value={formData.minAge} 
                  onChange={handleChange}
                  min={1}
                  max={99}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Max Age (Years)</label>
                <input 
                  type="number" 
                  name="maxAge" 
                  value={formData.maxAge} 
                  onChange={handleChange}
                  min={1}
                  max={99}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Duration & Lessons Count */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Duration</label>
                <input 
                  type="text" 
                  name="duration" 
                  value={formData.duration} 
                  onChange={handleChange}
                  placeholder="e.g. 8 Weeks / 2 Months"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Lessons Count</label>
                <input 
                  type="number" 
                  name="lessonsCount" 
                  value={formData.lessonsCount} 
                  onChange={handleChange}
                  min={1}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Price & Instructor */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Price</label>
                <input 
                  type="text" 
                  name="price" 
                  value={formData.price} 
                  onChange={handleChange}
                  placeholder="e.g. ₹3,999"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Instructor</label>
                <input 
                  type="text" 
                  name="instructor" 
                  value={formData.instructor} 
                  onChange={handleChange}
                  placeholder="e.g. Sophia Reed"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold"
                >
                  <option value="Active">Active (Visible & Purchasable)</option>
                  <option value="Inactive">Inactive (Hidden)</option>
                </select>
              </div>

              {/* Course Thumbnail Image */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Course Thumbnail Image</label>
                <div className="flex gap-4 items-center">
                  {formData.thumbnailImage && (
                    <img src={formData.thumbnailImage} alt="Thumbnail" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
                  )}
                  <div className="flex-1">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                    {uploadingImage && <p className="text-xs text-indigo-600 mt-1">Uploading image...</p>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="col-span-2">
                <label className="block text-sm font-bold text-slate-700 mb-1">Description & Learning Outcomes</label>
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the skills and drawing topics covered in this course..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

            </div>

            <div className="pt-6 border-t border-slate-200 flex justify-end gap-4">
              {isEdit && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="px-6 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl hover:bg-red-100 transition-colors disabled:opacity-50 mr-auto border-none cursor-pointer"
                >
                  Delete Course
                </button>
              )}
              <button 
                type="button" 
                onClick={() => navigate('/admin/courses')}
                className="px-6 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-100 rounded-xl transition-colors border-none cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className="px-6 py-2.5 bg-[#4700b3] text-white font-bold text-sm rounded-xl hover:bg-[#3d0099] transition-colors disabled:opacity-50 border-none cursor-pointer shadow-md shadow-purple-900/10"
              >
                {loading ? 'Saving...' : (isEdit ? 'Update Course' : 'Save Course')}
              </button>
            </div>
            
          </form>
      </div>
    </div>
  );
}
