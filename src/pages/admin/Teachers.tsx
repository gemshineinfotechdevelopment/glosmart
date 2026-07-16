import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FiSearch, FiFilter, FiPlus, 
  FiEdit2, FiTrash2, FiMail, FiPhone, FiUpload, FiUser,
  FiZoomIn, FiZoomOut, FiAlertTriangle
} from 'react-icons/fi';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import AdminSidebar from '../../components/admin/AdminSidebar';

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'];

// ─── Helper: create cropped image blob ───────────────────────────────────────
async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = new Image();
  image.crossOrigin = 'anonymous';
  image.src = imageSrc;

  await new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = reject;
  });

  const canvas = document.createElement('canvas');
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext('2d')!;

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
    0, 0, pixelCrop.width, pixelCrop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.92);
  });
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: string;
  status: string;
  avatar: string;
}

const Teachers: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    subject: '',
    qualification: '',
    experience: '',
    status: 'Active',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!imageFile) {
      setShowCropper(false);
      setCroppedAreaPixels(null);
      if (editingTeacherId) {
        const editingTeacher = teachers.find(t => t._id === editingTeacherId);
        setPreviewUrl(editingTeacher?.avatar || null);
      } else {
        setPreviewUrl(null);
      }
      return;
    }
  }, [imageFile, editingTeacherId, teachers]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const errors: string[] = [];

      // Validate file type
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push('Format must be JPG, JPEG, or PNG.');
      }

      // Validate file size (1MB)
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the 1MB limit.`);
      }

      // If type/size already failed, reject immediately (no need to check dimensions)
      if (errors.length > 0 && !ALLOWED_TYPES.includes(file.type)) {
        setValidationError(`Image doesn't meet the requirements:\n• ${errors.join('\n• ')}`);
        e.target.value = '';
        return;
      }

      // Validate image dimensions (must be 1200×1600)
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        if (img.naturalWidth !== 1200 || img.naturalHeight !== 1600) {
          errors.push(`Dimensions must be 1200×1600px (yours: ${img.naturalWidth}×${img.naturalHeight}px).`);
        }

        URL.revokeObjectURL(url);

        if (errors.length > 0) {
          setValidationError(`Image doesn't meet the requirements:\n• ${errors.join('\n• ')}`);
          e.target.value = '';
          return;
        }

        // All checks passed — show the cropper
        setValidationError(null);
        setImageFile(file);
        const pUrl = URL.createObjectURL(file);
        setPreviewUrl(pUrl);
        setShowCropper(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setValidationError('Could not read the image file. Please try another image.');
        e.target.value = '';
      };
      img.src = url;
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/teachers');
      const data = await res.json();
      setTeachers(data);
    } catch (error) {
      console.error("Failed to fetch teachers", error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      subject: '',
      qualification: '',
      experience: '',
      status: 'Active',
    });
    setImageFile(null);
    setEditingTeacherId(null);
    setShowCropper(false);
    setCroppedAreaPixels(null);
    setValidationError(null);
  };

  const openAddModal = () => {
    resetForm();
    setFormData({
      name: '',
      email: '',
      password: 'teacher@glosmart', // Pre-populated temporary password
      phone: '',
      subject: '',
      qualification: '',
      experience: '',
      status: 'Active',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
      password: '', // Not editing password here
      phone: teacher.phone || '',
      subject: teacher.subject,
      qualification: teacher.qualification || '',
      experience: teacher.experience || '',
      status: teacher.status,
    });
    setEditingTeacherId(teacher._id);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this teacher?")) {
      try {
        const res = await fetch(`http://localhost:5000/api/teachers/${id}`, {
          method: 'DELETE'
        });
        if (res.ok) {
          fetchTeachers();
        }
      } catch (error) {
        console.error("Failed to delete teacher", error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('name', formData.name);
    data.append('email', formData.email);
    data.append('phone', formData.phone);
    data.append('subject', formData.subject);
    data.append('qualification', formData.qualification);
    data.append('experience', formData.experience);
    data.append('status', formData.status);
    if (!editingTeacherId) {
      data.append('password', formData.password);
    }

    if (imageFile) {
      if (croppedAreaPixels && previewUrl) {
        try {
          const croppedBlob = await getCroppedImg(previewUrl, croppedAreaPixels);
          data.append('image', croppedBlob, 'cropped-image.jpg');
        } catch (err) {
          console.error("Failed to crop image", err);
          data.append('image', imageFile);
        }
      } else {
        data.append('image', imageFile);
      }
    }

    try {
      const url = editingTeacherId 
        ? `http://localhost:5000/api/teachers/${editingTeacherId}` 
        : 'http://localhost:5000/api/teachers';
        
      const method = editingTeacherId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        body: data // Do not set Content-Type header when using FormData
      });
      
      if (res.ok) {
        setIsModalOpen(false);
        fetchTeachers();
      }
    } catch (error) {
      console.error("Failed to save teacher", error);
    }
  };

  const subjects = Array.from(new Set(teachers.map(t => t.subject).filter(Boolean)));

  const displayedTeachers = teachers.filter(teacher => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!teacher.name.toLowerCase().includes(q) && 
          !teacher.email.toLowerCase().includes(q) &&
          !(teacher.subject && teacher.subject.toLowerCase().includes(q))) {
        return false;
      }
    }
    
    if (subjectFilter && teacher.subject !== subjectFilter) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#fcfdff] font-sans text-slate-800">
      <AdminSidebar />
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Top bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
          <h1 className="text-[28px] font-bold text-[#1c1c28]">Teachers</h1>
          <div className="flex items-center gap-6 w-full md:w-auto">
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search Teachers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-100 placeholder:text-slate-400"
              />
            </div>
            <div className="w-px h-8 bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-[#1c1c28] leading-tight">Admin User</p>
                <p className="text-[10px] font-medium text-slate-500">Administrator</p>
              </div>
              <img 
                src="https://i.pravatar.cc/150?img=11" 
                alt="Admin Profile" 
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6">
          <div className="max-w-xl">
            <h2 className="text-3xl font-extrabold text-[#1c1c28] mb-2 tracking-tight">Teacher Management</h2>
            <p className="text-slate-500 font-medium text-[15px] leading-relaxed">
              Manage instructors, view their schedules, and add new teaching staff.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {showFilters ? (
              <div className="flex items-center gap-2">
                <select 
                  value={subjectFilter}
                  onChange={(e) => setSubjectFilter(e.target.value)}
                  className="bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="">All Subjects</option>
                  {subjects.map((sub, i) => (
                    <option key={i} value={sub}>{sub}</option>
                  ))}
                </select>
                <button 
                  onClick={() => { setShowFilters(false); setSubjectFilter(''); }}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors cursor-pointer border-none"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
              >
                <FiFilter size={16} /> Filter
              </button>
            )}
            <button 
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#6247df] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-purple-200 hover:bg-[#5035c9] transition-colors h-full"
            >
              <FiPlus size={16} /> <span className="leading-tight">Add<br/>New Teacher</span>
            </button>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayedTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-start mb-6">
                {teacher.avatar ? (
                  <img src={teacher.avatar} alt={teacher.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 border border-slate-100 shadow-sm">
                    <FiUser size={28} />
                  </div>
                )}
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${teacher.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'Active' ? 'bg-green-600' : 'bg-slate-400'}`}></span> {teacher.status || 'Active'}
                </span>
              </div>
              <h3 className="text-xl font-extrabold text-[#1c1c28] mb-1">{teacher.name}</h3>
              <p className="text-[#6247df] font-bold text-sm mb-4">{teacher.subject}</p>
              <div className="space-y-2 mb-6 text-sm text-slate-500 font-medium">
                <div className="flex items-center gap-2"><FiMail size={16} className="text-slate-400" /> {teacher.email}</div>
                <div className="flex items-center gap-2"><FiPhone size={16} className="text-slate-400" /> {teacher.phone || 'N/A'}</div>
              </div>
              <div className="mt-auto pt-5 border-t border-slate-100 flex justify-between items-center">
                <div className="text-xs font-bold text-slate-400">Exp: {teacher.experience || 'New'}</div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(teacher)}
                    className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button 
                    onClick={() => handleDelete(teacher._id)}
                    className="w-8 h-8 rounded-full bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Add/Edit Teacher Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-extrabold text-[#1c1c28]">
                    {editingTeacherId ? 'Edit Teacher' : 'Add New Teacher'}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
                    ✕
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col gap-2 mb-4">
                    <label className="block text-sm font-bold text-slate-700">Teacher Photo</label>
                    <input 
                      type="file" 
                      accept=".jpg,.jpeg,.png"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    {showCropper && previewUrl ? (
                      <div className="flex flex-col gap-3">
                        {/* Cropper area */}
                        <div className="relative w-full h-56 bg-slate-900 rounded-xl overflow-hidden">
                          <Cropper
                            image={previewUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4}
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                          />
                        </div>

                        {/* Zoom controls */}
                        <div className="flex items-center gap-3 px-1">
                          <FiZoomOut size={16} className="text-slate-400" />
                          <input
                            type="range"
                            min={1}
                            max={3}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 accent-[#6247df]"
                          />
                          <FiZoomIn size={16} className="text-slate-400" />
                          <button
                            type="button"
                            onClick={() => {
                              setShowCropper(false);
                              setPreviewUrl(null);
                              setImageFile(null);
                              setCroppedAreaPixels(null);
                              setValidationError(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="text-xs font-bold text-slate-500 hover:text-red-500 ml-2"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div 
                        className="border-2 border-dashed border-slate-300 rounded-xl p-5 flex flex-col sm:flex-row items-center gap-5 hover:bg-slate-50 transition-colors cursor-pointer"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        {previewUrl ? (
                          <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-slate-200 shadow-sm shrink-0 bg-slate-50">
                            <img 
                              src={previewUrl} 
                              alt="Teacher Preview" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div 
                            className="w-24 h-24 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-slate-400 shrink-0"
                          >
                            <FiUser size={32} />
                          </div>
                        )}
                        
                        <div className="flex-1 text-center sm:text-left min-w-0">
                          <p className="text-sm font-bold text-slate-700 leading-normal truncate max-w-[280px] mx-auto sm:mx-0">
                            {imageFile ? imageFile.name : (editingTeacherId && previewUrl ? 'Current Avatar' : 'No photo selected')}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">JPG, JPEG or PNG only (MAX. 1MB · 1200×1600px)</p>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-colors"
                          >
                            <FiUpload size={14} /> {previewUrl ? 'Change Photo' : 'Upload Photo'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Validation warning — shown below the file picker */}
                  {validationError && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl animate-[shake_0.4s_ease-in-out]">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
                          <FiAlertTriangle size={18} className="text-amber-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="text-sm font-extrabold text-amber-800 mb-1.5">Image doesn't meet the requirements</h4>
                          <ul className="space-y-1">
                            {validationError.split('\n').filter(line => line.startsWith('•')).map((line, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-amber-700 font-medium">
                                <span className="text-amber-500 mt-0.5">✕</span>
                                <span>{line.replace('• ', '')}</span>
                              </li>
                            ))}
                            {!validationError.includes('•') && (
                              <li className="text-sm text-amber-700 font-medium">{validationError}</li>
                            )}
                          </ul>
                          <p className="text-xs text-amber-500 font-semibold mt-2.5">Required: JPG/JPEG/PNG · Max 1MB · 1200×1600px</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="john@example.com"
                      />
                    </div>
                    {!editingTeacherId && (
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Temporary Password</label>
                        <input 
                          required
                          type="text" 
                          value={formData.password}
                          onChange={e => setFormData({...formData, password: e.target.value})}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                          placeholder="Enter temporary password"
                        />
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Phone Number</label>
                      <input 
                        type="text" 
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="+1 234 567 890"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Subject</label>
                      <input 
                        required
                        type="text" 
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="E.g. Digital Art"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Qualification</label>
                      <input 
                        type="text" 
                        value={formData.qualification}
                        onChange={e => setFormData({...formData, qualification: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="E.g. MFA Fine Arts"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">Experience</label>
                      <input 
                        type="text" 
                        value={formData.experience}
                        onChange={e => setFormData({...formData, experience: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#6247df] focus:border-transparent transition-all"
                        placeholder="E.g. 5 Years"
                      />
                    </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      type="button" 
                      onClick={() => setIsModalOpen(false)}
                      className="px-6 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-3 rounded-xl font-bold text-white bg-[#6247df] hover:bg-[#5035c9] shadow-lg shadow-purple-200 transition-colors"
                    >
                      {editingTeacherId ? 'Save Changes' : 'Save Teacher'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(5px); }
          45% { transform: translateX(-4px); }
          60% { transform: translateX(3px); }
          75% { transform: translateX(-2px); }
        }
      `}</style>
    </div>
  );
};

export default Teachers;
