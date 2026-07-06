import React, { useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiDroplet, FiVideo, FiImage,
  FiInfo, FiUploadCloud, FiTrash2, FiPlusCircle, FiX, FiCheck
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

// Categories array for the filter tabs
const filterCategories = [
  { name: "All Categories", active: true },
  { name: "Sketching" },
  { name: "Watercolor" },
  { name: "Digital Art" },
  { name: "Oil Painting" },
  { name: "Sculpting" },
  { name: "Animation" }
];

const initialCourses = [
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

const instructorsList = [
  { name: 'Clara Bennett', role: 'Digital Art Expert', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Julian Vance', role: 'Sketching Coach', avatar: 'https://i.pravatar.cc/150?img=11' },
  { name: 'David Henderson', role: 'Sculpting Specialist', avatar: 'https://i.pravatar.cc/150?img=12' },
  { name: 'Riley Chen', role: 'Animation Lead', avatar: 'https://i.pravatar.cc/150?img=9' }
];

export default function AdminCoursePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [coursesList, setCoursesList] = useState(initialCourses);
  const [activeCategory, setActiveCategory] = useState("All Categories");
  const [searchQuery, setSearchQuery] = useState("");

  const isCreating = searchParams.get('mode') === 'create';

  // Form states for creation
  const [courseTitle, setCourseTitle] = useState('');
  const [batchName, setBatchName] = useState('');
  const [category, setCategory] = useState('Select Category');
  const [difficultyLevel, setDifficultyLevel] = useState('Beginner');
  const [courseDescription, setCourseDescription] = useState('');
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [basePrice, setBasePrice] = useState('');
  const [duration, setDuration] = useState(8);
  const [enrollmentActive, setEnrollmentActive] = useState(true);
  const [certificateIncluded, setCertificateIncluded] = useState(false);
  const [assignedInstructor, setAssignedInstructor] = useState(instructorsList[0]);
  const [modules, setModules] = useState([
    { id: 1, title: 'Module 1: Introduction & Fundamentals', subtext: '3 Lessons • 45 mins total' },
    { id: 2, title: 'Module 2: Color Theory and Blending', subtext: '5 Lessons • 1h 20 mins total' }
  ]);

  // Preview Modal state
  const [showPreview, setShowPreview] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load image as Base64 Data URL
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Switch/cycle instructors
  const handleCycleInstructor = () => {
    const currentIndex = instructorsList.findIndex(inst => inst.name === assignedInstructor.name);
    const nextIndex = (currentIndex + 1) % instructorsList.length;
    setAssignedInstructor(instructorsList[nextIndex]);
  };

  // Add module dynamically
  const handleAddModule = () => {
    const nextId = modules.length + 1;
    const defaultTitles = [
      `Module ${nextId}: Composition & Sketching`,
      `Module ${nextId}: Advanced Perspective & Volume`,
      `Module ${nextId}: Lighting and Matte Painting`,
      `Module ${nextId}: Final Concept Portfolio`
    ];
    const newTitle = defaultTitles[(nextId - 1) % defaultTitles.length];
    setModules([...modules, {
      id: nextId,
      title: newTitle,
      subtext: '4 Lessons • 1h 00 mins total'
    }]);
  };

  // Add lesson to the last module
  const handleAddLesson = () => {
    if (modules.length === 0) return;
    const updated = [...modules];
    const lastModule = updated[updated.length - 1];
    const lessonsMatch = lastModule.subtext.match(/(\d+) Lessons/);
    const minsMatch = lastModule.subtext.match(/(\d+) mins/);
    let lessons = lessonsMatch ? parseInt(lessonsMatch[1]) : 0;
    let mins = minsMatch ? parseInt(minsMatch[1]) : 0;
    
    lessons += 1;
    mins += 15; // add 15 minutes per lesson
    
    lastModule.subtext = `${lessons} Lessons • ${mins} mins total`;
    setModules(updated);
  };

  const getCategoryIcon = (catName: string) => {
    switch (catName) {
      case 'Sketching':
      case 'Sketching & Charcoal':
        return <PiPencilSimpleBold className="w-3.5 h-3.5 mr-1.5" />;
      case 'Watercolor':
        return <FiDroplet className="w-3.5 h-3.5 mr-1.5" />;
      case 'Digital Art':
      case 'Digital Media':
        return <PiPencilSimpleBold className="w-3.5 h-3.5 mr-1.5" />;
      case 'Oil Painting':
        return <FiImage className="w-3.5 h-3.5 mr-1.5" />;
      case 'Sculpting':
        return <BiCube className="w-3.5 h-3.5 mr-1.5" />;
      case 'Animation':
        return <FiVideo className="w-3.5 h-3.5 mr-1.5" />;
      default:
        return <FiImage className="w-3.5 h-3.5 mr-1.5" />;
    }
  };

  // Create course and append to state
  const handleCreateCourse = () => {
    if (!courseTitle.trim()) {
      alert("Please enter a course title.");
      return;
    }

    const priceText = basePrice ? `$${parseFloat(basePrice).toFixed(2)}/mo` : "$0.00/mo";

    const newCourse = {
      id: Date.now(),
      title: courseTitle,
      category: category === 'Select Category' ? 'General Art' : category,
      categoryIcon: getCategoryIcon(category),
      level: difficultyLevel,
      levelColor: difficultyLevel === 'Senior' 
        ? "text-emerald-600 bg-white" 
        : difficultyLevel === 'Intermediate' 
          ? "text-amber-600 bg-white" 
          : "text-indigo-600 bg-white",
      price: priceText,
      instructor: assignedInstructor.name,
      instructorAvatar: assignedInstructor.avatar,
      students: 0,
      image: coverImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
      progress: "w-0 bg-indigo-600"
    };

    setCoursesList([newCourse, ...coursesList]);
    setSearchParams({}); // Navigate back to courses list
    resetForm();
  };

  const resetForm = () => {
    setCourseTitle('');
    setBatchName('');
    setCategory('Select Category');
    setDifficultyLevel('Beginner');
    setCourseDescription('');
    setCoverImage(null);
    setBasePrice('');
    setDuration(8);
    setEnrollmentActive(true);
    setCertificateIncluded(false);
    setAssignedInstructor(instructorsList[0]);
    setModules([
      { id: 1, title: 'Module 1: Introduction & Fundamentals', subtext: '3 Lessons • 45 mins total' },
      { id: 2, title: 'Module 2: Color Theory and Blending', subtext: '5 Lessons • 1h 20 mins total' }
    ]);
  };

  // Filter courses based on active category tabs and search input
  const filteredCourses = coursesList.filter(course => {
    const matchesCategory = activeCategory === "All Categories" || course.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
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
      <main className="flex-1 flex flex-col bg-slate-50/30 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0 sticky top-0 z-30">
          <div className="relative w-80">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search academy records..."
              className="w-full pl-10 pr-4 py-2 bg-[#F3F4F6]/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 placeholder:text-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative p-1 text-slate-500 hover:text-slate-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Help Question Icon */}
            <button className="p-1 text-slate-500 hover:text-slate-800 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
              </svg>
            </button>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900 leading-tight">Alex Thompson</span>
                <span className="block text-[11px] text-slate-400 font-medium">Head Administrator</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=200&auto=format&fit=crop"
                alt="Alex Thompson"
                className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm"
              />
            </div>
          </div>
        </header>

        {isCreating ? (
          /* Create New Course Page View */
          <div className="p-8 flex-1 flex flex-col gap-6 select-none">
            
            {/* Header / Breadcrumb Row */}
            <div className="flex justify-between items-start">
              <div>
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2 font-medium">
                  <button onClick={() => setSearchParams({})} className="hover:text-[#6247df] transition-colors border-none bg-transparent p-0 cursor-pointer font-medium">
                    Courses
                  </button>
                  <span className="text-slate-300">›</span>
                  <span className="text-[#6247df] font-semibold">Add New Course</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1 leading-tight">Create New Course</h2>
                <p className="text-gray-500 text-sm">Design a new creative journey for your academy students.</p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSearchParams({})}
                  className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
                >
                  Discard Draft
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="px-5 py-2.5 bg-[#6247df] hover:bg-[#5035c9] text-white rounded-xl font-bold text-sm transition-colors shadow-md shadow-purple-900/10 cursor-pointer"
                >
                  Save & Publish
                </button>
              </div>
            </div>

            {/* Form Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-24">
              
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* General Information Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-violet-50 text-[#6247df] flex items-center justify-center">
                      <FiInfo className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">General Information</h3>
                  </div>

                  {/* Course Title */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Advanced Watercolor Mastery"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                      value={courseTitle}
                      onChange={(e) => setCourseTitle(e.target.value)}
                    />
                  </div>

                  {/* Batch Name */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Batch Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Summer 2024 Art Intensive"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                      value={batchName}
                      onChange={(e) => setBatchName(e.target.value)}
                    />
                  </div>

                  {/* Category & Difficulty Level */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-600">Category</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option disabled>Select Category</option>
                        <option>Sketching</option>
                        <option>Watercolor</option>
                        <option>Digital Art</option>
                        <option>Oil Painting</option>
                        <option>Sculpting</option>
                        <option>Animation</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-sm font-semibold text-slate-600">Difficulty Level</label>
                      <select
                        className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm appearance-none cursor-pointer font-sans"
                        value={difficultyLevel}
                        onChange={(e) => setDifficultyLevel(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`, backgroundPosition: 'right 1rem center', backgroundSize: '1.25em', backgroundRepeat: 'no-repeat' }}
                      >
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Advanced</option>
                      </select>
                    </div>
                  </div>

                  {/* Course Description */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Course Description</label>
                    <textarea
                      rows={5}
                      placeholder="Describe the course curriculum, learning objectives, and artistic outcomes..."
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm resize-none font-sans"
                      value={courseDescription}
                      onChange={(e) => setCourseDescription(e.target.value)}
                    />
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
                </div>

                {/* Curriculum Structure Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-purple-50 text-[#6247df] flex items-center justify-center">
                        <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25A2.25 2.25 0 0 1 13.5 8.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                        </svg>
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
                      <h3 className="font-bold text-lg text-slate-900">Curriculum Structure</h3>
                    </div>
                    <button
                      onClick={handleAddModule}
                      className="text-sm font-bold text-[#6247df] bg-transparent border-none cursor-pointer hover:underline flex items-center gap-1.5"
                    >
                      <FiPlusCircle className="w-4.5 h-4.5" />
                      Add Module
                    </button>
                  </div>

                  {/* Modules List */}
                  <div className="space-y-3">
                    {modules.map((mod) => (
                      <div
                        key={mod.id}
                        className="bg-[#eef2ff]/35 border border-indigo-200/50 rounded-2xl p-4 flex items-center gap-4 transition-all"
                      >
                        {/* Drag Handle SVG */}
                        <div className="text-indigo-400 cursor-grab flex-shrink-0">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="9" cy="8" r="1.5" />
                            <circle cx="9" cy="12" r="1.5" />
                            <circle cx="9" cy="16" r="1.5" />
                            <circle cx="15" cy="8" r="1.5" />
                            <circle cx="15" cy="12" r="1.5" />
                            <circle cx="15" cy="16" r="1.5" />
                          </svg>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-slate-800 leading-normal">{mod.title}</h4>
                          <span className="text-xs text-slate-400 font-medium block mt-0.5">{mod.subtext}</span>
                        </div>

                        {/* Action buttons on module */}
                        <button 
                          onClick={() => setModules(modules.filter(m => m.id !== mod.id))}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                    <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      <FiUsers className="w-4 h-4 text-gray-400" />
                      <div className="text-xs font-bold text-gray-700">
                        {batch.enrolled} / {batch.capacity}
                      </div>
                    ))}
                  </div>

                  {/* Add Lesson Dashed box */}
                  <div className="border-2 border-dashed border-indigo-200/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-indigo-50/10">
                    <p className="text-sm font-semibold text-slate-500 mb-3">Add more modules to complete the journey</p>
                    <button
                      onClick={handleAddLesson}
                      className="px-5 py-2 bg-indigo-100/50 hover:bg-indigo-100 text-[#6247df] rounded-xl font-bold text-xs transition-colors cursor-pointer border-none"
                    >
                      Add Lesson
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column (1/3 width) */}
              <div className="space-y-8">
                
                {/* Course Cover Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-4">
                  <h3 className="font-bold text-base text-slate-900">Course Cover</h3>
                  
                  {/* File Input hidden */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleImageChange}
                  />

                  {/* Dashed cover block */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-indigo-200 bg-indigo-50/20 hover:bg-indigo-50/40 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[160px] relative overflow-hidden group"
                  >
                    {coverImage ? (
                      <>
                        <img src={coverImage} className="absolute inset-0 w-full h-full object-cover" alt="Course Cover Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                          Change Cover Image
                        </div>
                        {/* Delete preview button */}
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setCoverImage(null);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 bg-white text-slate-700 hover:text-red-500 rounded-full flex items-center justify-center shadow-md border-none cursor-pointer z-10 animate-fade-in"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-[#6247df] flex items-center justify-center mb-3">
                          <FiUploadCloud className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">Click or drag to upload</span>
                        <span className="text-[10px] text-gray-400 mt-1">Recommended: 1280x720 (PNG, JPG)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Financials & Logistics Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <h3 className="font-bold text-base text-slate-900">Financials & Logistics</h3>

                  {/* Price */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Base Course Price</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-sm font-sans">$</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-2.5 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Duration (Weeks)</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[4, 8, 12, 16].map((week) => (
                        <button
                          key={week}
                          onClick={() => setDuration(week)}
                          className={`py-2.5 px-3 rounded-xl text-sm font-bold transition-all cursor-pointer border-none ${
                            duration === week
                              ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/20'
                              : 'bg-indigo-50/50 text-[#6247df] hover:bg-indigo-50'
                          }`}
                        >
                          {week}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Enrollment Active Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-semibold text-slate-600">Enrollment Active</span>
                    <button
                      onClick={() => setEnrollmentActive(!enrollmentActive)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer border-none focus:outline-none flex ${
                        enrollmentActive ? 'bg-[#6247df]' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        enrollmentActive ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>

                  {/* Certificate Included Toggle */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-600">Certificate Included</span>
                    <button
                      onClick={() => setCertificateIncluded(!certificateIncluded)}
                      className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer border-none focus:outline-none flex ${
                        certificateIncluded ? 'bg-[#6247df]' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        certificateIncluded ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>

                {/* Assign Instructor Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-4">
                  <h3 className="font-bold text-base text-slate-900">Assign Instructor</h3>
                  
                  {/* Instructor Box */}
                  <div 
                    onClick={handleCycleInstructor}
                    className="flex items-center gap-3 p-3 bg-[#F9FAFB] border border-slate-200/50 rounded-2xl cursor-pointer hover:bg-slate-50 transition-all select-none"
                  >
                    <img
                      src={assignedInstructor.avatar}
                      alt={assignedInstructor.name}
                      className="w-12 h-12 rounded-full object-cover border border-white shadow-sm flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-slate-800 leading-tight">{assignedInstructor.name}</span>
                      <span className="block text-xs text-slate-400 font-medium mt-0.5">{assignedInstructor.role}</span>
                    </div>

                    {/* Swap Arrows Icon */}
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200/60 shadow-sm flex items-center justify-center text-slate-500 flex-shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Sticky Footer */}
            <div className="fixed bottom-0 left-[280px] right-0 h-20 bg-white border-t border-slate-100 flex items-center justify-between px-8 z-20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
              {/* Overlapping Admin avatars */}
              <div className="flex items-center gap-3">
                <div className="flex -space-x-3">
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                    AT
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                    JD
                  </div>
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#6247df] text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                    MK
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Currently being edited by 3 admins</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-6 py-3 bg-white border border-slate-200 text-[#6247df] font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Preview Course
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="px-6 py-3 bg-[#6247df] hover:bg-[#5035c9] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-900/20 transition-all cursor-pointer border-none"
                >
                  Create Course
                </button>
              </div>
            </div>

            {/* Preview Modal Popup */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-xl text-slate-900">Course Detail Preview</h3>
                    <button 
                      onClick={() => setShowPreview(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Cover Image & Basic Info Banner */}
                    <div className="relative h-48 rounded-2xl overflow-hidden bg-slate-100">
                      {coverImage ? (
                        <img src={coverImage} className="w-full h-full object-cover" alt="Preview Cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-indigo-50/30">
                          <FiImage className="w-12 h-12 text-slate-300 mb-2" />
                          <span className="text-xs font-semibold">No Cover Uploaded</span>
                        </div>
                      )}
                      
                      {/* Price Badge */}
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-sm font-bold text-white bg-slate-900/75 backdrop-blur-sm shadow-md">
                        {basePrice ? `$${parseFloat(basePrice).toFixed(2)}/mo` : "$0.00/mo"}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {/* Badge Row */}
                      <div className="flex gap-2">
                        <span className="bg-purple-100 text-[#6247df] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          {category === 'Select Category' ? 'General Art' : category}
                        </span>
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          {difficultyLevel}
                        </span>
                        <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                          {duration} Weeks
                        </span>
                      </div>

                      {/* Course Titles */}
                      <div>
                        <h2 className="text-2xl font-extrabold text-slate-900">{courseTitle || 'Untitled New Course'}</h2>
                        {batchName && <p className="text-slate-400 font-semibold text-sm mt-1">{batchName}</p>}
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</span>
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
                          {courseDescription || 'No description provided yet.'}
                        </p>
                      </div>

                      {/* Instructor details */}
                      <div className="border-t border-slate-100 pt-4 flex items-center gap-3">
                        <img 
                          src={assignedInstructor.avatar} 
                          alt={assignedInstructor.name} 
                          className="w-10 h-10 rounded-full object-cover border border-white shadow-md"
                        />
                        <div>
                          <span className="block text-xs text-slate-400 font-semibold uppercase tracking-wider">Instructor</span>
                          <span className="block text-sm font-bold text-slate-800">{assignedInstructor.name}</span>
                        </div>
                      </div>

                      {/* Curriculum List */}
                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Curriculum ({modules.length} Modules)</span>
                        <div className="space-y-2">
                          {modules.map((mod) => (
                            <div key={mod.id} className="p-3.5 bg-slate-50 rounded-xl flex items-center justify-between">
                              <div>
                                <span className="font-bold text-sm text-slate-800 block">{mod.title}</span>
                                <span className="text-xs text-slate-400 font-semibold mt-0.5 block">{mod.subtext}</span>
                              </div>
                              <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <FiCheck className="w-3.5 h-3.5" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3 font-sans">
                    <button
                      onClick={() => setShowPreview(false)}
                      className="px-5 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm shadow-sm hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      Close Preview
                    </button>
                    <button
                      onClick={() => {
                        setShowPreview(false);
                        handleCreateCourse();
                      }}
                      className="px-5 py-2 bg-[#6247df] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-900/10 hover:bg-[#5035c9] transition-colors cursor-pointer border-none"
                    >
                      Publish Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Course List View */
          <div className="p-8 flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Courses</h2>
                <p className="text-gray-500 text-sm">Manage and curate the creative journey for our talented artists.</p>
              </div>
              <button 
                onClick={() => setSearchParams({ mode: 'create' })}
                className="flex items-center gap-2 bg-[#6247df] hover:bg-[#5035c9] text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-md shadow-purple-900/10 cursor-pointer border-none"
              >
                <FiPlus className="w-4 h-4" />
                Create Course
              </button>
            </div>

            {/* Categories tabs */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {filterCategories.map((cat) => {
                const isActive = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setActiveCategory(cat.name)}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer border-none ${
                      isActive
                        ? 'bg-[#6247df] text-white shadow-md shadow-purple-900/15'
                        : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredCourses.map((course) => (
                <div key={course.id} className="bg-white rounded-3xl p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-gray-100/50 flex flex-col group hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-all">
                  {/* Image Container */}
                  <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3] bg-slate-100">
                    <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                    {/* Level Badge */}
                    <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-bold shadow-sm ${course.levelColor}`}>
                      {course.level}
                    </div>

                    {/* Price Badge */}
                    <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold text-white bg-slate-900/60 backdrop-blur-sm">
                      {course.price}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="px-1.5 pb-2 flex-1 flex flex-col">
                    <h3 className="font-extrabold text-base text-gray-900 mb-1 leading-snug">{course.title}</h3>
                    <div className="flex items-center text-xs text-slate-400 mb-4 font-semibold uppercase tracking-wider">
                      {course.categoryIcon}
                      {course.category}
                    </div>

                    {/* Instructor & Students */}
                    <div className="flex items-center justify-between mt-auto mb-4 border-t border-slate-100/60 pt-3">
                      <div className="flex items-center gap-2">
                        <img src={course.instructorAvatar} alt={course.instructor} className="w-7 h-7 rounded-full object-cover border border-gray-100" />
                        <div className="text-[11px] font-bold text-gray-700 leading-tight">
                          <span className="block text-gray-400 font-medium text-[9px] uppercase tracking-wider leading-none mb-0.5">Instructor</span>
                          <span className="block">{course.instructor}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-gray-400">
                        <BsPersonFill className="w-3.5 h-3.5" />
                        <div className="text-[11px] font-bold text-gray-700 leading-tight">
                          <span className="block text-gray-900 leading-none">{course.students}</span>
                          <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Students</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full ${course.progress}`}></div>
                    </div>
                  </div>
                </div>
              ))}

              {/* New Course Card */}
              <button 
                onClick={() => setSearchParams({ mode: 'create' })}
                className="bg-white/50 border-2 border-dashed border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors group h-full min-h-[320px] cursor-pointer"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FiPlus className="w-5 h-5 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-2">New Course</h3>
                <p className="text-sm text-slate-500 max-w-[140px]">Click to design a new creative curriculum</p>
              </button>
            </div>
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
        )}
      </main>
    </div>
  );
}

