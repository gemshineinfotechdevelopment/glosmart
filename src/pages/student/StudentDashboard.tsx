import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, getImageUrl } from '../../config/api';
import {
  FiBook,
  FiClock,
  FiChevronRight,
  FiArrowRight,
  FiUser,
  FiStar,
  FiAward,
  FiSearch,
  FiFilter,
  FiTarget,
  FiLayers,
  FiSmile
} from 'react-icons/fi';

interface RecommendationItem {
  courseId: string;
  courseName: string;
  thumbnailImage: string;
  description: string;
  targetAgeGroups: string[];
  difficulty: string;
  drawingCategory: string;
  duration: string;
  lessonsCount: number;
  price: string;
  rating: number;
  instructor: string;
  score: number;
  reason: string;
  reasonsList?: string[];
  course?: any;
}

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Student profile state
  const [student, setStudent] = useState({
    name: user?.name || '',
    dob: '',
    age: null as number | null,
    ageCategory: 'All Ages',
    grade: '',
    drawingExperience: 'Beginner',
    skillLevel: 'Beginner',
    interests: [] as string[],
    learningGoals: [] as string[],
    attendance: '0 Days',
    activeCoursesCount: 0,
    avatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    enrolledCourses: [] as any[]
  });

  // Recommendations state
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Explore all courses state
  const [allCourses, setAllCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState('rating');

  // Fetch Student data on mount
  useEffect(() => {
    const profileId = user?.profileId;
    if (!profileId) return;

    fetch(`${API_BASE_URL}/api/students/${profileId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Server error ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data) {
          let finalAttendance = '0 Days';
          const records = data.attendanceRecords || [];
          if (records.length > 0) {
            const presentOrLate = records.filter((r: any) =>
              r.status.toLowerCase() === 'present' || r.status.toLowerCase() === 'late'
            ).length;
            finalAttendance = presentOrLate + ' Days';
          }

          // Compute age and age category from DOB
          let age: number | null = null;
          if (data.dob) {
            const birthDate = new Date(data.dob);
            if (!isNaN(birthDate.getTime())) {
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              age = age >= 0 ? age : 0;
            }
          } else if (data.age) {
            const parsed = parseInt(data.age, 10);
            if (!isNaN(parsed)) age = parsed;
          }

          let ageCategory = 'All Ages';
          if (age !== null) {
            if (age <= 6) ageCategory = 'Pre-Junior';
            else if (age >= 7 && age <= 9) ageCategory = 'Junior';
            else if (age >= 10 && age <= 12) ageCategory = 'Senior';
            else ageCategory = 'Special';
          }

          setStudent({
            name: data.name || user?.name || 'Student User',
            dob: data.dob || '',
            age: age,
            ageCategory: ageCategory,
            grade: data.grade || 'Grade Not Set',
            drawingExperience: data.drawingExperience || 'Beginner',
            skillLevel: data.skillLevel || 'Beginner',
            interests: data.interests || ['Basic drawing', 'Coloring'],
            learningGoals: data.learningGoals || [],
            attendance: finalAttendance,
            activeCoursesCount: data.enrolledCourses ? data.enrolledCourses.length : 0,
            avatar: data.avatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
            enrolledCourses: data.enrolledCourses || []
          });
        }
      })
      .catch(err => console.error('Error fetching student data:', err));
  }, [user]);

  // Fetch Recommended Courses
  useEffect(() => {
    const profileId = user?.profileId;
    const url = profileId 
      ? `${API_BASE_URL}/api/courses/recommended?studentId=${profileId}`
      : `${API_BASE_URL}/api/courses/recommended`;

    setLoadingRecommendations(true);
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.recommendations)) {
          setRecommendations(data.recommendations);
        }
      })
      .catch(err => console.error('Error loading recommendations:', err))
      .finally(() => setLoadingRecommendations(false));
  }, [user, student.interests, student.age, student.skillLevel]);

  // Fetch All Courses for "Explore All Courses"
  useEffect(() => {
    setLoadingCourses(true);
    fetch(`${API_BASE_URL}/api/courses?limit=100`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.courses)) {
          setAllCourses(data.courses);
        }
      })
      .catch(err => console.error('Error fetching all courses:', err))
      .finally(() => setLoadingCourses(false));
  }, []);

  // Filter and sort for Explore All Courses section
  const filteredExploreCourses = allCourses.filter(course => {
    if (course.status && course.status !== 'Active') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (course.courseName || '').toLowerCase().includes(q);
      const matchDesc = (course.description || '').toLowerCase().includes(q);
      const matchCat = (course.drawingCategory || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc && !matchCat) return false;
    }

    // Age Group filter
    if (selectedAgeGroup !== 'All') {
      const groups = course.targetAgeGroups || ['All Ages'];
      const hasGroup = groups.includes(selectedAgeGroup) || groups.includes('All Ages');
      if (!hasGroup) return false;
    }

    // Difficulty filter
    if (selectedDifficulty !== 'All') {
      const diff = (course.difficulty || course.skillLevel || 'Beginner').toLowerCase();
      if (diff !== selectedDifficulty.toLowerCase()) return false;
    }

    return true;
  }).sort((a, b) => {
    if (sortBy === 'rating') return (b.rating || 4.8) - (a.rating || 4.8);
    if (sortBy === 'priceLow') {
      const priceA = parseInt((a.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      const priceB = parseInt((b.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return priceA - priceB;
    }
    if (sortBy === 'priceHigh') {
      const priceA = parseInt((a.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      const priceB = parseInt((b.price || '0').replace(/[^0-9]/g, ''), 10) || 0;
      return priceB - priceA;
    }
    return 0;
  });

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

  return (
    <div className="flex flex-col relative w-full min-w-0 bg-[#fbfaff]">
      
      {/* Top Header */}
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-5 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-[#111827] tracking-tight">Student Learning Hub</h1>
          <p className="text-[#6B7280] text-xs sm:text-sm mt-0.5">Personalized recommendations and creative art classes</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-[#111827] leading-none">{student.name || 'Student User'}</p>
            <p className="text-xs text-[#6B7280] mt-1 font-semibold">
              {student.age !== null ? `${student.age} yrs • ` : ''}{student.ageCategory}
            </p>
          </div>
          <div 
            onClick={() => navigate('/student/profile')}
            className="w-10 h-10 rounded-full bg-[#f0e8ff] text-[#4700b3] flex items-center justify-center shadow-sm border border-slate-200 shrink-0 cursor-pointer hover:bg-purple-100 transition-colors"
            title="View Profile"
          >
            <FiUser size={20} />
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-10 max-w-[1400px] mx-auto w-full space-y-10">
        
        {/* ========================================================================= */}
        {/* 1. WELCOME SECTION & STUDENT PROFILE SUMMARY */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-r from-[#4700b3] via-[#5c16c5] to-[#7c25d9] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-purple-900/10 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center text-9xl">
            🎨
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-purple-100">
                <FiSmile size={14} /> Ready to Create Art
              </div>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                Welcome back, <span className="text-amber-300">{student.name || 'Artist'}!</span>
              </h2>
              <p className="text-purple-100 text-sm sm:text-base leading-relaxed">
                Your recommendations are tailored for your age group <span className="font-bold underline text-white">{student.ageCategory}</span> and your favorite drawing topics.
              </p>

              {/* Profile Summary Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20">
                  🎂 Age: {student.age !== null ? `${student.age} Years` : 'DOB Needed'}
                </span>
                <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20">
                  🏷️ Category: {student.ageCategory}
                </span>
                <span className="bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-white border border-white/20">
                  ⚡ Skill: {student.skillLevel}
                </span>
                {student.interests.slice(0, 3).map(interest => (
                  <span key={interest} className="bg-amber-400/30 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-amber-200 border border-amber-300/30">
                    ✨ {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 w-full lg:w-auto shrink-0">
              <button
                onClick={() => navigate('/student/profile')}
                className="bg-amber-400 hover:bg-amber-300 text-purple-950 px-6 py-3.5 rounded-2xl font-black text-sm transition-all shadow-lg hover:shadow-amber-400/30 cursor-pointer border-none flex items-center justify-center gap-2"
              >
                <FiTarget size={16} /> Customize Preferences
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('explore-courses-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-white/15 hover:bg-white/25 text-white px-6 py-3.5 rounded-2xl font-bold text-sm transition-all border border-white/20 cursor-pointer flex items-center justify-center gap-2"
              >
                <FiBook size={16} /> Browse All Courses
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* 2. "RECOMMENDED FOR YOU" SECTION */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <FiAward size={18} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Recommended For You
                </h3>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Personalized for <span className="font-bold text-[#4700b3]">{student.ageCategory}</span> ({student.age !== null ? `${student.age} yrs` : 'your age'}) based on your interests & skill level.
              </p>
            </div>

            <span className="text-xs font-bold text-purple-900 bg-purple-50 border border-purple-200 px-3.5 py-1.5 rounded-full self-start sm:self-auto">
              🎯 Multi-Factor Match Engine
            </span>
          </div>

          {loadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-80"></div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-100 text-center space-y-3">
              <div className="text-4xl">🎨</div>
              <h4 className="text-lg font-bold text-slate-800">You're Enrolled in All Current Recommendations!</h4>
              <p className="text-sm text-slate-500 max-w-md mx-auto">Explore all available courses below or check out new drawing categories.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.slice(0, 6).map((item) => (
                <div 
                  key={item.courseId}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col overflow-hidden group text-left"
                >
                  {/* Thumbnail Image with Badges */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(item.thumbnailImage) || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                      alt={item.courseName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    
                    {/* Recommendation Reason Tag */}
                    <div className="absolute top-3 left-3 bg-[#4700b3]/95 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                      <FiStar className="fill-amber-300 text-amber-300" size={12} />
                      <span>{item.reason}</span>
                    </div>

                    {/* Age Group Tag at Bottom of Image */}
                    <div className="absolute bottom-3 left-3 flex gap-1.5">
                      {(item.targetAgeGroups || ['All Ages']).map(ag => (
                        <span key={ag} className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${getAgeGroupBadgeColor(ag)}`}>
                          {ag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Course Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-2">
                        <span>{item.drawingCategory || 'Drawing Class'}</span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <FiStar className="fill-amber-400" size={13} /> {item.rating || 4.8}
                        </span>
                      </div>

                      <h4 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-[#4700b3] transition-colors">
                        {item.courseName}
                      </h4>

                      <p className="text-slate-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description || 'Learn comprehensive drawing techniques with step-by-step guidance from expert tutors.'}
                      </p>
                    </div>

                    {/* Metadata Row */}
                    <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <FiClock className="text-slate-400" size={14} />
                        <span>{item.duration || '8 Weeks'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FiLayers className="text-slate-400" size={14} />
                        <span>{item.lessonsCount || 16} Lessons</span>
                      </div>
                    </div>

                    {/* Price & Action CTA */}
                    <div className="flex items-center justify-between pt-1">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Tuition Fee</span>
                        <span className="text-lg font-black text-[#4700b3]">{item.price || '₹3,999'}</span>
                      </div>

                      <button
                        onClick={() => navigate('/student/courses')}
                        className="bg-[#4700b3] hover:bg-[#3d0099] text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer border-none flex items-center gap-1.5"
                      >
                        Enroll Now <FiArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 3. "CONTINUE LEARNING" / ENROLLED COURSES */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-[#4700b3] flex items-center justify-center font-bold">
                <FiBook size={18} />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Continue Learning ({student.enrolledCourses.length})
              </h3>
            </div>

            <button 
              onClick={() => navigate('/student/courses')}
              className="text-xs font-bold text-[#4700b3] hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
            >
              View My Courses <FiChevronRight size={14} />
            </button>
          </div>

          {student.enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 text-center space-y-3">
              <p className="text-sm font-semibold text-slate-600">You haven't enrolled in any courses yet.</p>
              <button
                onClick={() => {
                  const el = document.getElementById('explore-courses-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#4700b3] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer border-none"
              >
                Explore Courses & Enroll
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {student.enrolledCourses.map((course: any, idx: number) => (
                <div 
                  key={course.courseId || idx}
                  className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm flex flex-col justify-between space-y-4 text-left"
                >
                  <div className="flex items-start gap-4">
                    <img 
                      src={getImageUrl(course.thumbnailImage) || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      alt={course.courseName}
                      className="w-16 h-16 rounded-2xl object-cover shrink-0"
                    />
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md">Enrolled Course</span>
                      <h4 className="text-base font-bold text-slate-900 truncate mt-1">{course.courseName}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{course.instructor || 'TBD'}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                      <span>Progress</span>
                      <span>{course.progress || 25}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-[#4700b3] h-full rounded-full transition-all" style={{ width: `${course.progress || 25}%` }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/student/courses')}
                    className="w-full bg-purple-50 hover:bg-purple-100 text-[#4700b3] py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none flex items-center justify-center gap-1.5"
                  >
                    Resume Learning <FiArrowRight size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ========================================================================= */}
        {/* 4. "EXPLORE ALL COURSES" (Full Catalog - Non-restricted) */}
        {/* ========================================================================= */}
        <section id="explore-courses-section" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                  <FiLayers size={18} />
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  Explore All Courses
                </h3>
              </div>
              <p className="text-slate-500 text-xs sm:text-sm mt-1">
                Browse our complete course catalog across all age categories and skill levels.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search all courses..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4700b3] shadow-2xs"
              />
            </div>
          </div>

          {/* Filter Tabs Bar */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Age Group Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                <FiFilter size={12} /> Age Group:
              </span>
              {[
                { id: 'All', label: 'All Courses' },
                { id: 'Pre-Junior', label: 'Pre-Junior (4–6)' },
                { id: 'Junior', label: 'Junior (7–9)' },
                { id: 'Senior', label: 'Senior (10–12)' },
                { id: 'Special', label: 'Special (12+)' },
                { id: 'All Ages', label: 'All Ages' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedAgeGroup(tab.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer border ${
                    selectedAgeGroup === tab.id
                      ? 'bg-[#4700b3] text-white border-[#4700b3] shadow-xs'
                      : 'bg-slate-50 text-slate-600 border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Difficulty & Sort Controls */}
            <div className="flex items-center gap-2">
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="All">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none"
              >
                <option value="rating">Top Rated</option>
                <option value="priceLow">Price: Low to High</option>
                <option value="priceHigh">Price: High to Low</option>
              </select>
            </div>

          </div>

          {/* Catalog Grid */}
          {loadingCourses ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-72"></div>
              ))}
            </div>
          ) : filteredExploreCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
              <p className="text-slate-500 text-sm font-semibold">No courses match the selected filters.</p>
              <button
                onClick={() => {
                  setSelectedAgeGroup('All');
                  setSelectedDifficulty('All');
                  setSearchQuery('');
                }}
                className="text-[#4700b3] font-bold text-xs underline bg-transparent border-none cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExploreCourses.map((course: any) => (
                <div 
                  key={course._id}
                  className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.02)] hover:shadow-lg hover:border-slate-200 transition-all flex flex-col justify-between overflow-hidden text-left"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <img 
                      src={getImageUrl(course.thumbnailImage) || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'}
                      alt={course.courseName}
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute top-3 left-3 flex gap-1.5">
                      {(course.targetAgeGroups || ['All Ages']).map((ag: string) => (
                        <span key={ag} className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${getAgeGroupBadgeColor(ag)}`}>
                          {ag}
                        </span>
                      ))}
                    </div>

                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {course.skillLevel || 'Beginner'}
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                        <span>{course.drawingCategory || 'Art & Drawing'}</span>
                        <span className="flex items-center gap-1 text-amber-500 font-bold">
                          <FiStar className="fill-amber-400" size={13} /> {course.rating || 4.8}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900 line-clamp-1">{course.courseName}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{course.description || 'Comprehensive curriculum for artistic growth.'}</p>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Fee</span>
                        <span className="text-base font-black text-slate-900">{course.price || '₹3,999'}</span>
                      </div>

                      <button
                        onClick={() => navigate('/student/courses')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                      >
                        View & Enroll
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default StudentDashboard;
