import React, { useState, useEffect, useRef } from 'react';
import { 
  FiSearch, FiFilter, FiPlus, 
  FiEdit2, FiTrash2, FiMail, FiPhone, FiUpload
} from 'react-icons/fi';
import AdminSidebar from '../../components/admin/AdminSidebar';

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
    phone: '',
    subject: '',
    qualification: '',
    experience: '',
    status: 'Active',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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
      phone: '',
      subject: '',
      qualification: '',
      experience: '',
      status: 'Active',
    });
    setImageFile(null);
    setEditingTeacherId(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setFormData({
      name: teacher.name,
      email: teacher.email,
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
    if (imageFile) {
      data.append('image', imageFile);
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
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-5 py-2.5 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 transition-colors shadow-sm">
              <FiFilter size={16} /> Filter
            </button>
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
          {teachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-3xl p-7 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-slate-50/50 flex flex-col hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
              <div className="flex justify-between items-start mb-6">
                <img src={teacher.avatar || `https://i.pravatar.cc/150?u=${teacher._id}`} alt={teacher.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm" />
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
                    <div 
                      className="border-2 border-dashed border-slate-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <FiUpload className="text-slate-400 mb-2" size={24} />
                      <p className="text-sm font-medium text-slate-600">
                        {imageFile ? imageFile.name : 'Click to upload photo'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">JPEG, PNG, JPG allowed</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/jpg"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setImageFile(e.target.files[0]);
                        }
                      }}
                    />
                  </div>

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
    </div>
  );
};

export default Teachers;
