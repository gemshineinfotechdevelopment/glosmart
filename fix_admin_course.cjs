const fs = require('fs');
let content = fs.readFileSync('src/pages/admin/AdminCoursePage.tsx', 'utf8');

// 1. Fix imports
const importBlockStart = content.indexOf(`import React, { useState, useRef } from 'react';`);
const importBlockEnd = content.indexOf(`\n// Categories array for the filter tabs`);
const newImportBlock = `import React, { useState, useRef } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  FiSearch, FiPlus, FiDroplet, FiVideo, FiImage,
  FiInfo, FiUploadCloud, FiTrash2, FiPlusCircle, FiX, FiCheck,
  FiMoreVertical, FiClock, FiCalendar, FiUsers
} from 'react-icons/fi';
import { PiPalette, PiMonitor, PiPencilSimpleBold } from 'react-icons/pi';
import { BiCube } from 'react-icons/bi';
import { BsPersonFill } from 'react-icons/bs';
import AdminSidebar from '../../components/admin/AdminSidebar';
import adminCourse1 from '../../assets/admin-course1.png';
import adminCourse2 from '../../assets/admin-course2.png';
import adminCourse3 from '../../assets/admin-course3.png';
import adminCourse4 from '../../assets/admin-course4.png';`;
content = content.substring(0, importBlockStart) + newImportBlock + content.substring(importBlockEnd);

// 2. Fix initialCourses
const initialCoursesBroken = `const initialCourses = [
const filterTabs = [
  "All Batches", "Active", "Upcoming", "Completed", "Morning", "Evening", "Weekend"
];`;
const initialCoursesFixed = `const initialCourses = [
  {
    id: 1,
    title: "Pencil Drawing – Batch A",
    category: "Sketching",
    categoryIcon: <PiPencilSimpleBold className="w-3.5 h-3.5 mr-1.5" />,
    level: "Beginner",
    levelColor: "text-indigo-600 bg-white",
    price: "$40/mo",
    instructor: "Mr. Julian",
    instructorAvatar: "https://i.pravatar.cc/150?img=11",
    students: 24,
    image: adminCourse1,
    progress: "w-3/4 bg-emerald-500",
  },
  {
    id: 2,
    title: "Watercolor – Batch B",
    category: "Watercolor",
    categoryIcon: <FiDroplet className="w-3.5 h-3.5 mr-1.5" />,
    level: "Intermediate",
    levelColor: "text-amber-600 bg-white",
    price: "$55/mo",
    instructor: "Ms. Clara",
    instructorAvatar: "https://i.pravatar.cc/150?img=5",
    students: 18,
    image: adminCourse2,
    progress: "w-1/2 bg-amber-500",
  },
  {
    id: 3,
    title: "Digital Art – Batch C",
    category: "Digital Art",
    categoryIcon: <PiMonitor className="w-3.5 h-3.5 mr-1.5" />,
    level: "Advanced",
    levelColor: "text-emerald-600 bg-white",
    price: "$80/mo",
    instructor: "Mr. Henderson",
    instructorAvatar: "https://i.pravatar.cc/150?img=12",
    students: 15,
    image: adminCourse3,
    progress: "w-1/4 bg-indigo-500",
  }
];

const filterTabs = [
  "All Batches", "Active", "Upcoming", "Completed", "Morning", "Evening", "Weekend"
];`;
content = content.replace(initialCoursesBroken, initialCoursesFixed);

// 3. Fix filteredCourses callback
const filteredCoursesBroken = `  const filteredCourses = coursesList.filter(course => {
    const matchesCategory = activeCategory === "All Categories" || course.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  const [activeTab, setActiveTab] = useState("All Batches");
  const navigate = useNavigate();`;
const filteredCoursesFixed = `  const filteredCourses = coursesList.filter(course => {
    const matchesCategory = activeCategory === "All Categories" || course.category.toLowerCase().includes(activeCategory.toLowerCase());
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const [activeTab, setActiveTab] = useState("All Batches");
  const navigate = useNavigate();`;
content = content.replace(filteredCoursesBroken, filteredCoursesFixed);

// 4. Remove injected Batch Management
const batchInjectStart = content.indexOf(`      <main className="flex-1 flex flex-col bg-[#FAFBFF]">`);
const batchInjectEnd = content.indexOf(`              {/* Right Column (1/3 width) */}`);
if (batchInjectStart !== -1 && batchInjectEnd !== -1) {
  content = content.substring(0, batchInjectStart) + `              </div>\n            </div>\n\n` + content.substring(batchInjectEnd);
}

// 5. Remove New Batch Card
const newBatchCardStart = content.indexOf(`            {/* New Batch Card */}`);
const newBatchCardEnd = content.indexOf(`            </button>\n          </div>\n        )}`);
if (newBatchCardStart !== -1 && newBatchCardEnd !== -1) {
  content = content.substring(0, newBatchCardStart) + `          </div>\n        )}`;
  let lastIndex = content.lastIndexOf(`        )}`);
  if (lastIndex !== -1) {
      content = content.substring(0, lastIndex) + `        )}`;
  }
}

fs.writeFileSync('src/pages/admin/AdminCoursePage.tsx', content);
console.log('Fixed syntax errors in AdminCoursePage.tsx');
