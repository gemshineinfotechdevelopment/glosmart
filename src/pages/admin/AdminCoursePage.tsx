import React, { useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiDroplet, FiVideo, FiImage,
  FiInfo, FiUploadCloud, FiTrash2, FiPlusCircle, FiX, FiCheck
} from 'react-icons/fi';
import { BiCube } from 'react-icons/bi';
import { PiPencilSimpleBold } from 'react-icons/pi';
import AdminSidebar from '../../components/admin/AdminSidebar';

// Categories array for the filter tabs
const filterCategories = [
  { name: "All Batches", active: true },
  { name: "Active" },
  { name: "Upcoming" },
  { name: "Completed" },
  { name: "Morning" },
  { name: "Evening" },
  { name: "Weekend" }
];

const initialBatches = [
  {
    id: 1,
    batchName: "Pencil Drawing – Batch A",
    status: "ACTIVE",
    statusColor: "bg-emerald-500",
    batchCode: "BAT-101",
    courseName: "Graphite Art",
    courseIcon: <PiPencilSimpleBold className="w-5 h-5 text-[#5B43D6]" />,
    courseIconBg: "bg-indigo-50",
    time: "10:00 - 12:00",
    schedule: "Mon, Wed",
    progressLabel: "PROGRESS",
    progressText: "70% • 18 days left",
    progressColor: "text-emerald-500",
    progressWidth: "w-[70%]",
    progressBg: "bg-emerald-500",
    instructor: "Mr. Julian",
    instructorAvatar: "https://i.pravatar.cc/150?img=11",
    students: 24,
    maxStudents: 30,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 2,
    batchName: "Watercolor – Batch B",
    status: "ACTIVE",
    statusColor: "bg-orange-400",
    batchCode: "BAT-102",
    courseName: "Water Scapes",
    courseIcon: <FiDroplet className="w-5 h-5 text-orange-500" />,
    courseIconBg: "bg-orange-50",
    time: "14:00 - 16:00",
    schedule: "Tue, Thu",
    progressLabel: "PROGRESS",
    progressText: "45% • 30 days left",
    progressColor: "text-orange-500",
    progressWidth: "w-[45%]",
    progressBg: "bg-orange-400",
    instructor: "Ms. Clara",
    instructorAvatar: "https://i.pravatar.cc/150?img=5",
    students: 18,
    maxStudents: 25,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c026109?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 3,
    batchName: "Digital Art – Batch C",
    status: "UPCOMING",
    statusColor: "bg-teal-500",
    batchCode: "BAT-103",
    courseName: "Procreate 101",
    courseIcon: <FiImage className="w-5 h-5 text-teal-600" />,
    courseIconBg: "bg-teal-50",
    time: "09:00 - 13:00",
    schedule: "Weekends",
    progressLabel: "LAUNCH TIMELINE",
    progressText: "Starts in 45 days",
    progressColor: "text-teal-600",
    progressWidth: "w-[15%]",
    progressBg: "bg-teal-500",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    students: 15,
    maxStudents: 20,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 4,
    batchName: "Digital Art – Batch D",
    status: "WEEKEND",
    statusColor: "bg-green-400",
    batchCode: "BAT-104",
    courseName: "Watercolour World",
    courseIcon: <FiImage className="w-5 h-5 text-teal-600" />,
    courseIconBg: "bg-teal-50",
    time: "12:00 - 13:00",
    schedule: "Weekends",
    progressLabel: "LAUNCH TIMELINE",
    progressText: "Starts in 45 days",
    progressColor: "text-teal-600",
    progressWidth: "w-[15%]",
    progressBg: "bg-teal-500",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    students: 15,
    maxStudents: 20,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop",
  },
  {
    id: 5,
    batchName: "Digital Art – Batch E",
    status: "UPCOMING",
    statusColor: "bg-orange-600",
    batchCode: "BAT-105",
    courseName: "Oil Portraits",
    courseIcon: <FiImage className="w-5 h-5 text-teal-600" />,
    courseIconBg: "bg-teal-50",
    time: "13:00 - 16:00",
    schedule: "Weekends",
    progressLabel: "LAUNCH TIMELINE",
    progressText: "Starts in 45 days",
    progressColor: "text-teal-600",
    progressWidth: "w-[15%]",
    progressBg: "bg-teal-500",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    students: 15,
    maxStudents: 20,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
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
  const [batchesList, setBatchesList] = useState(initialBatches);
  const [activeCategory, setActiveCategory] = useState("All Batches");
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
        return <PiPencilSimpleBold className="w-5 h-5 text-[#5B43D6]" />;
      case 'Watercolor':
        return <FiDroplet className="w-5 h-5 text-orange-500" />;
      case 'Digital Art':
      case 'Digital Media':
        return <FiImage className="w-5 h-5 text-teal-600" />;
      case 'Oil Painting':
        return <FiImage className="w-5 h-5 text-teal-600" />;
      case 'Sculpting':
        return <BiCube className="w-5 h-5 text-[#5B43D6]" />;
      case 'Animation':
        return <FiVideo className="w-5 h-5 text-[#5B43D6]" />;
      default:
        return <FiImage className="w-5 h-5 text-[#5B43D6]" />;
    }
  };

  // Create course and append to state
  const handleCreateCourse = () => {
    if (!courseTitle.trim()) {
      alert("Please enter a course title.");
      return;
    }

    const priceText = basePrice ? `$${parseFloat(basePrice).toFixed(2)}/mo` : "$0.00/mo";

    const newBatch = {
      id: Date.now(),
      price: priceText,
      batchName: batchName || `${courseTitle} - New Batch`,
      status: "UPCOMING",
      statusColor: "bg-teal-500",
      batchCode: `BAT-${Date.now().toString().slice(-3)}`,
      courseName: courseTitle,
      courseIcon: getCategoryIcon(category),
      courseIconBg: "bg-teal-50",
      time: "TBD",
      schedule: "TBD",
      progressLabel: "LAUNCH TIMELINE",
      progressText: "Starts soon",
      progressColor: "text-teal-600",
      progressWidth: "w-0",
      progressBg: "bg-teal-500",
      instructor: assignedInstructor.name,
      instructorAvatar: assignedInstructor.avatar,
      students: 0,
      maxStudents: 30,
      image: coverImage || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
    };

    setBatchesList([newBatch, ...batchesList]);
    setSearchParams({}); // Navigate back to list
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

  // Filter based on active category tabs and search input
  const filteredBatches = batchesList.filter(batch => {
    const matchesCategory = activeCategory === "All Batches" || batch.status.toLowerCase() === activeCategory.toLowerCase() || batch.schedule.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = batch.batchName.toLowerCase().includes(searchQuery.toLowerCase()) || batch.courseName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex h-screen overflow-hidden bg-[#FDFDFD] font-sans text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-[#F8F9FA]/50 overflow-y-auto">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white shrink-0 sticky top-0 z-30">
          <div className="relative w-[320px]">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search batches, teachers..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#F8F9FA] border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#5B43D6]/20 placeholder:text-gray-400 font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-6">
            {/* Notification Bell */}
            <button className="relative p-1 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
              </svg>
              {/* Notification Badge */}
              <span className="absolute top-1 right-1.5 w-2 h-2 bg-red-500 rounded-full border-[1.5px] border-white"></span>
            </button>

            {/* Mail Icon */}
            <button className="relative p-1 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
               </svg>
            </button>

            {/* Separator */}
            <div className="w-px h-8 bg-slate-200"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="block text-sm font-bold text-slate-900 leading-tight">Admin Alex</span>
                <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Head Registrar</span>
              </div>
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=200&auto=format&fit=crop"
                alt="Admin Alex"
                className="w-10 h-10 rounded-full object-cover shadow-sm"
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
                  <button onClick={() => setSearchParams({})} className="hover:text-[#5B43D6] transition-colors border-none bg-transparent p-0 cursor-pointer font-medium">
                    Batches
                  </button>
                  <span className="text-slate-300">›</span>
                  <span className="text-[#5B43D6] font-semibold">Add New Batch</span>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-1 leading-tight">Create New Batch</h2>
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
              </div>
            </div>

            {/* Form Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-24">
              
              {/* Left Column (2/3 width) */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* General Information Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-violet-50 text-[#5B43D6] flex items-center justify-center">
                      <FiInfo className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-lg text-slate-900">General Information</h3>
                  </div>

                  {/* Course Title */}
                  <div className="space-y-1.5">
                    <label className="block text-sm font-semibold text-slate-600">Course Name</label>
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
                  </div>
                </div>

                {/* Course Curriculum Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-violet-50 text-[#5B43D6] flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0z" />
                        </svg>
                      </div>
                      <h3 className="font-bold text-lg text-slate-900">Course Curriculum</h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        onClick={handleAddLesson}
                        className="px-3.5 py-2 bg-[#F3F4F6] text-slate-600 text-xs font-bold rounded-lg hover:bg-gray-200 transition-colors cursor-pointer border-none"
                      >
                        Add Lesson
                      </button>
                      <button 
                        onClick={handleAddModule}
                        className="px-3.5 py-2 bg-violet-50 text-[#5B43D6] text-xs font-bold rounded-lg hover:bg-violet-100 transition-colors cursor-pointer border-none"
                      >
                        Add Module
                      </button>
                    </div>
                  </div>

                  {/* Modules Timeline */}
                  <div className="relative border-l-2 border-slate-100 pl-6 ml-4 space-y-6">
                    {modules.map((mod) => (
                      <div key={mod.id} className="relative">
                        {/* Timeline Node dot */}
                        <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-white bg-[#5B43D6] shadow-sm"></div>
                        
                        <div className="bg-[#FAFBFF] border border-slate-200/50 rounded-2xl p-4 flex items-center justify-between group hover:border-[#5B43D6]/40 transition-colors">
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-extrabold text-slate-800 truncate">{mod.title}</span>
                            <span className="block text-xs text-slate-400 font-semibold mt-1">{mod.subtext}</span>
                          </div>

                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 bg-transparent border-none cursor-pointer">
                              <FiPlusCircle className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setModules(modules.filter(m => m.id !== mod.id));
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-500 bg-transparent border-none cursor-pointer"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column (1/3 width) */}
              <div className="space-y-8">
                
                {/* Course Media Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">COURSE MEDIA</span>
                  
                  {/* Upload Image container */}
                  <div className="relative border-2 border-dashed border-slate-200 rounded-2xl aspect-video overflow-hidden bg-[#FAFBFF] flex flex-col items-center justify-center p-4 hover:border-[#5B43D6]/40 transition-colors select-none">
                    <input
                      type="file"
                      accept="image/*"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleImageChange}
                    />

                    {coverImage ? (
                      <>
                        <img src={coverImage} alt="Cover Preview" className="absolute inset-0 w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-950/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-white text-slate-800 text-xs font-extrabold px-4 py-2 rounded-xl shadow-md cursor-pointer border-none"
                          >
                            Change Cover Image
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-10 h-10 rounded-full bg-violet-50 text-[#5B43D6] flex items-center justify-center shadow-sm mb-3 cursor-pointer hover:scale-105 transition-transform"
                        >
                          <FiUploadCloud className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold text-slate-700">Upload Course Cover</span>
                        <span className="text-[10px] text-slate-400 mt-1">JPEG, PNG up to 2MB (16:9 ratio)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Pricing & Settings Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">PRICING & SETTINGS</span>
                  
                  {/* Base Monthly price */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price / Month</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">$</span>
                      <input
                        type="text"
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                        value={basePrice}
                        onChange={(e) => setBasePrice(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Duration input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Course Duration (Weeks)</label>
                    <input
                      type="number"
                      className="w-full px-4 py-3 bg-[#F9FAFB] border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-200 text-sm font-sans"
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value) || 8)}
                    />
                  </div>

                  {/* Toggle controls */}
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Open for Enrollment</span>
                        <span className="text-[10px] text-slate-400">Allow students to sign up immediately</span>
                      </div>
                      <button 
                        onClick={() => setEnrollmentActive(!enrollmentActive)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors border-none cursor-pointer flex items-center ${enrollmentActive ? 'bg-[#5B43D6]' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${enrollmentActive ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="block text-xs font-bold text-slate-700">Include Certificate</span>
                        <span className="text-[10px] text-slate-400">Award certificates upon completion</span>
                      </div>
                      <button 
                        onClick={() => setCertificateIncluded(!certificateIncluded)}
                        className={`w-10 h-6 rounded-full p-0.5 transition-colors border-none cursor-pointer flex items-center ${certificateIncluded ? 'bg-[#5B43D6]' : 'bg-slate-200'}`}
                      >
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${certificateIncluded ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Assign Instructor Card */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100/50 space-y-5">
                  <span className="block text-xs font-extrabold text-slate-400 uppercase tracking-widest">ASSIGN INSTRUCTOR</span>
                  
                  {/* Instructor Selector */}
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
                  <div className="w-8 h-8 rounded-full border-2 border-white bg-[#5B43D6] text-white flex items-center justify-center text-[10px] font-extrabold shadow-sm">
                    MK
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-semibold">Currently being edited by 3 admins</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowPreview(true)}
                  className="px-6 py-3 bg-white border border-slate-200 text-[#5B43D6] font-bold rounded-xl text-sm shadow-sm hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Preview Batch
                </button>
                <button
                  onClick={handleCreateCourse}
                  className="px-6 py-3 bg-[#5B43D6] hover:bg-[#4b36b0] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-900/20 transition-all cursor-pointer border-none"
                >
                  Create Batch
                </button>
              </div>
            </div>

            {/* Preview Modal Popup */}
            {showPreview && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] animate-scale-up">
                  {/* Modal Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-extrabold text-xl text-slate-900">Batch Detail Preview</h3>
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
                        <span className="bg-purple-100 text-[#5B43D6] px-3 py-1 rounded-full text-xs font-bold shadow-sm">
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
                      className="px-5 py-2 bg-[#5B43D6] text-white font-bold rounded-xl text-sm shadow-md shadow-purple-900/10 hover:bg-[#4b36b0] transition-colors cursor-pointer border-none"
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
            <div className="flex items-start justify-between mb-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">Batch Management</h2>
                <p className="text-slate-500 text-sm leading-relaxed">Streamline academy operations: track active batches, monitor teacher performance, and manage student enrollment schedules.</p>
              </div>
              <button 
                onClick={() => setSearchParams({ mode: 'create' })}
                className="flex items-center gap-2 bg-[#5B43D6] hover:bg-[#4b36b0] text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm cursor-pointer border-none whitespace-nowrap"
              >
                <FiPlusCircle className="w-4 h-4" />
                Create New Batch
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
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors cursor-pointer border-none ${
                      isActive
                        ? 'bg-[#5B43D6] text-white shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Batch Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredBatches.map((batch) => (
                <div key={batch.id} className="bg-white rounded-[24px] p-4 shadow-sm border border-slate-100 flex flex-col group hover:shadow-md transition-all">
                  {/* Image Container */}
                  <div className="relative rounded-2xl overflow-hidden mb-5 aspect-[16/10] bg-slate-100">
                    <img src={batch.image} alt={batch.batchName} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                       <div className={`px-2.5 py-1 rounded text-[10px] font-bold text-white shadow-sm uppercase ${batch.statusColor}`}>
                         {batch.status}
                       </div>
                       <div className="px-2.5 py-1 rounded text-[10px] font-bold text-white bg-slate-900/60 backdrop-blur-sm uppercase shadow-sm">
                         {batch.batchCode}
                       </div>
                    </div>
                    
                    {/* Options Menu */}
                    <button className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-slate-600 shadow-sm border-none cursor-pointer hover:bg-white transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-1 flex-1 flex flex-col">
                    <h3 className="font-bold text-[17px] text-gray-900 mb-4">{batch.batchName}</h3>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${batch.courseIconBg}`}>
                         {batch.courseIcon}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Course</span>
                        <span className="block text-sm font-semibold text-slate-800 truncate">{batch.courseName}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-5">
                      <div className="flex items-center gap-2 min-w-0">
                         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                         </div>
                         <div className="min-w-0">
                           <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Time</span>
                           <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 truncate">{batch.time}</span>
                         </div>
                      </div>
                      <div className="flex items-center gap-2 min-w-0">
                         <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" />
                            </svg>
                         </div>
                         <div className="min-w-0">
                           <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Schedule</span>
                           <span className="block text-[11px] sm:text-xs font-semibold text-slate-800 truncate">{batch.schedule}</span>
                         </div>
                      </div>
                    </div>

                    <div className="mb-5 border-b border-slate-100/80 pb-5">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{batch.progressLabel}</span>
                         <span className={`text-xs font-bold ${batch.progressColor}`}>{batch.progressText}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className={`h-full rounded-full ${batch.progressWidth} ${batch.progressBg}`}></div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                       <div className="flex items-center gap-2.5 min-w-0">
                          <img src={batch.instructorAvatar} alt={batch.instructor} className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm shrink-0" />
                          <div className="min-w-0">
                             <span className="block text-sm font-bold text-slate-800 truncate">{batch.instructor}</span>
                             <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Instructor</span>
                          </div>
                       </div>
                       
                       <div className="bg-slate-50 px-2 sm:px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
                          <svg className="w-3.5 h-3.5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
                          </svg>
                          <span className="text-[11px] sm:text-xs font-bold text-slate-700">{batch.students} / {batch.maxStudents}</span>
                       </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* New Batch Card */}
              <button 
                onClick={() => setSearchParams({ mode: 'create' })}
                className="bg-transparent border-2 border-dashed border-slate-200 rounded-[24px] p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 hover:border-slate-300 transition-colors group min-h-[440px] cursor-pointer"
              >
                <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FiPlus className="w-6 h-6 text-slate-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">New Batch</h3>
                <p className="text-sm text-slate-500 max-w-[200px] leading-relaxed">Design a new creative curriculum and schedule for the next semester.</p>
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
