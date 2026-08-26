import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL, getImageUrl } from '../../config/api';
import { 
  FiBookOpen, 
  FiClock, 
  FiPlus, 
  FiX, 
  FiSearch, 
  FiFilter, 
  FiStar, 
  FiArrowRight,
  FiCalendar,
  FiUser
} from 'react-icons/fi';

interface Course {
  _id: string;
  courseName: string;
  courseCode: string;
  description: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  difficulty?: string;
  targetAgeGroups?: string[];
  drawingCategory?: string;
  thumbnailImage: string;
  duration?: string;
  lessonsCount?: number;
  price?: string;
  rating?: number;
  instructor?: string;
  status: 'Active' | 'Inactive';
}

interface EnrolledCourse extends Course {
  instructor: string;
  nextSession: string;
  lastAccessed: string;
  batchId?: string;
  batchName?: string;
  courseId?: string;
  progress?: number;
}

const StudentCourses: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  const [studentName, setStudentName] = useState(user?.name || '');
  const [studentAge, setStudentAge] = useState<number | null>(null);
  const [studentAgeGroup, setStudentAgeGroup] = useState('All Ages');
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);

  // Recommendations state
  const [recommendedCourses, setRecommendedCourses] = useState<any[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);

  // Explore all courses state
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState('All');
  const [selectedDifficulty] = useState('All');
  const [activeTab, setActiveTab] = useState<'recommended' | 'enrolled' | 'explore'>('recommended');

  // Batch selection modal states
  const [enrollCourseModal, setEnrollCourseModal] = useState<Course | null>(null);
  const [enrollBatches, setEnrollBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  // Fetch student and courses from DB
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileId = user?.profileId;
        if (!profileId) {
          setLoading(false);
          return;
        }
        
        // 1. Fetch Student first
        const studentRes = await fetch(`${API_BASE_URL}/api/students/${profileId}`);
        if (studentRes.ok) {
          const studentData = await studentRes.json();
          setStudentName(studentData.name || user?.name || 'Student User');

          // Calculate age & group
          let age: number | null = null;
          if (studentData.dob) {
            const birthDate = new Date(studentData.dob);
            if (!isNaN(birthDate.getTime())) {
              const today = new Date();
              age = today.getFullYear() - birthDate.getFullYear();
              const m = today.getMonth() - birthDate.getMonth();
              if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
              }
              age = age >= 0 ? age : 0;
            }
          }
          setStudentAge(age);

          let ageGroup = 'All Ages';
          if (age !== null) {
            if (age <= 6) ageGroup = 'Pre-Junior';
            else if (age >= 7 && age <= 9) ageGroup = 'Junior';
            else if (age >= 10 && age <= 12) ageGroup = 'Senior';
            else ageGroup = 'Special';
          }
          setStudentAgeGroup(ageGroup);

          if (studentData.enrolledCourses) {
            setEnrolledCourses(studentData.enrolledCourses);
          }
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };

    loadData();
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
          setRecommendedCourses(data.recommendations);
        }
      })
      .catch(err => console.error('Error loading recommended courses:', err))
      .finally(() => setLoadingRecommendations(false));
  }, [user]);

  // Fetch All Courses for Explorer
  useEffect(() => {
    const getCourses = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/courses?limit=100`);
        if (response.ok) {
          const data = await response.json();
          const coursesList: Course[] = data.courses || [];
          setAllCourses(coursesList.filter(c => c.status === 'Active'));
        }
      } catch (error) {
        console.error('Failed to fetch courses from database:', error);
      } finally {
        setLoading(false);
      }
    };

    getCourses();
  }, []);

  // Handle enrollment: open modal to select batch
  const handleEnrollClick = async (course: Course) => {
    setEnrollCourseModal(course);
    setLoadingBatches(true);
    try {
      const courseIdentifier = course._id || (course as any).courseId;
      const res = await fetch(`${API_BASE_URL}/api/batches/course/${courseIdentifier}`);
      if (res.ok) {
        const data = await res.json();
        setEnrollBatches(data || []);
      } else {
        setEnrollBatches([]);
      }
    } catch (error) {
      console.error('Failed to fetch batches', error);
      setEnrollBatches([]);
    } finally {
      setLoadingBatches(false);
    }
  };

  const handleBatchSelect = (course: Course, batch: any) => {
    setEnrollCourseModal(null);
    navigate('/student/fees', { state: { pendingEnrollment: course, pendingBatch: batch } });
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

  // Filter explore courses
  const filteredCourses = allCourses.filter(course => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (course.courseName || '').toLowerCase().includes(q);
      const matchDesc = (course.description || '').toLowerCase().includes(q);
      if (!matchName && !matchDesc) return false;
    }

    if (selectedAgeGroup !== 'All') {
      const groups = course.targetAgeGroups || ['All Ages'];
      if (!groups.includes(selectedAgeGroup) && !groups.includes('All Ages')) return false;
    }

    if (selectedDifficulty !== 'All') {
      const diff = (course.difficulty || course.skillLevel || 'Beginner').toLowerCase();
      if (diff !== selectedDifficulty.toLowerCase()) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col relative overflow-x-hidden pb-12 w-full min-w-0 bg-[#fbfaff]">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-5 bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Course Center</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Explore personalized recommendations and manage your enrolled courses</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-xs text-[#6B7280] mt-1 font-semibold">
                {studentAge !== null ? `${studentAge} yrs • ` : ''}{studentAgeGroup}
              </p>
            </div>
            <div 
              onClick={() => navigate('/student/profile')}
              className="w-10 h-10 rounded-full bg-[#4700b3] text-white flex items-center justify-center font-bold text-base border border-slate-200 shadow-sm cursor-pointer shrink-0 hover:bg-[#3d0099] transition-colors"
            >
              {studentName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="px-4 sm:px-6 lg:px-10 mt-6 sm:mt-8 space-y-8 flex-1 max-w-[1400px] mx-auto w-full">
          
          {location.state?.fromRestricted && (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-semibold flex items-center gap-3 shadow-sm">
              <span className="text-amber-500 text-base">⚠️</span>
              <span>Please purchase a course to unlock full access to the student learning hub.</span>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('recommended')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'recommended'
                    ? 'bg-[#4700b3] text-white border-[#4700b3] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                ⭐ Recommended For You ({recommendedCourses.length})
              </button>

              <button
                onClick={() => setActiveTab('enrolled')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'enrolled'
                    ? 'bg-[#4700b3] text-white border-[#4700b3] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                📚 My Enrolled Courses ({enrolledCourses.length})
              </button>

              <button
                onClick={() => setActiveTab('explore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                  activeTab === 'explore'
                    ? 'bg-[#4700b3] text-white border-[#4700b3] shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                🌐 Explore All Courses ({allCourses.length})
              </button>
            </div>

            <div className="text-xs font-semibold text-slate-500">
              Target Category: <span className="font-extrabold text-[#4700b3]">{studentAgeGroup}</span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: RECOMMENDED FOR YOU */}
          {/* ========================================================================= */}
          {activeTab === 'recommended' && (
            <section className="space-y-6 text-left">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Personalized Recommendations</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Courses dynamically matched for your age category ({studentAgeGroup}) and interests.</p>
                </div>
              </div>

              {loadingRecommendations ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-80"></div>
                  ))}
                </div>
              ) : recommendedCourses.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-700">No new recommendations available</p>
                  <p className="text-xs text-slate-400">You are enrolled in all courses matching your current preferences. Switch to "Explore All Courses" to view other categories.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommendedCourses.map((item) => (
                    <div
                      key={item.courseId}
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between overflow-hidden cursor-pointer group"
                      onClick={() => handleEnrollClick(item.course || item)}
                    >
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img 
                          src={getImageUrl(item.thumbnailImage) || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                          alt={item.courseName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#4700b3]/95 backdrop-blur-md text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-md flex items-center gap-1.5">
                          <FiStar className="fill-amber-300 text-amber-300" size={12} />
                          <span>{item.reason}</span>
                        </div>
                        <div className="absolute bottom-3 left-3 flex gap-1.5">
                          {(item.targetAgeGroups || ['All Ages']).map((ag: string) => (
                            <span key={ag} className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border shadow-xs ${getAgeGroupBadgeColor(ag)}`}>
                              {ag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-1.5">
                            <span>{item.drawingCategory || 'Drawing Class'}</span>
                            <span className="flex items-center gap-1 text-amber-500 font-bold">
                              <FiStar className="fill-amber-400" size={13} /> {item.rating || 4.8}
                            </span>
                          </div>
                          <h4 className="text-lg font-black text-slate-900 line-clamp-1 group-hover:text-[#4700b3] transition-colors">{item.courseName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase block">Tuition Fee</span>
                            <span className="text-base font-black text-[#4700b3]">{item.price || '₹3,999'}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleEnrollClick(item.course || item); }}
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
          )}

          {/* ========================================================================= */}
          {/* TAB 2: MY ENROLLED COURSES */}
          {/* ========================================================================= */}
          {activeTab === 'enrolled' && (
            <section className="space-y-6 text-left">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Active Enrolled Courses</h2>
                  <p className="text-slate-400 text-xs mt-0.5">Your active learning schedule and course modules</p>
                </div>
                <span className="bg-[#4700b3]/10 text-[#4700b3] text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">
                  {enrolledCourses.length} Active Modules
                </span>
              </div>

              {enrolledCourses.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 border border-slate-100 text-center space-y-3">
                  <p className="text-sm font-bold text-slate-700">You haven't enrolled in any courses yet</p>
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className="bg-[#4700b3] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md cursor-pointer border-none"
                  >
                    View Recommended Courses
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {enrolledCourses.map((course) => (
                    <div 
                      key={course._id} 
                      className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <img 
                          src={getImageUrl(course.thumbnailImage) || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                          alt={course.courseName}
                          className="w-16 h-16 rounded-2xl object-cover shrink-0" 
                        />
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-purple-700 uppercase bg-purple-50 px-2 py-0.5 rounded-md">Enrolled</span>
                          <h4 className="text-base font-bold text-slate-900 truncate mt-1">{course.courseName}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{course.instructor || 'TBD'}</p>
                        </div>
                      </div>

                      <div className="py-2">
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                          <span>Course Progress</span>
                          <span>{course.progress || 25}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-[#4700b3] h-full rounded-full transition-all" style={{ width: `${course.progress || 25}%` }}></div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500 font-semibold">
                        <div className="flex items-center gap-1.5">
                          <FiClock size={14} className="text-slate-400" />
                          <span>{course.nextSession || 'Schedule Active'}</span>
                        </div>
                        <span className="text-[#4700b3] font-bold">Active</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: EXPLORE ALL COURSES */}
          {/* ========================================================================= */}
          {activeTab === 'explore' && (
            <section className="space-y-6 text-left">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Explore Full Course Catalog</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Browse all available courses across all age categories without restriction.</p>
                </div>

                <div className="relative w-full md:w-72">
                  <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search courses..."
                    className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#4700b3]"
                  />
                </div>
              </div>

              {/* Age Group Filter Tabs */}
              <div className="flex flex-wrap items-center gap-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-2xs">
                <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
                  <FiFilter size={12} /> Age Category:
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

              {/* Grid */}
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4700b3]"></div>
                </div>
              ) : filteredCourses.length === 0 ? (
                <div className="py-12 text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                  <p className="font-semibold text-sm">No courses match the selected filters.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredCourses.map((course: Course) => (
                    <div 
                      key={course._id} 
                      className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] overflow-hidden flex flex-col justify-between hover:shadow-md transition-all cursor-pointer group"
                      onClick={() => handleEnrollClick(course)}
                    >
                      <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                        <img 
                          src={getImageUrl(course.thumbnailImage) || 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'} 
                          alt={course.courseName} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                        <div className="absolute top-3 left-3 flex gap-1.5">
                          {(course.targetAgeGroups || ['All Ages']).map(ag => (
                            <span key={ag} className={`px-2 py-0.5 text-[9px] font-black rounded-md uppercase border shadow-2xs ${getAgeGroupBadgeColor(ag)}`}>
                              {ag}
                            </span>
                          ))}
                        </div>
                        <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs">
                          {course.skillLevel || 'Beginner'}
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                        <div>
                          <h4 className="font-black text-base text-slate-900 line-clamp-1 group-hover:text-[#4700b3] transition-colors">{course.courseName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">{course.description || 'Structured step-by-step drawing curriculum.'}</p>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                          <div>
                            <span className="text-[9px] font-bold text-slate-400 uppercase block">Fee</span>
                            <span className="text-base font-black text-[#4700b3]">{course.price || '₹3,999'}</span>
                          </div>

                          <button 
                            onClick={(e) => { e.stopPropagation(); handleEnrollClick(course); }}
                            className="bg-[#4700b3] hover:bg-[#3d0099] text-white px-4 py-2 rounded-xl font-bold text-xs transition-colors border-none cursor-pointer flex items-center gap-1"
                          >
                            <FiPlus size={14} /> Enroll
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}

        </div>

        {/* Modal: Select Batch */}
        {enrollCourseModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-[650px] overflow-hidden border border-slate-100 flex flex-col max-h-[85vh]">
              <div className="p-6 bg-[#4700b3] text-white flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <FiBookOpen size={20} />
                  <h3 className="text-lg font-extrabold tracking-tight">Select Batch Schedule</h3>
                </div>
                <button 
                  onClick={() => setEnrollCourseModal(null)}
                  className="bg-transparent border-none text-white/80 hover:text-white cursor-pointer"
                >
                  <FiX size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6 overflow-y-auto text-left flex-1 bg-[#F8FAFC]">
                <div>
                  <span className="text-[10px] font-bold text-[#4700b3] bg-[#4700b3]/10 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {enrollCourseModal.courseCode || 'NEW'}
                  </span>
                  <h4 className="font-black text-slate-800 text-lg mt-2 leading-tight">
                    {enrollCourseModal.courseName}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    Select a batch timing that fits your schedule to complete your enrollment.
                  </p>
                </div>

                {loadingBatches ? (
                  <div className="flex flex-col justify-center items-center py-12 gap-3 bg-white rounded-2xl border border-slate-100 p-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4700b3]"></div>
                    <span className="text-xs font-semibold text-slate-400">Loading available schedules...</span>
                  </div>
                ) : enrollBatches.length === 0 ? (
                  <div className="py-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100 p-8">
                    <FiCalendar size={36} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-extrabold text-sm text-slate-700">No active batches available</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">There are no batches scheduled for this course at the moment. Please contact the administrator.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {enrollBatches.map((batch) => {
                      const seatsLeft = batch.availableSeats !== undefined ? batch.availableSeats : (batch.capacity - (batch.enrolledStudents || 0));
                      const isFull = seatsLeft <= 0;
                      let seatColorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
                      if (seatsLeft <= 5) seatColorClass = "text-orange-600 bg-orange-50 border-orange-100";
                      if (isFull) seatColorClass = "text-red-600 bg-red-50 border-red-100";

                      return (
                        <div 
                          key={batch._id} 
                          className={`bg-white rounded-2xl p-5 border shadow-sm transition-all duration-300 flex flex-col sm:flex-row justify-between sm:items-center gap-4 ${
                            isFull ? 'opacity-70 border-slate-100' : 'border-slate-100 hover:border-purple-200 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-3 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-slate-900 text-sm">{batch.batchName}</span>
                              <span className={`px-2 py-0.5 text-[9px] font-extrabold border rounded-md uppercase tracking-wider ${seatColorClass}`}>
                                {isFull ? 'Full' : `${seatsLeft} seats left`}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-500 font-medium">
                              <div className="flex items-center gap-1.5">
                                <FiCalendar className="text-slate-400 shrink-0" size={14} />
                                <span>{batch.days ? batch.days.join(', ') : 'Days TBD'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <FiClock className="text-slate-400 shrink-0" size={14} />
                                <span>{batch.startTime && batch.endTime ? `${batch.startTime} - ${batch.endTime}` : 'Time TBD'}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                              <FiUser className="text-slate-400" size={14} />
                              <span className="text-[11px] font-bold text-slate-500">Instructor: <span className="text-slate-700 font-extrabold">{batch.instructor || 'TBD'}</span></span>
                            </div>
                          </div>

                          <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 shrink-0 sm:pl-4 sm:border-l border-slate-100 gap-3">
                            <div className="text-left sm:text-right">
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fee / Price</p>
                              <h5 className="text-base font-black text-slate-900">₹{batch.batchFee || '4,500'}</h5>
                            </div>
                            <button
                              disabled={isFull}
                              onClick={() => handleBatchSelect(enrollCourseModal, batch)}
                              className={`py-2 px-4 rounded-xl font-bold text-xs border-none cursor-pointer transition-all ${
                                isFull 
                                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                  : 'bg-[#4700b3] hover:bg-[#3d0099] text-white shadow-sm hover:shadow shadow-purple-200'
                              }`}
                            >
                              Enroll Batch
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={() => setEnrollCourseModal(null)}
                  className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 py-2.5 px-6 rounded-xl font-bold transition-all cursor-pointer text-xs"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

    </div>
  );
};

export default StudentCourses;
