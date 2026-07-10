import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCloud, FiInfo, FiPlus, FiList } from 'react-icons/fi';
import { BsArrowLeftRight } from 'react-icons/bs';
import AdminSidebar from '../../components/admin/AdminSidebar';

export default function AdminCreateCoursePage() {
  const navigate = useNavigate();
  const [courseTitle, setCourseTitle] = useState('');
  const [batchName, setBatchName] = useState('');
  const [instructorName, setInstructorName] = useState('');
  const [category, setCategory] = useState('');

  const handleSaveAndPublish = async () => {
    if (!courseTitle) {
      alert("Please enter a course title");
      return;
    }
    const newBatch = {
      courseName: courseTitle,
      batchName: batchName || `${courseTitle} - New Batch`,
      instructor: instructorName || 'Unassigned',
      category: category,
      batchCode: `BAT-${Date.now().toString().slice(-3)}`,
      status: "UPCOMING",
      statusColor: "bg-teal-500",
      courseIconBg: "bg-teal-50",
      time: "10:00 AM",
      schedule: "Mon, Wed",
      progressLabel: "LAUNCH TIMELINE",
      progressText: "Starts soon",
      progressColor: "text-teal-600",
      progressWidth: "w-0",
      progressBg: "bg-teal-500",
      students: 0,
      maxStudents: 30,
      image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop"
    };

    try {
      const response = await fetch('http://localhost:5000/api/batches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBatch),
      });
      if (response.ok) {
        navigate('/admin/courses'); // adjust based on routing
      } else {
        alert("Failed to create course");
      }
    } catch (error) {
      console.error("Error creating course", error);
      alert("Error creating course");
    }
  };
  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD] font-sans text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#FAFBFF]">
        {/* Content Area */}
        <div className="p-10 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="max-w-2xl">
              <div className="text-sm font-medium text-gray-400 mb-2">
                Courses <span className="mx-2">&rsaquo;</span> <span className="text-[#6247df]">Add New Course</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create New Course</h2>
              <p className="text-gray-500">
                Design a new creative journey for your academy students.
              </p>
            </div>
            <div className="flex items-center gap-4 shrink-0">
              <button 
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Discard Draft
              </button>
              <button 
                onClick={handleSaveAndPublish}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-[#6247df] hover:bg-[#5035c9] transition-colors shadow-[0_4px_14px_rgba(98,71,223,0.39)]"
              >
                Save & Publish
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              {/* General Information */}
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <FiInfo className="w-4 h-4 text-[#6247df]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">General Information</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                      placeholder="e.g. Advanced Watercolor Mastery"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Batch Name</label>
                    <input
                      type="text"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                      placeholder="e.g. Summer 2024 Art Intensive"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor Name</label>
                    <input
                      type="text"
                      value={instructorName}
                      onChange={(e) => setInstructorName(e.target.value)}
                      placeholder="e.g. Mrs. Aris"
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm appearance-none bg-white"
                      >
                        <option>Select Category</option>
                        <option>Sketching</option>
                        <option>Watercolor</option>
                        <option>Digital Art</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                      <select className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm appearance-none bg-white">
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Description</label>
                    <textarea
                      placeholder="Describe the course curriculum, learning objectives, and artistic outcomes..."
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-[#6247df] transition-colors text-sm resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Course Cover */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4">Course Cover</h3>
                <div className="w-full h-32 rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50/50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-indigo-50 transition-colors">
                  <FiCloud className="w-6 h-6 text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Click or drag to upload</p>
                  <p className="text-[10px] text-gray-400 mt-1">Recommended: 1280x720 (PNG, JPG)</p>
                </div>
              </div>

              {/* Financials & Logistics */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-6">Financials & Logistics</h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-3">Course Timing</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-900 text-center">10:00 AM</div>
                      <div className="px-4 py-2.5 rounded-lg bg-indigo-50 border border-indigo-100 text-sm font-medium text-indigo-900 text-center">12:00 PM</div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-3">Duration (Weeks)</label>
                    <div className="flex gap-2">
                      {['4', '8', '12', '16'].map((w) => (
                        <div key={w} className={`flex-1 py-2 rounded-lg text-center text-sm font-medium cursor-pointer transition-colors ${w === '8' ? 'bg-[#6247df] text-white' : 'bg-indigo-50 border border-indigo-100 text-indigo-900'}`}>
                          {w}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-3">Duration (Days)</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Satur'].map((d) => (
                        <div key={d} className={`py-2 rounded-lg text-center text-sm font-medium cursor-pointer transition-colors ${['Tue', 'Fri'].includes(d) ? 'bg-[#6247df] text-white' : 'bg-indigo-50 border border-indigo-100 text-indigo-900'}`}>
                          {d}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-gray-700">Enrollment Active</span>
                    <div className="w-10 h-6 bg-[#6247df] rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Certificate Included</span>
                    <div className="w-10 h-6 bg-gray-200 rounded-full relative cursor-pointer">
                      <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Assign Instructor */}
              <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <h3 className="text-base font-bold text-gray-900 mb-4">Assign Instructor</h3>
                <div className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors cursor-pointer bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <img src="https://i.pravatar.cc/150?img=5" alt="Clara Bennett" className="w-10 h-10 rounded-full object-cover shadow-sm" />
                    <div>
                      <div className="text-sm font-bold text-gray-900 leading-tight">Clara Bennett</div>
                      <div className="text-[10px] text-gray-500 mt-0.5">Digital Art Expert</div>
                    </div>
                  </div>
                  <BsArrowLeftRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Bottom Row - Curriculum */}
            <div className="lg:col-span-3 pb-10">
              <div className="bg-white rounded-[24px] p-8 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                      <FiList className="w-4 h-4 text-[#6247df]" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Curriculum Structure</h3>
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-semibold text-[#6247df] hover:text-[#5035c9] transition-colors">
                    <FiPlus className="w-4 h-4" /> Add Module
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Module 1 */}
                  <div className="flex items-center p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex flex-col items-center justify-center gap-0.5 mr-4 text-indigo-400 opacity-60">
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Module 1: Introduction & Fundamentals</div>
                      <div className="text-xs text-gray-500 mt-1">3 Lessons &bull; 45 mins total</div>
                    </div>
                  </div>

                  {/* Module 2 */}
                  <div className="flex items-center p-5 rounded-xl border border-gray-100 bg-gray-50/50">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100/50 flex flex-col items-center justify-center gap-0.5 mr-4 text-indigo-400 opacity-60">
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                      <div className="flex gap-0.5"><div className="w-1 h-1 bg-current rounded-full"></div><div className="w-1 h-1 bg-current rounded-full"></div></div>
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Module 2: Color Theory and Blending</div>
                      <div className="text-xs text-gray-500 mt-1">5 Lessons &bull; 1h 20 mins total</div>
                    </div>
                  </div>

                  {/* Add more block */}
                  <div className="w-full p-8 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/30 flex flex-col items-center justify-center gap-3">
                    <p className="text-sm font-medium text-gray-500">Add more modules to complete the journey</p>
                    <button className="px-5 py-2 rounded-lg bg-indigo-100 text-[#6247df] text-sm font-semibold hover:bg-indigo-200 transition-colors">
                      Add Lesson
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
