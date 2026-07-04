import {
  FiSearch, FiPlus, FiDroplet, FiVideo, FiImage
} from 'react-icons/fi';
import { BiCube } from 'react-icons/bi';
import { PiPencilSimpleBold } from 'react-icons/pi';
import { BsPersonFill } from 'react-icons/bs';
import AdminSidebar from '../../components/admin/AdminSidebar';

const categories = [
  { name: "All Categories", active: true },
  { name: "Sketching" },
  { name: "Watercolor" },
  { name: "Digital Art" },
  { name: "Oil Painting" },
  { name: "Sculpting" },
  { name: "Animation" }
];

const courses = [
  {
    id: 1,
    title: "Pencil Drawing",
    category: "Sketching & Charcoal",
    categoryIcon: <PiPencilSimpleBold className="w-3.5 h-3.5 mr-1.5" />,
    level: "Junior",
    levelColor: "text-indigo-600 bg-white",
    price: "$45/mo",
    instructor: "Mr. Julian",
    instructorAvatar: "https://i.pravatar.cc/150?img=11",
    students: 24,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=1000&auto=format&fit=crop",
    progress: "w-10 bg-amber-500",
  },
  {
    id: 2,
    title: "Digital Illustration",
    category: "Digital Media",
    categoryIcon: <PiPencilSimpleBold className="w-3.5 h-3.5 mr-1.5" />,
    level: "Senior",
    levelColor: "text-emerald-600 bg-white",
    price: "$75/mo",
    instructor: "Ms. Clara",
    instructorAvatar: "https://i.pravatar.cc/150?img=5",
    students: 18,
    image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1000&auto=format&fit=crop",
    progress: "w-14 bg-emerald-500",
  },
  {
    id: 3,
    title: "Watercolor World",
    category: "Watercolor",
    categoryIcon: <FiDroplet className="w-3.5 h-3.5 mr-1.5" />,
    level: "Junior",
    levelColor: "text-indigo-600 bg-white",
    price: "$50/mo",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    students: 15,
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c026109?q=80&w=1000&auto=format&fit=crop",
    progress: "w-8 bg-indigo-600",
  },
  {
    id: 4,
    title: "Modern Clay",
    category: "Sculpting",
    categoryIcon: <BiCube className="w-3.5 h-3.5 mr-1.5" />,
    level: "Senior",
    levelColor: "text-emerald-600 bg-white",
    price: "$90/mo",
    instructor: "Mr. David",
    instructorAvatar: "https://i.pravatar.cc/150?img=13",
    students: 10,
    image: "https://images.unsplash.com/photo-1610701596007-11502861dcfa?q=80&w=1000&auto=format&fit=crop",
    progress: "w-6 bg-amber-500",
  },
  {
    id: 5,
    title: "Character Design",
    category: "Animation",
    categoryIcon: <FiVideo className="w-3.5 h-3.5 mr-1.5" />,
    level: "Junior",
    levelColor: "text-indigo-600 bg-white",
    price: "$60/mo",
    instructor: "Ms. Riley",
    instructorAvatar: "https://i.pravatar.cc/150?img=9",
    students: 32,
    image: "https://images.unsplash.com/photo-1601296200639-8edb34ee97fe?q=80&w=1000&auto=format&fit=crop",
    progress: "w-full bg-red-700",
  },
  {
    id: 6,
    title: "Oil Portraits",
    category: "Oil Painting",
    categoryIcon: <FiImage className="w-3.5 h-3.5 mr-1.5" />,
    level: "Senior",
    levelColor: "text-emerald-600 bg-white",
    price: "$110/mo",
    instructor: "Ms. Beatrice",
    instructorAvatar: "https://i.pravatar.cc/150?img=10",
    students: 12,
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=1000&auto=format&fit=crop",
    progress: "w-16 bg-indigo-500",
  }
];

export default function AdminCoursePage() {
  return (
    <div className="flex min-h-screen bg-[#FDFDFD] font-sans text-slate-800">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-slate-50/30">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-100 flex items-center justify-between px-8 bg-white">
          <div className="relative w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 bg-purple-50/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
            />
          </div>
          <div className="relative w-72">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-2 bg-purple-50/50 border-none rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 placeholder:text-gray-400"
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-8 flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Courses</h2>
              <p className="text-gray-500 text-sm">Manage and curate the creative journey for our talented artists.</p>
            </div>
            <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-colors shadow-sm">
              <FiPlus className="w-4 h-4" />
              Create Course
            </button>
          </div>

          {/* Categories */}
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {categories.map((cat) => (
              <button
                key={cat.name}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${cat.active
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
                  }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Course Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl p-3.5 shadow-[0_2px_12px_rgba(0,0,0,0.04)] border border-gray-100/50 flex flex-col group hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] transition-all">
                {/* Image Container */}
                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[4/3]">
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />

                  {/* Level Badge */}
                  <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold ${course.levelColor}`}>
                    {course.level}
                  </div>

                  {/* Price Badge */}
                  <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full text-sm font-bold text-indigo-400 bg-gray-900/60 backdrop-blur-sm">
                    {course.price}
                  </div>
                </div>

                {/* Content */}
                <div className="px-1.5 pb-2 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-gray-900 mb-1">{course.title}</h3>
                  <div className="flex items-center text-xs text-gray-500 mb-4 font-medium">
                    {course.categoryIcon}
                    {course.category}
                  </div>

                  {/* Instructor & Students */}
                  <div className="flex items-center justify-between mt-auto mb-4">
                    <div className="flex items-center gap-2">
                      <img src={course.instructorAvatar} alt={course.instructor} className="w-7 h-7 rounded-full object-cover border border-gray-100" />
                      <div className="text-xs font-medium text-gray-700">
                        <span className="block text-gray-500 text-[10px] leading-none mb-0.5">{course.instructor.split(' ')[0]}</span>
                        <span className="block">{course.instructor.split(' ')[1]}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-gray-500">
                      <BsPersonFill className="w-3.5 h-3.5" />
                      <div className="text-xs font-medium">
                        <span className="block text-gray-900 leading-none">{course.students}</span>
                        <span className="text-[10px]">Students</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-1">
                    <div className={`h-full rounded-full ${course.progress}`}></div>
                  </div>
                </div>
              </div>
            ))}

            {/* New Course Card */}
            <button className="bg-white/50 border-2 border-dashed border-gray-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors group h-full min-h-[320px]">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FiPlus className="w-5 h-5 text-gray-500" />
              </div>
              <h3 className="text-lg font-bold text-gray-700 mb-2">New Course</h3>
              <p className="text-sm text-gray-500 max-w-[140px]">Click to design a new creative curriculum</p>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
