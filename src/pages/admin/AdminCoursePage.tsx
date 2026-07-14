import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiCalendar, FiUsers, FiEdit2 } from 'react-icons/fi';
import { MdOutlineDashboard } from 'react-icons/md';
import AdminSidebar from '../../components/admin/AdminSidebar';
import { useAuth } from '../../context/AuthContext';

export default function AdminCoursePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All Courses');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/courses');
      const data = await response.json();
      setCourses(data.courses || []);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(c => {
    if (filter === 'All Courses') return true;
    if (filter === 'Active') return c.status === 'Active';
    if (filter === 'Inactive') return c.status === 'Inactive';
    return true;
  });

  return (
    <div className="flex min-h-screen bg-[#f8f9fc] font-sans">
      <AdminSidebar />
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Course Management</h1>
              <p className="text-slate-500">Streamline academy operations: track active batches, monitor teacher performance, and manage student enrollment schedules.</p>
            </div>
            {user?.role === 'admin' && (
              <button 
                onClick={() => navigate('/admin/courses/new')}
                className="flex items-center gap-2 px-6 py-3 bg-[#4f39f6] text-white rounded-full hover:bg-indigo-700 transition-colors font-semibold shadow-md shadow-indigo-200 shrink-0"
              >
                <FiPlus size={20} /> Create New Course
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 mb-8 overflow-x-auto pb-2">
            {['All Courses', 'Active', 'Inactive'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-6 py-2.5 rounded-full font-semibold whitespace-nowrap transition-colors text-sm ${
                  filter === f 
                    ? 'bg-[#4f39f6] text-white' 
                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4f39f6]"></div>
            </div>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map(course => (
              <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="relative h-48 bg-slate-100 shrink-0 cursor-pointer" onClick={() => navigate(`/admin/courses/${course._id}/batches`)}>
                  {course.thumbnailImage ? (
                    <img src={course.thumbnailImage} alt={course.courseName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-200">
                      <MdOutlineDashboard size={48} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md text-white uppercase tracking-wider ${
                      course.status === 'Active' ? 'bg-emerald-500' : 'bg-slate-500'
                    }`}>
                      {course.status}
                    </span>
                    <span className="px-2.5 py-1 text-[10px] font-bold rounded-md bg-black/60 text-white backdrop-blur-md">
                      {course.courseCode}
                    </span>
                  </div>
                  {user?.role === 'admin' && (
                    <button className="absolute top-4 right-4 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 hover:text-indigo-600 shadow-sm" onClick={(e) => { e.stopPropagation(); navigate(`/admin/courses/edit/${course._id}`); }}>
                      <FiEdit2 size={14} />
                    </button>
                  )}
                </div>

                <div className="p-6 flex flex-col flex-1">
                  <h3 className="font-extrabold text-[17px] text-slate-900 mb-5 leading-tight">{course.courseName}</h3>
                  
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#eef2ff] flex items-center justify-center text-[#4f39f6] shrink-0">
                      <MdOutlineDashboard size={20} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Skill Level</p>
                      <p className="text-sm font-bold text-slate-700">{course.skillLevel || 'Beginner'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <FiCalendar size={12} /> Start Date
                      </div>
                      <p className="text-sm font-bold text-slate-700">{course.startDate ? new Date(course.startDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                        <FiCalendar size={12} /> End Date
                      </div>
                      <p className="text-sm font-bold text-slate-700">{course.endDate ? new Date(course.endDate).toLocaleDateString() : 'TBD'}</p>
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 rounded-lg text-sm font-bold text-indigo-600 border border-indigo-100">
                      Batches: {course.batches?.length || 0}
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 rounded-lg text-sm font-bold text-slate-600 border border-slate-100">
                      <FiUsers size={14} className="text-slate-400" />
                      Max {course.maxStudents}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* New Course Card */}
            {user?.role === 'admin' && (
              <div 
                onClick={() => navigate('/admin/courses/new')}
                className="bg-white rounded-2xl shadow-sm border border-dashed border-slate-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:border-[#4f39f6] hover:bg-slate-50 transition-colors min-h-[440px] group"
              >
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-6 group-hover:bg-[#4f39f6] group-hover:text-white group-hover:border-transparent transition-colors shadow-sm">
                  <FiPlus size={28} />
                </div>
                <h3 className="font-extrabold text-xl text-slate-800 mb-3 group-hover:text-[#4f39f6] transition-colors">New Course</h3>
                <p className="text-sm font-medium text-slate-500 max-w-[200px] leading-relaxed">Design a new creative curriculum and schedule for the next semester.</p>
              </div>
            )}
          </div>
          )}

        </div>
      </div>
    </div>
  );
}
