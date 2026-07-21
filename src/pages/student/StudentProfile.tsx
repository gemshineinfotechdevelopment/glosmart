import React, { useState, useEffect } from 'react';
import StudentSidebar from '../../components/student/StudentSidebar';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { FiEdit2, FiX, FiCheck, FiCheckCircle, FiUser } from 'react-icons/fi';

interface ProfileData {
  name: string;
  studentId: string;
  grade: string;
  age: string;
  parent: string;
  contact: string;
  joined: string;
  avatar: string;
  gender: string;
}

const StudentProfile: React.FC = () => {
  const { user } = useAuth();

  // State for student details
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Student User',
    studentId: 'GS-2024-8832',
    grade: '5th Grade',
    age: '10 yrs',
    parent: 'Michael Jenkins',
    contact: '+1 (555) 012-3456',
    joined: 'Jan 12, 2024',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    gender: 'Male'
  });

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editParent, setEditParent] = useState(profile.parent);
  const [editContact, setEditContact] = useState(profile.contact);
  const [editAge, setEditAge] = useState(profile.age);
  const [editGrade, setEditGrade] = useState(profile.grade);
  const [editGender, setEditGender] = useState(profile.gender);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Student data on mount
  useEffect(() => {
    const profileId = user?.profileId || 'first';
    fetch(`${API_BASE_URL}/api/students/${profileId}`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          const loadedProfile = {
            name: data.name || 'Student User',
            studentId: data._id,
            grade: data.grade || '5th Grade',
            age: data.age || '10 yrs',
            parent: data.parent || 'Michael Jenkins',
            contact: data.phone || '+1 (555) 012-3456',
            joined: data.joiningDate || 'Jan 12, 2024',
            avatar: data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            gender: data.gender || 'Male'
          };
          setProfile(loadedProfile);
          setEditName(loadedProfile.name);
          setEditParent(loadedProfile.parent);
          setEditContact(loadedProfile.contact);
          setEditAge(loadedProfile.age);
          setEditGrade(loadedProfile.grade);
          setEditGender(loadedProfile.gender);
        }
      })
      .catch(err => console.error('Error fetching profile:', err));
  }, [user]);

  // Handle Edit Submit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedFields = {
      name: editName,
      parent: editParent,
      phone: editContact,
      age: editAge,
      grade: editGrade,
      gender: editGender
    };

    fetch(`${API_BASE_URL}/api/students/${profile.studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    })
      .then(res => {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Failed to update student profile');
      })
      .then(data => {
        setProfile({
          ...profile,
          name: data.name,
          parent: data.parent || 'Michael Jenkins',
          contact: data.phone || '+1 (555) 012-3456',
          age: data.age || '10 yrs',
          grade: data.grade || '5th Grade',
          gender: data.gender || 'Male'
        });
        setIsEditModalOpen(false);

        // Show Toast
        setToastMessage('Profile details updated successfully!');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      })
      .catch(err => {
        console.error('Error updating profile:', err);
        setToastMessage('Failed to update profile.');
        setShowToast(true);
        setTimeout(() => setShowToast(false), 4000);
      });
  };



  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F9FAFB] w-full font-sans">
      <StudentSidebar />
      
      <main className="flex-1 flex flex-col min-h-screen relative w-full min-w-0">
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
            <div className="p-1 bg-[#4700b3] text-white rounded-full">
              <FiCheckCircle size={16} />
            </div>
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-8">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Student Profile</h1>
            <p className="text-[#6B7280] text-[13px] sm:text-[15px] mt-1">View and manage your academic profile</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#111827] leading-none">{profile.name}</p>
              <p className="text-xs text-[#6B7280] mt-1">Student • {profile.grade}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
              <FiUser size={20} />
            </div>
          </div>
        </div>

        {/* Profile Card Container */}
        <div className="flex-1 flex items-start justify-center mt-2 px-6">
          <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-10 w-full max-w-[680px] border border-slate-100/50 flex flex-col items-center">
            
            {/* Profile Icon Section */}
            <div className="relative mb-6">
              <div className="w-[170px] h-[170px] rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center shadow-inner font-bold text-[72px]">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div className="absolute bottom-2 right-2 bg-[#4ade80] text-[#064e3b] text-[11px] font-bold px-4 py-1.5 rounded-full border-[3px] border-white uppercase tracking-wider shadow-sm">
                Active
              </div>
            </div>

            {/* Name & ID */}
            <h2 className="text-[32px] font-bold text-[#111827] mb-2 tracking-tight">{profile.name}</h2>
            <p className="text-[#6B7280] text-[15px] mb-10">Student ID: {profile.studentId}</p>

            {/* Info Grid */}
            <div className="w-full border-y border-slate-100 py-8 mb-8">
              <div className="grid grid-cols-2 gap-y-8 gap-x-6 px-4 text-left">
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Age / Grade</p>
                  <p className="font-bold text-[#111827] text-base">{profile.age} / {profile.grade}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Gender</p>
                  <p className="font-bold text-[#111827] text-base">{profile.gender}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Parent</p>
                  <p className="font-bold text-[#111827] text-base">{profile.parent}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Contact</p>
                  <p className="font-bold text-[#111827] text-base">{profile.contact}</p>
                </div>
                <div className="flex flex-col space-y-2">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Joined</p>
                  <p className="font-bold text-[#111827] text-base">{profile.joined}</p>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="w-full">
              <button 
                onClick={() => {
                  setEditName(profile.name);
                  setEditParent(profile.parent);
                  setEditContact(profile.contact);
                  setEditAge(profile.age);
                  setEditGrade(profile.grade);
                  setEditGender(profile.gender);
                  setIsEditModalOpen(true);
                }}
                className="w-full bg-[#4700b3] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d0099] transition-colors border-none cursor-pointer shadow-md shadow-purple-900/10"
              >
                <FiEdit2 size={18} /> Edit Profile
              </button>
            </div>
            
          </div>
        </div>

        {/* Footer Text */}
        <div className="text-center pb-6 pt-10 mt-auto">
          <p className="text-[13px] font-medium text-[#9CA3AF]">
            © 2024 GloSmart Art Academy. Cultivating Creativity Daily.
          </p>
        </div>

        {/* Modal: Edit Profile Details */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[500px] overflow-hidden border border-slate-100">
              
              {/* Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiEdit2 size={18} />
                  <h3 className="text-lg font-extrabold tracking-tight">Edit Profile Details</h3>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="p-6 space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Student Name</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Age</label>
                    <input 
                      type="text" 
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Grade</label>
                    <input 
                      type="text" 
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Parent / Guardian Name</label>
                  <input 
                    type="text" 
                    value={editParent}
                    onChange={(e) => setEditParent(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Contact Number</label>
                  <input 
                    type="text" 
                    value={editContact}
                    onChange={(e) => setEditContact(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Gender</label>
                  <select 
                    value={editGender}
                    onChange={(e) => setEditGender(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3.5 rounded-2xl font-bold transition-colors border-none cursor-pointer text-sm"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#4700b3] hover:bg-[#3d0099] text-white py-3.5 rounded-2xl font-bold transition-all border-none cursor-pointer flex items-center justify-center gap-1.5 text-sm shadow-md"
                  >
                    <FiCheck size={16} /> Save Changes
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default StudentProfile;
