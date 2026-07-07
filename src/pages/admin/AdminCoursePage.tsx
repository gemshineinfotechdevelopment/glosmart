import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiPlus, FiMoreVertical, FiClock, FiCalendar, FiUsers
} from 'react-icons/fi';
import { PiPalette, PiMonitor, PiPencilSimpleBold } from 'react-icons/pi';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminCourse1 from '../../assets/admin-course1.png';
import adminCourse2 from '../../assets/admin-course2.png';
import adminCourse3 from '../../assets/admin-course3.png';
import adminCourse4 from '../../assets/admin-course4.png';

const filterTabs = [
  "All Batches", "Active", "Upcoming", "Completed", "Morning", "Evening", "Weekend"
];

const batches = [
  {
    id: 1,
    title: "Pencil Drawing \u2013 Batch A",
    status: "ACTIVE",
    statusColor: "bg-emerald-500",
    batch: "BAT-101",
    image: adminCourse1,
    course: "Graphite Art",
    courseIcon: <PiPencilSimpleBold className="w-4 h-4 text-indigo-500" />,
    courseIconBg: "bg-indigo-50",
    time: "10:00 - 12:00",
    schedule: "Mon, Wed",
    progressText: "70% \u2022 18 days left",
    progressValue: "70%",
    progressColor: "bg-emerald-500",
    progressTextColor: "text-emerald-600",
    instructor: "Mr. Julian",
    instructorAvatar: "https://i.pravatar.cc/150?img=11",
    enrolled: 24,
    capacity: 30,
    type: "progress"
  },
  {
    id: 2,
    title: "Watercolor \u2013 Batch B",
    status: "ACTIVE",
    statusColor: "bg-orange-400",
    batch: "BAT-102",
    image: adminCourse2,
    course: "Water Scapes",
    courseIcon: <PiPalette className="w-4 h-4 text-orange-500" />,
    courseIconBg: "bg-orange-50",
    time: "14:00 - 16:00",
    schedule: "Tue, Thu",
    progressText: "45% \u2022 30 days left",
    progressValue: "45%",
    progressColor: "bg-orange-400",
    progressTextColor: "text-orange-600",
    instructor: "Ms. Clara",
    instructorAvatar: "https://i.pravatar.cc/150?img=5",
    enrolled: 18,
    capacity: 25,
    type: "progress"
  },
  {
    id: 3,
    title: "Digital Art \u2013 Batch C",
    status: "UPCOMING",
    statusColor: "bg-cyan-500",
    batch: "BAT-103",
    image: adminCourse3,
    course: "Procreate 101",
    courseIcon: <PiMonitor className="w-4 h-4 text-cyan-500" />,
    courseIconBg: "bg-cyan-50",
    time: "09:00 - 13:00",
    schedule: "Weekends",
    progressText: "Starts in 45 days",
    progressValue: "15%",
    progressColor: "bg-cyan-500",
    progressTextColor: "text-cyan-600",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    enrolled: 15,
    capacity: 20,
    type: "timeline"
  },
  {
    id: 4,
    title: "Digital Art \u2013 Batch D",
    status: "WEEKEND",
    statusColor: "bg-emerald-400",
    batch: "BAT-104",
    image: adminCourse4,
    course: "Watercolour World",
    courseIcon: <PiMonitor className="w-4 h-4 text-emerald-500" />,
    courseIconBg: "bg-emerald-50",
    time: "12:00 - 13:00",
    schedule: "Weekends",
    progressText: "Starts in 45 days",
    progressValue: "15%",
    progressColor: "bg-emerald-500",
    progressTextColor: "text-emerald-600",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    enrolled: 15,
    capacity: 20,
    type: "timeline"
  },
  {
    id: 5,
    title: "Digital Art \u2013 Batch E",
    status: "UPCOMING",
    statusColor: "bg-cyan-500",
    batch: "BAT-105",
    image: adminCourse1,
    course: "Oil Portraits",
    courseIcon: <PiMonitor className="w-4 h-4 text-cyan-500" />,
    courseIconBg: "bg-cyan-50",
    time: "13:00 - 16:00",
    schedule: "Weekends",
    progressText: "Starts in 45 days",
    progressValue: "15%",
    progressColor: "bg-cyan-500",
    progressTextColor: "text-cyan-600",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    enrolled: 15,
    capacity: 20,
    type: "timeline"
  }
];

export default function AdminCoursePage() {
  const [activeTab, setActiveTab] = useState("All Batches");
  const navigate = useNavigate();

  const filteredBatches = batches.filter(batch => {
    if (activeTab === "All Batches") return true;
    if (activeTab === "Active") return batch.status === "ACTIVE";
    if (activeTab === "Upcoming") return batch.status === "UPCOMING";
    if (activeTab === "Completed") return batch.status === "COMPLETED";
    if (activeTab === "Weekend") return batch.status === "WEEKEND" || batch.schedule.toLowerCase().includes("weekend");
    if (activeTab === "Morning") {
      const startHour = parseInt(batch.time.split(':')[0]);
      return startHour < 12;
    }
    if (activeTab === "Evening") {
      const startHour = parseInt(batch.time.split(':')[0]);
      return startHour >= 16;
    }
    return true;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD] font-sans text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#FAFBFF]">
        {/* Content Area */}
        <div className="p-10 flex-1 overflow-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Batch Management</h2>
              <p className="text-gray-500">
                Streamline academy operations: track active batches, monitor teacher performance, and manage student enrollment schedules.
              </p>
            </div>
            <button 
              onClick={() => navigate('/admin/courses/new')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl text-sm font-semibold transition-all shadow-[0_4px_14px_rgba(79,70,229,0.39)] shrink-0"
            >
              <FiPlus className="w-5 h-5" />
              Create New Batch
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap items-center gap-3 mb-10">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-colors ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                    : 'bg-white text-gray-600 border border-gray-200/60 hover:bg-gray-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {filteredBatches.map((batch) => (
              <div key={batch.id} className="bg-white rounded-[24px] p-5 shadow-[0_2px_20px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300">
                {/* Image Container */}
                <div className="relative rounded-[16px] overflow-hidden mb-5 aspect-[4/2.5]">
                  <img src={batch.image} alt={batch.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  
                  {/* Overlay Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <div className={`px-2.5 py-1 rounded text-[10px] font-bold text-white tracking-wide ${batch.statusColor}`}>
                      {batch.status}
                    </div>
                    <div className="px-2.5 py-1 rounded bg-black/40 backdrop-blur-md text-[10px] font-bold text-white tracking-wide">
                      {batch.batch}
                    </div>
                  </div>
                  
                  <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 hover:text-gray-900 hover:bg-white transition-colors">
                    <FiMoreVertical className="w-4 h-4" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-1 pb-1 flex-1 flex flex-col">
                  <h3 className="font-bold text-xl text-gray-900 mb-5">{batch.title}</h3>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${batch.courseIconBg}`}>
                      {batch.courseIcon}
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Course</div>
                      <div className="font-semibold text-sm text-gray-900 leading-none">{batch.course}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                        <FiClock className="w-4 h-4 text-orange-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Time</div>
                        <div className="font-semibold text-sm text-gray-900 leading-none">{batch.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                        <FiCalendar className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider leading-none mb-1">Schedule</div>
                        <div className="font-semibold text-sm text-gray-900 leading-none">{batch.schedule}</div>
                      </div>
                    </div>
                  </div>

                  {/* Progress / Timeline */}
                  <div className="mb-6 mt-auto">
                    <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        {batch.type === 'progress' ? 'Progress' : 'Launch Timeline'}
                      </span>
                      <span className={`text-xs font-bold ${batch.progressTextColor}`}>
                        {batch.progressText}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${batch.progressColor}`} style={{ width: batch.progressValue }}></div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-px bg-gray-100 mb-5"></div>

                  {/* Instructor & Students */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img src={batch.instructorAvatar} alt={batch.instructor} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
                      <div>
                        <div className="font-bold text-sm text-gray-900 leading-tight">{batch.instructor}</div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Instructor</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      <div className="text-xs font-bold text-gray-700">
                        {batch.enrolled} / {batch.capacity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* New Batch Card */}
            <button 
              onClick={() => navigate('/admin/courses/new')}
              className="bg-transparent border-2 border-dashed border-gray-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group h-full min-h-[400px]"
            >
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <FiPlus className="w-6 h-6 text-gray-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">New Batch</h3>
              <p className="text-sm text-gray-500 max-w-[180px] leading-relaxed">
                Design a new creative curriculum and schedule for the next semester.
              </p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

