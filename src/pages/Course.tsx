import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Check, Star, X, Calendar, Clock, Users } from 'lucide-react';
import { API_BASE_URL } from '../config/api';

// Images
import courseBg from '../assets/course-bg.png';
import course4 from '../assets/course4.png';
import crayon from '../assets/crayon.png';

export default function Course() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [batches, setBatches] = useState<any[]>([]);
  const [loadingBatches, setLoadingBatches] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/courses`);
      const data = await res.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Error fetching courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewBatches = async (course: any) => {
    setSelectedCourse(course);
    setLoadingBatches(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/batches/course/${course._id}`);
      const data = await res.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches', error);
    } finally {
      setLoadingBatches(false);
    }
  };

  const beginnerCourses = courses.filter(c => c.skillLevel === 'Beginner');
  const intermediateCourses = courses.filter(c => c.skillLevel === 'Intermediate');
  const advancedCourses = courses.filter(c => c.skillLevel === 'Advanced');

  const CourseCard = ({ course, badgeColorClass, buttonColorClass }: { course: any, colorClass: string, badgeColorClass: string, buttonColorClass: string }) => (
    <div className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col h-full">
      <div className="relative aspect-[4/3] w-full overflow-hidden group">
        <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${badgeColorClass}`}>
          {course.courseCode}
        </div>
        <img 
          src={course.thumbnailImage || course4} 
          alt={course.courseName} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
        />
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{course.courseName}</h3>
        <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed line-clamp-3">{course.description}</p>
        
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-purple-100 p-2 rounded-lg">
            <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
          </div>
          <span className="font-bold text-purple-700">View Details</span>
        </div>
        
        <button 
          onClick={() => handleViewBatches(course)}
          className={`w-full py-3 border-2 ${buttonColorClass} font-bold rounded-xl transition-colors duration-300 mt-auto`}
        >
          View Batches
        </button>
      </div>
    </div>
  );

  return (
    <div 
      className="min-h-screen font-['Outfit',sans-serif] overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.8), rgba(255, 255, 255, 0.85)), url(${courseBg})`, 
        backgroundSize: '100% auto', 
        backgroundPosition: 'top center', 
        backgroundRepeat: 'repeat-y'
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-28 pb-16 md:pt-32 md:pb-20 lg:pt-48 lg:pb-32 px-4 flex flex-col items-center text-center z-10">
        <div className="absolute top-16 right-3 sm:top-20 sm:right-6 md:top-10 md:right-10 w-24 sm:w-36 md:w-72 lg:w-96 animate-bounce-slow opacity-80 pointer-events-none z-0">
          <img src={crayon} alt="Decorative Brush" className="w-full h-auto drop-shadow-2xl -rotate-12" />
        </div>
        
        <div className="relative z-10 bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 mb-6 shadow-sm">
          <Star className="w-4 h-4 fill-yellow-900" />
          Discovery Awaits
        </div>
        
        <h1 className="relative z-10 text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#00668A] mb-6 max-w-3xl leading-tight">
          Explore the Curriculum
        </h1>
        
        <p className="relative z-10 text-gray-700 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
          Find the perfect creative path for every age and skill level. From tactile sensory play to advanced digital masterclasses.
        </p>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24 relative z-20">
        
        {loading ? (
          <div className="text-center py-20 text-xl font-bold text-gray-500">Loading courses...</div>
        ) : (
          <>
            {/* Pre-Junior Section */}
            {beginnerCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#00668A] text-white p-3 rounded-2xl shadow-lg">
                    <span className="text-xl font-bold">😊</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#00668A]">Pre-Junior (Beginner)</h2>
                    <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                      Ages 4-8 • Tactile learning & play based curriculum
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  {beginnerCourses.map((course) => (
                    <CourseCard 
                      key={course._id} 
                      course={course} 
                      colorClass="text-[#00668A]" 
                      badgeColorClass="bg-yellow-300 text-yellow-900"
                      buttonColorClass="border-[#00668A] text-[#00668A] hover:bg-[#00668A] hover:text-white"
                    />
                  ))}

                  {/* Information Card */}
                  <div className="bg-gradient-to-br from-[#00668A] to-[#004e6e] rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-center h-full transform hover:scale-[1.02] transition-transform duration-300 min-h-[400px]">
                    <h3 className="text-3xl font-bold mb-4 leading-tight">Start Their Journey Early</h3>
                    <p className="text-blue-100 mb-8 text-sm md:text-base leading-relaxed">
                      Our Pre-Junior track is designed to build confidence and joy before technique.
                    </p>
                    
                    <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                        <div className="bg-green-400 p-1 rounded-full">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="font-medium">Materials & tools provided</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <div className="bg-green-400 p-1 rounded-full">
                          <Check className="w-4 h-4 text-white" strokeWidth={3} />
                        </div>
                        <span className="font-medium">Small group class (max 6)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </section>
            )}

            {/* Junior Section */}
            {intermediateCourses.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#cc2b5e] text-white p-3 rounded-2xl shadow-lg">
                    <span className="text-xl font-bold">🖌️</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#cc2b5e]">Junior (Intermediate)</h2>
                    <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                      Ages 9-14 • Drawing, perspective, and color theories
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  {intermediateCourses.map((course) => (
                    <CourseCard 
                      key={course._id} 
                      course={course} 
                      colorClass="text-[#cc2b5e]" 
                      badgeColorClass="bg-red-100 text-red-600"
                      buttonColorClass="border-[#cc2b5e] text-[#cc2b5e] hover:bg-[#cc2b5e] hover:text-white"
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Senior Section */}
            {advancedCourses.length > 0 && (
              <section className="pb-16">
                <div className="flex items-center gap-4 mb-8">
                  <div className="bg-[#5a653e] text-white p-3 rounded-2xl shadow-lg">
                    <span className="text-xl font-bold">A</span>
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-[#5a653e]">Senior (Advanced)</h2>
                    <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                      Ages 15+ & Adults • Advanced portfolio & industry standard techniques
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
                  {advancedCourses.map((course) => (
                    <CourseCard 
                      key={course._id} 
                      course={course} 
                      colorClass="text-[#5a653e]" 
                      badgeColorClass="bg-lime-100 text-lime-700"
                      buttonColorClass="border-[#5a653e] text-[#5a653e] hover:bg-[#5a653e] hover:text-white"
                    />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>

      {/* Batches Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setSelectedCourse(null)}
              className="absolute top-6 right-6 p-2 bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-8 md:p-10">
              <h2 className="text-3xl font-bold text-slate-800 mb-2">{selectedCourse.courseName}</h2>
              <p className="text-slate-500 mb-8 max-w-2xl">{selectedCourse.description}</p>
              
              <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                Available Batches
                <span className="bg-indigo-100 text-indigo-700 text-sm py-1 px-3 rounded-full">{batches.length}</span>
              </h3>

              {loadingBatches ? (
                <div className="py-12 text-center text-slate-500">Loading batches...</div>
              ) : batches.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p>No batches are currently available for this course.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {batches.map(batch => (
                    <div key={batch._id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group flex flex-col">
                      <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold ${
                        batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                        batch.status === 'UPCOMING' ? 'bg-blue-100 text-blue-700' :
                        batch.status === 'COMPLETED' ? 'bg-slate-100 text-slate-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {batch.status}
                      </div>

                      <h4 className="text-lg font-bold text-slate-800 mb-1 pr-20">{batch.batchName}</h4>
                      <div className="text-xs font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded inline-block mb-4 self-start">
                        {batch.batchCode}
                      </div>

                      <div className="space-y-2 mb-6 flex-grow">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          {batch.startDate || 'TBD'} to {batch.endDate || 'TBD'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Clock className="w-4 h-4 text-slate-400" />
                          {batch.startTime || 'TBD'} - {batch.endTime || 'TBD'}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4 text-slate-400" />
                          {batch.days?.length > 0 ? batch.days.join(', ') : 'Days TBD'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Instructor</p>
                          <p className="font-medium text-slate-800 text-sm">{batch.instructor || 'Unassigned'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500 mb-1">Fee</p>
                          <p className="font-bold text-indigo-600 text-lg">
                            {batch.batchFee ? `₹${batch.batchFee}` : 'Free'}
                          </p>
                        </div>
                      </div>

                      <button 
                        onClick={() => {
                          if (user && user.role === 'student') {
                            navigate('/student/courses', { state: { pendingEnrollment: selectedCourse } });
                          } else {
                            navigate('/login', { 
                              state: { 
                                redirectTo: '/student/courses', 
                                pendingEnrollment: selectedCourse 
                              } 
                            });
                          }
                        }}
                        className="w-full mt-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
                      >
                        Enroll Now
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
