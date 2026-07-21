import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_BASE_URL } from '../../config/api';
import {
  FiBookOpen,
  FiCalendar,  
  FiFileText,
  FiClipboard,
  FiUser
} from 'react-icons/fi';

interface Assignment {
  _id: string;
  title: string;
  createdAt: string;
  batchName: string;
  batchCode: string;
  courseName: string;
}

const StudentAssignments: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // States
  const [studentName, setStudentName] = useState('Student User');
  const [studentGrade, setStudentGrade] = useState('5th Grade');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [enrolledCourseNames, setEnrolledCourseNames] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState('all');

  // Fetch student data and assignments from batches
  useEffect(() => {
    const loadData = async () => {
      try {
        const profileId = user?.profileId || 'first';
        
        // 1. Fetch student
        const studentRes = await fetch(`${API_BASE_URL}/api/students/${profileId}`);
        const studentData = await studentRes.json();
        
        if (studentData) {
          if (studentData.name) setStudentName(studentData.name);
          if (studentData.grade) setStudentGrade(studentData.grade);

          const enrolledCourses = studentData.enrolledCourses || [];
          const courseNames = enrolledCourses.map((c: any) => c.courseName);
          setEnrolledCourseNames(courseNames);

          // 2. Fetch all courses to get courseIds for enrolled course names
          const coursesRes = await fetch(`${API_BASE_URL}/api/courses`);
          const coursesData = await coursesRes.json();
          const allCourses = coursesData.courses || [];

          // Match enrolled course names to course IDs
          const matchedCourses = allCourses.filter((c: any) =>
            courseNames.some((name: string) => name.toLowerCase() === c.courseName.toLowerCase())
          );

          // 3. Fetch assignments from batches of each matched course
          const allAssignments: Assignment[] = [];
          for (const course of matchedCourses) {
            try {
              const assignRes = await fetch(`${API_BASE_URL}/api/batches/course/${course._id}/assignments`);
              const assignData = await assignRes.json();
              
              // Extract both batchId and batchName from enrolled courses for this course
              const enrolledBatchesForCourse = enrolledCourses
                .filter((ec: any) => ec.courseName.toLowerCase() === course.courseName.toLowerCase());
                
              const myBatchIds = enrolledBatchesForCourse.map((ec: any) => ec.batchId).filter(Boolean);
              const myBatchNames = enrolledBatchesForCourse.map((ec: any) => ec.batchName).filter(Boolean);

              const filteredData = (myBatchIds.length > 0 || myBatchNames.length > 0)
                ? assignData.filter((a: any) => 
                    (a.batchId && myBatchIds.includes(a.batchId)) || 
                    (!a.batchId && myBatchNames.includes(a.batchName))
                  )
                : assignData; // fallback if older enrollment doesn't have a batch

              // Add courseName from the course if not present in the response
              const enriched = filteredData.map((a: any) => ({
                ...a,
                courseName: a.courseName || course.courseName
              }));
              allAssignments.push(...enriched);
            } catch (err) {
              console.error(`Error fetching assignments for course ${course.courseName}:`, err);
            }
          }

          // Sort by most recent
          allAssignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAssignments(allAssignments);
        }
      } catch (err) {
        console.error('Error fetching assignments:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Filter assignments
  const filteredAssignments = filterCourse === 'all'
    ? assignments
    : assignments.filter(a => a.courseName?.toLowerCase() === filterCourse.toLowerCase());

  // Get unique course names from assignments for filter
  const uniqueCourses = Array.from(new Set(assignments.map(a => a.courseName).filter(Boolean)));

  return (
    <div className="flex flex-col relative overflow-x-hidden pb-12 w-full min-w-0">
        
        {/* Top Header */}
        <header className="flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 sm:py-6 bg-white border-b border-slate-100 sticky top-0 z-30">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Assignments</h1>
            <p className="text-slate-500 text-[13px] sm:text-[14px] mt-0.5">View assignments assigned by your course instructors</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-[14px] font-bold text-slate-900 leading-none">{studentName}</p>
              <p className="text-[11px] font-semibold text-slate-500 mt-1 uppercase tracking-wider">Student • {studentGrade}</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6247df] text-white flex items-center justify-center font-bold text-lg border border-slate-200 shadow-sm cursor-pointer shrink-0" onClick={() => navigate('/student/profile')}>{student.name.charAt(0).toUpperCase()}</div>
          </div>
        </header>

        {/* Outer Container */}
        <div className="px-4 sm:px-6 lg:px-10 mt-6 space-y-6 flex-1">
          
          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Card 1: Total Assignments */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total</p>
                <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {assignments.length.toString().padStart(2, '0')}
                </h2>
                <span className="text-[10px] text-[#4700b3] font-extrabold mt-1 block">Assignments assigned</span>
              </div>
              <div className="p-4 bg-purple-50 text-[#4700b3] rounded-2xl group-hover:bg-[#4700b3] group-hover:text-white transition-colors duration-300">
                <FiClipboard size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Card 2: Courses */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Courses</p>
                <h2 className="text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {uniqueCourses.length.toString().padStart(2, '0')}
                </h2>
                <span className="text-[10px] text-emerald-600 font-extrabold mt-1 block">With assignments</span>
              </div>
              <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <FiBookOpen size={22} className="stroke-[2.5]" />
              </div>
            </div>

            {/* Card 3: Latest */}
            <div className="bg-white rounded-[24px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-6 flex items-center justify-between group hover:shadow-md transition-shadow">
              <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Latest</p>
                <h2 className="text-lg font-black text-slate-950 mt-1 tracking-tight leading-snug truncate max-w-[200px]">
                  {assignments.length > 0 ? assignments[0].title : 'None yet'}
                </h2>
                <span className="text-[10px] text-amber-600 font-extrabold mt-1 block">
                  {assignments.length > 0 
                    ? new Date(assignments[0].createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
                    : 'No assignments'
                  }
                </span>
              </div>
              <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300">
                <FiCalendar size={22} className="stroke-[2.5]" />
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          {uniqueCourses.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">Filter:</span>
              <button
                onClick={() => setFilterCourse('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                  filterCourse === 'all'
                    ? 'bg-[#4700b3] text-white border-[#4700b3]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#4700b3] hover:text-[#4700b3]'
                }`}
              >
                All Courses
              </button>
              {uniqueCourses.map(course => (
                <button
                  key={course}
                  onClick={() => setFilterCourse(course)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                    filterCourse === course
                      ? 'bg-[#4700b3] text-white border-[#4700b3]'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-[#4700b3] hover:text-[#4700b3]'
                  }`}
                >
                  {course}
                </button>
              ))}
            </div>
          )}

          {/* Assignments List */}
          <section className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
                <span className="w-1.5 h-6 bg-[#4700b3] rounded-full inline-block"></span>
                Your Assignments
              </h2>
              <span className="bg-[#4700b3] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                {filteredAssignments.length} {filteredAssignments.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4700b3]"></div>
              </div>
            ) : filteredAssignments.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
                <div className="mx-auto w-16 h-16 bg-purple-50 text-[#4700b3] rounded-2xl flex items-center justify-center mb-4">
                  <FiClipboard size={32} />
                </div>
                <h3 className="font-extrabold text-slate-900 text-lg">No assignments yet</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                  {enrolledCourseNames.length === 0 
                    ? 'Please enroll in a course to see assignments.'
                    : 'Your instructors haven\'t assigned any tasks yet. Check back later!'
                  }
                </p>
                {enrolledCourseNames.length === 0 && (
                  <button
                    onClick={() => navigate('/student/courses')}
                    className="mt-4 px-5 py-2.5 bg-[#4700b3] hover:bg-[#3d0099] text-white font-bold text-xs rounded-xl border-none cursor-pointer transition-colors"
                  >
                    Browse Courses
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {filteredAssignments.map((assignment) => (
                  <div 
                    key={assignment._id} 
                    className="bg-white rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] p-5 flex flex-col hover:shadow-md transition-shadow duration-300"
                  >
                    <div className="flex gap-4 items-start">
                      <div className="p-3 rounded-2xl h-12 w-12 flex items-center justify-center shrink-0 bg-purple-50 text-[#4700b3]">
                        <FiFileText size={20} />
                      </div>
                      <div className="text-left flex-1 min-w-0">
                        <h3 className="font-extrabold text-slate-950 text-[15px] leading-snug">
                          {assignment.title}
                        </h3>
                        <p className="text-slate-400 text-[11px] font-bold mt-1.5 uppercase tracking-wider leading-none">
                          {assignment.courseName}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
                      <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                        <FiCalendar size={13} />
                        {new Date(assignment.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                        {assignment.batchName || assignment.batchCode}
                      </span>
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

export default StudentAssignments;
