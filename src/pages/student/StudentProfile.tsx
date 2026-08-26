import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import { FiEdit2, FiX, FiCheck, FiCheckCircle, FiUser, FiCalendar, FiAward, FiStar, FiHeart, FiTarget } from 'react-icons/fi';

const INTEREST_OPTIONS = [
  'Basic drawing',
  'Lines and shapes',
  'Coloring',
  'Simple objects',
  'Drawing fundamentals',
  'Object drawing',
  'Nature drawing',
  'Cartoon drawing',
  'Character drawing',
  'Shading',
  'Perspective',
  'Landscape drawing',
  'Still life',
  'Portrait drawing',
  'Realistic drawing',
  'Digital art',
  'Anatomy',
  'Sculpture & 3D Clay',
  'Oil painting'
];

const LEARNING_GOALS_OPTIONS = [
  'Fun & Creative Expression',
  'Master Drawing Fundamentals',
  'Art Competitions & Exhibitions',
  'Digital Illustration Skills',
  'Professional Art Foundation'
];

export const calculateAgeFromDOB = (dobString?: string): { age: number | null; ageGroup: string } => {
  if (!dobString) return { age: null, ageGroup: 'All Ages' };
  const birthDate = new Date(dobString);
  if (isNaN(birthDate.getTime())) return { age: null, ageGroup: 'All Ages' };

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  age = age >= 0 ? age : 0;

  let ageGroup = 'All Ages';
  if (age <= 6) ageGroup = 'Pre-Junior';
  else if (age >= 7 && age <= 9) ageGroup = 'Junior';
  else if (age >= 10 && age <= 12) ageGroup = 'Senior';
  else ageGroup = 'Special';

  return { age, ageGroup };
};

interface ProfileData {
  name: string;
  email: string;
  studentId: string;
  dob: string;
  age: number | null;
  ageGroup: string;
  grade: string;
  parent: string;
  contact: string;
  address: string;
  gender: string;
  drawingExperience: string;
  skillLevel: string;
  interests: string[];
  learningGoals: string[];
  joined: string;
  avatar: string;
  isProfileComplete: boolean;
}

const StudentProfile: React.FC = () => {
  const { user, updateUserData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const isFirstTime = queryParams.get('firstTime') === 'true' || (user?.role === 'student' && user?.isProfileComplete === false);

  // State for student details
  const [profile, setProfile] = useState<ProfileData>({
    name: user?.name || '',
    email: user?.email || '',
    studentId: user?.profileId || '',
    dob: '',
    age: null,
    ageGroup: 'All Ages',
    grade: '',
    parent: '',
    contact: '',
    address: '',
    gender: 'Select Gender',
    drawingExperience: 'Beginner',
    skillLevel: 'Beginner',
    interests: ['Basic drawing', 'Coloring'],
    learningGoals: ['Fun & Creative Expression'],
    joined: '',
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
    isProfileComplete: false
  });

  const [loading, setLoading] = useState(true);

  // Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editDob, setEditDob] = useState('');
  const [editGrade, setEditGrade] = useState('');
  const [editParent, setEditParent] = useState('');
  const [editContact, setEditContact] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editDrawingExperience, setEditDrawingExperience] = useState('Beginner');
  const [editSkillLevel, setEditSkillLevel] = useState('Beginner');
  const [editInterests, setEditInterests] = useState<string[]>(['Basic drawing', 'Coloring']);
  const [editLearningGoals, setEditLearningGoals] = useState<string[]>(['Fun & Creative Expression']);

  // Dynamic preview for modal age calculation
  const calculatedModalAge = calculateAgeFromDOB(editDob);

  // Toast State
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Fetch Student data on mount
  useEffect(() => {
    const profileId = user?.profileId;
    if (!profileId) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE_URL}/api/students/${profileId}`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch student data');
        return res.json();
      })
      .then(data => {
        if (data) {
          const { age, ageGroup } = calculateAgeFromDOB(data.dob || '');
          const fallbackAge = age !== null ? age : (data.age ? parseInt(data.age, 10) : null);

          const loadedProfile: ProfileData = {
            name: data.name || user?.name || 'Student User',
            email: data.email || user?.email || '',
            studentId: data._id || profileId,
            dob: data.dob || '',
            age: fallbackAge,
            ageGroup: ageGroup,
            grade: data.grade || '',
            parent: data.parent || '',
            contact: data.phone || '',
            address: data.address || '',
            gender: data.gender || 'Male',
            drawingExperience: data.drawingExperience || 'Beginner',
            skillLevel: data.skillLevel || 'Beginner',
            interests: Array.isArray(data.interests) && data.interests.length > 0 ? data.interests : ['Basic drawing', 'Coloring'],
            learningGoals: Array.isArray(data.learningGoals) && data.learningGoals.length > 0 ? data.learningGoals : ['Fun & Creative Expression'],
            joined: data.joiningDate || data.admissionDate || new Date(data.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            avatar: data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80',
            isProfileComplete: data.isProfileComplete === true
          };

          setProfile(loadedProfile);
          setEditName(loadedProfile.name);
          setEditEmail(loadedProfile.email);
          setEditDob(loadedProfile.dob);
          setEditGrade(loadedProfile.grade);
          setEditParent(loadedProfile.parent);
          setEditContact(loadedProfile.contact);
          setEditAddress(loadedProfile.address);
          setEditGender(loadedProfile.gender || 'Male');
          setEditDrawingExperience(loadedProfile.drawingExperience);
          setEditSkillLevel(loadedProfile.skillLevel);
          setEditInterests(loadedProfile.interests);
          setEditLearningGoals(loadedProfile.learningGoals);

          // If profile is incomplete or first time login, auto-open the form
          if (!loadedProfile.isProfileComplete || isFirstTime) {
            setIsEditModalOpen(true);
          }
        }
      })
      .catch(err => {
        console.error('Error fetching profile:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, isFirstTime]);

  const toggleInterest = (interest: string) => {
    setEditInterests(prev => 
      prev.includes(interest) ? prev.filter(i => i !== interest) : [...prev, interest]
    );
  };

  const toggleGoal = (goal: string) => {
    setEditLearningGoals(prev => 
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  // Handle Edit Submit
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    const studentIdToUpdate = profile.studentId || user?.profileId;
    if (!studentIdToUpdate) {
      setToastMessage('Error: Student profile ID not found.');
      setShowToast(true);
      return;
    }

    const { age: dynamicAge, ageGroup: dynamicAgeGroup } = calculateAgeFromDOB(editDob);

    const updatedFields = {
      name: editName.trim(),
      dob: editDob,
      age: dynamicAge !== null ? dynamicAge.toString() : '',
      grade: editGrade.trim(),
      parent: editParent.trim(),
      phone: editContact.trim(),
      address: editAddress.trim(),
      gender: editGender,
      drawingExperience: editDrawingExperience,
      skillLevel: editSkillLevel,
      interests: editInterests,
      learningGoals: editLearningGoals,
      isProfileComplete: true
    };

    fetch(`${API_BASE_URL}/api/students/${studentIdToUpdate}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedFields)
    })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Failed to update student profile');
      })
      .then(data => {
        const newProfile: ProfileData = {
          ...profile,
          name: data.name,
          dob: data.dob || editDob,
          age: dynamicAge,
          ageGroup: dynamicAgeGroup,
          grade: data.grade || '',
          parent: data.parent || '',
          contact: data.phone || '',
          address: data.address || '',
          gender: data.gender || 'Male',
          drawingExperience: data.drawingExperience || 'Beginner',
          skillLevel: data.skillLevel || 'Beginner',
          interests: data.interests || editInterests,
          learningGoals: data.learningGoals || editLearningGoals,
          isProfileComplete: true
        };

        setProfile(newProfile);
        setIsEditModalOpen(false);

        // Update AuthContext & localStorage state
        updateUserData({
          name: data.name,
          isProfileComplete: true
        });

        // Clean up firstTime search param if present
        if (queryParams.has('firstTime')) {
          navigate('/student/profile', { replace: true });
        }

        // Show Toast
        setToastMessage('Personalized profile saved! Course recommendations updated.');
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

  const getAgeGroupBadgeColor = (group: string) => {
    switch (group) {
      case 'Pre-Junior':
        return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'Junior':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Senior':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Special':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4700b3]"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative w-full min-w-0">
        
        {/* Toast Notification */}
        {showToast && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white px-5 py-4 rounded-2xl shadow-2xl z-50 flex items-center gap-3 border border-slate-700/50 animate-bounce">
            <div className="p-1 bg-[#4700b3] text-white rounded-full">
              <FiCheckCircle size={18} />
            </div>
            <span className="font-semibold text-sm">{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-8 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#111827]">Student Profile & Learning Preferences</h1>
            <p className="text-[#6B7280] text-[13px] sm:text-[15px] mt-1">Configure your age, interests, and skills for personalized course recommendations</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#111827] leading-none">{profile.name || 'Student User'}</p>
              <p className="text-xs text-[#6B7280] mt-1">
                {profile.age !== null ? `${profile.age} yrs • ` : ''}{profile.ageGroup}
              </p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center shadow-sm border border-slate-200 shrink-0">
              <FiUser size={20} />
            </div>
          </div>
        </div>

        {/* Welcome / Incomplete Profile Notice Banner */}
        {(!profile.isProfileComplete || isFirstTime) && (
          <div className="mx-6 sm:mx-10 mt-6 bg-gradient-to-r from-[#f0e8ff] via-[#fae8ff] to-[#fce7f3] border border-[#d8b4fe] p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-[#4700b3] text-white flex items-center justify-center shrink-0 shadow-md">
                <FiStar size={22} className="animate-spin-slow" />
              </div>
              <div>
                <h3 className="text-[#4700b3] font-extrabold text-base">Complete Your Artist Profile</h3>
                <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                  Enter your Date of Birth and drawing interests to unlock personalized course recommendations!
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-[#4700b3] hover:bg-[#3d0099] text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer border-none shrink-0"
            >
              Fill Profile & Interests
            </button>
          </div>
        )}

        {/* Profile Card Container */}
        <div className="flex-1 flex items-start justify-center mt-6 px-4 sm:px-6 pb-12">
          <div className="bg-white rounded-[2rem] shadow-[0_4px_30px_rgba(0,0,0,0.03)] p-6 sm:p-10 w-full max-w-[800px] border border-slate-100/50 flex flex-col items-center">
            
            {/* Avatar & Age Group Badge */}
            <div className="relative mb-6">
              <div className="w-[130px] h-[130px] sm:w-[160px] sm:h-[160px] rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center shadow-inner font-bold text-[52px] sm:text-[68px]">
                {(profile.name || 'S').charAt(0).toUpperCase()}
              </div>
              <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-[11px] font-extrabold px-3 py-1 rounded-full border-2 border-white uppercase tracking-wider shadow-sm ${getAgeGroupBadgeColor(profile.ageGroup)}`}>
                {profile.ageGroup} {profile.age !== null ? `(${profile.age} Yrs)` : ''}
              </div>
            </div>

            {/* Name & ID */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#111827] mt-2 mb-1 tracking-tight text-center">
              {profile.name || 'Student User'}
            </h2>
            <p className="text-[#6B7280] text-xs sm:text-sm mb-6 font-mono">
              Account: {profile.email} • ID: {profile.studentId || 'N/A'}
            </p>

            {/* Recommendations Badge Highlights */}
            <div className="w-full bg-gradient-to-r from-purple-50 via-pink-50 to-blue-50 border border-purple-100 rounded-2xl p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <FiAward className="text-[#4700b3]" size={18} />
                <h4 className="text-sm font-extrabold text-[#4700b3] uppercase tracking-wider">Recommendation Profile Summary</h4>
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left mb-4">
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Age Group</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.ageGroup}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Calculated Age</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.age !== null ? `${profile.age} Years` : 'DOB Needed'}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Skill Level</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.skillLevel}</p>
                </div>
                <div className="bg-white/80 backdrop-blur-xs p-3 rounded-xl border border-purple-100/60">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Experience</span>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{profile.drawingExperience}</p>
                </div>
              </div>

              {/* Selected Interests Tags */}
              <div className="text-left">
                <span className="text-xs font-bold text-slate-600 block mb-2 flex items-center gap-1.5">
                  <FiHeart className="text-pink-500" size={13} /> Active Drawing Interests ({profile.interests.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map(interest => (
                    <span key={interest} className="bg-white text-purple-900 border border-purple-200 px-3 py-1 rounded-full text-xs font-bold shadow-2xs">
                      🎨 {interest}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Learning Goals */}
              {profile.learningGoals && profile.learningGoals.length > 0 && (
                <div className="text-left mt-3 pt-3 border-t border-purple-100">
                  <span className="text-xs font-bold text-slate-600 block mb-2 flex items-center gap-1.5">
                    <FiTarget className="text-indigo-500" size={13} /> Learning Goals:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.learningGoals.map(goal => (
                      <span key={goal} className="bg-white text-indigo-900 border border-indigo-200 px-3 py-1 rounded-full text-xs font-semibold shadow-2xs">
                        🎯 {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* General Info Grid */}
            <div className="w-full border-t border-slate-100 pt-6 pb-6 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 sm:gap-y-7 gap-x-6 px-2 sm:px-4 text-left">
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Date of Birth</p>
                  <p className="font-bold text-[#111827] text-base">{profile.dob || 'Not set'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Grade / Standard</p>
                  <p className="font-bold text-[#111827] text-base">{profile.grade || 'Not specified'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Gender</p>
                  <p className="font-bold text-[#111827] text-base">{profile.gender || 'Not set'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Parent / Guardian</p>
                  <p className="font-bold text-[#111827] text-base">{profile.parent || 'Not specified'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Contact Phone</p>
                  <p className="font-bold text-[#111827] text-base">{profile.contact || 'Not specified'}</p>
                </div>
                <div className="flex flex-col space-y-1">
                  <p className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">Residential Address</p>
                  <p className="font-bold text-[#111827] text-base">{profile.address || 'Not specified'}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="flex-1 bg-[#4700b3] text-white py-4 px-6 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-[#3d0099] transition-colors border-none cursor-pointer shadow-md shadow-purple-900/10"
              >
                <FiEdit2 size={18} /> Edit Profile & Recommendations Preferences
              </button>
            </div>
            
          </div>
        </div>

        {/* Modal: Edit / Fill Profile Details */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[620px] max-h-[92vh] overflow-y-auto border border-slate-100">
              
              {/* Header */}
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <FiEdit2 size={20} />
                  <div>
                    <h3 className="text-lg font-extrabold tracking-tight">Student Profile & Learning Interests</h3>
                    <p className="text-xs text-white/80 mt-0.5">Customize your age and interests for personalized courses</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer p-1"
                >
                  <FiX size={22} />
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSaveProfile} className="p-6 space-y-5 text-left">
                
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Student Full Name *</label>
                  <input 
                    type="text" 
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    placeholder="e.g. Alex Johnson"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    required
                  />
                </div>

                {/* Email Read-only */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Account Email (ID)</label>
                  <input 
                    type="email" 
                    value={editEmail}
                    readOnly
                    disabled
                    className="w-full bg-slate-100/70 text-slate-500 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold cursor-not-allowed"
                  />
                </div>

                {/* Date of Birth & Dynamic Age Display */}
                <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <FiCalendar size={14} /> Date of Birth *
                      </label>
                      <input 
                        type="date" 
                        value={editDob}
                        onChange={(e) => setEditDob(e.target.value)}
                        className="w-full bg-white border border-purple-200 rounded-xl py-2.5 px-3 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-purple-900 uppercase tracking-wider mb-1.5">
                        Auto-Calculated Age & Group
                      </label>
                      <div className="w-full bg-white border border-purple-200 rounded-xl py-2.5 px-3 text-sm font-bold text-purple-900 flex items-center justify-between">
                        <span>{calculatedModalAge.age !== null ? `${calculatedModalAge.age} Years Old` : 'Select DOB'}</span>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${getAgeGroupBadgeColor(calculatedModalAge.ageGroup)}`}>
                          {calculatedModalAge.ageGroup}
                        </span>
                      </div>
                      <p className="text-[10px] text-purple-600 mt-1">Age is automatically calculated from DOB to prevent manual alteration.</p>
                    </div>
                  </div>
                </div>

                {/* Experience & Skill Level */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Drawing Experience Level</label>
                    <select 
                      value={editDrawingExperience}
                      onChange={(e) => setEditDrawingExperience(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    >
                      <option value="Beginner">Beginner (First time / Basic)</option>
                      <option value="Intermediate">Intermediate (Practicing regularly)</option>
                      <option value="Advanced">Advanced (Skilled in drawing)</option>
                      <option value="Expert">Expert (Semi-professional)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Current Skill Level</label>
                    <select 
                      value={editSkillLevel}
                      onChange={(e) => setEditSkillLevel(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Drawing Interests Multi-Select Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Drawing Interests (Click to select) *</span>
                    <span className="text-[11px] text-[#4700b3] font-semibold">{editInterests.length} selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {INTEREST_OPTIONS.map(interest => {
                      const isSelected = editInterests.includes(interest);
                      return (
                        <button
                          type="button"
                          key={interest}
                          onClick={() => toggleInterest(interest)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#4700b3] text-white border-[#4700b3] shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-purple-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{interest}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Learning Goals Multi-Select Chips */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Learning Goals (Click to select)</span>
                    <span className="text-[11px] text-indigo-600 font-semibold">{editLearningGoals.length} selected</span>
                  </label>
                  <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-200">
                    {LEARNING_GOALS_OPTIONS.map(goal => {
                      const isSelected = editLearningGoals.includes(goal);
                      return (
                        <button
                          type="button"
                          key={goal}
                          onClick={() => toggleGoal(goal)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {isSelected ? '✓ ' : '+ '}{goal}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Grade & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grade / School Level</label>
                    <input 
                      type="text" 
                      value={editGrade}
                      onChange={(e) => setEditGrade(e.target.value)}
                      placeholder="e.g. 5th Grade / Primary"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Gender</label>
                    <select 
                      value={editGender}
                      onChange={(e) => setEditGender(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                </div>

                {/* Parent & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Parent / Guardian Name</label>
                    <input 
                      type="text" 
                      value={editParent}
                      onChange={(e) => setEditParent(e.target.value)}
                      placeholder="e.g. Robert Johnson"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Contact Phone Number</label>
                    <input 
                      type="tel" 
                      value={editContact}
                      onChange={(e) => setEditContact(e.target.value)}
                      placeholder="e.g. +1 555-0192 / 9876543210"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                    />
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Residential Address</label>
                  <input 
                    type="text" 
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="e.g. 124 Art Avenue, New York, NY"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-semibold focus:outline-none focus:border-[#4700b3]"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-4 pt-4 border-t border-slate-100">
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
                    <FiCheck size={16} /> Save Profile & Update Recommendations
                  </button>
                </div>
              </form>

            </div>
          </div>
        )}

    </div>
  );
};

export default StudentProfile;
