import { Check, Heart, Star } from 'lucide-react';

// Images
import courseBg from '../assets/course-bg.png';
import course2 from '../assets/course2.png';
import course3 from '../assets/course3.png';
import course4 from '../assets/course4.png';
import course5 from '../assets/course5.png';
import course6 from '../assets/course6.png';
import crayon from '../assets/crayon.png';

const preJuniorCourses = [
  {
    id: 1,
    title: 'Basic Clay Sculpting',
    desc: 'Developing fine motor skills through fun, tactile projects and imaginative animal shapes.',
    badges: ['Fine Motor', '3D Awareness'],
    price: '₹2,500/month',
    image: course4,
    topBadge: 'Hands-on',
    topBadgeColor: 'bg-yellow-300 text-yellow-900',
  },
  {
    id: 2,
    title: 'Finger Painting & Textures',
    desc: 'Exploring color mixing and texture using sponges, fingers, and safe, vibrant paints.',
    badges: ['Color Theory', 'Sensory'],
    price: '₹2,500/month',
    image: course3,
    topBadge: 'Expressive',
    topBadgeColor: 'bg-pink-300 text-pink-900',
  }
];

export default function Course() {
  return (
    <div 
      className="min-h-screen font-['Outfit',sans-serif] overflow-hidden"
      style={{ 
        backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.85), rgba(255, 255, 255, 0.85)), url(${courseBg})`, 
        backgroundSize: 'cover', 
        backgroundPosition: 'top center', 
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 flex flex-col items-center text-center z-10">
        <div className="absolute top-10 right-10 w-48 md:w-80 lg:w-96 animate-bounce-slow opacity-80 pointer-events-none">
          <img src={crayon} alt="Decorative Brush" className="w-full h-auto drop-shadow-2xl -rotate-12" />
        </div>
        
        <div className="bg-yellow-300 text-yellow-900 px-4 py-2 rounded-full font-semibold flex items-center gap-2 mb-6 shadow-sm">
          <Star className="w-4 h-4 fill-yellow-900" />
          Discovery Awaits
        </div>
        
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#00668A] mb-6 max-w-3xl leading-tight">
          Explore the Curriculum
        </h1>
        
        <p className="text-gray-700 max-w-2xl text-lg md:text-xl font-medium leading-relaxed">
          Find the perfect creative path for every age and skill level. From tactile sensory play to advanced digital masterclasses.
        </p>
      </section>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-16 space-y-24 relative z-20">
        
        {/* Pre-Junior Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#00668A] text-white p-3 rounded-2xl shadow-lg">
              <span className="text-xl font-bold">😊</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#00668A]">Pre-Junior</h2>
              <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                Ages 4-8 • Tactile learning & play based curriculum • <span className="text-[#00668A] font-semibold">₹2,500/month</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {preJuniorCourses.map((course) => (
              <div key={course.id} className="bg-white rounded-3xl overflow-hidden shadow-xl shadow-blue-900/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden group">
                  <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-xs font-bold ${course.topBadgeColor}`}>
                    {course.topBadge}
                  </div>
                  <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{course.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {course.badges.map((badge, index) => (
                      <span key={index} className="bg-blue-50 text-[#00668A] px-3 py-1 rounded-full text-xs font-semibold">
                        {badge}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <div className="bg-purple-100 p-2 rounded-lg">
                      <Star className="w-4 h-4 text-purple-600 fill-purple-600" />
                    </div>
                    <span className="font-bold text-purple-700">{course.price}</span>
                  </div>
                  
                  <button className="w-full py-3 border-2 border-[#00668A] text-[#00668A] font-bold rounded-xl hover:bg-[#00668A] hover:text-white transition-colors duration-300">
                    View Curriculum
                  </button>
                </div>
              </div>
            ))}

            {/* Information Card */}
            <div className="bg-gradient-to-br from-[#00668A] to-[#004e6e] rounded-3xl p-8 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-center h-full transform hover:scale-[1.02] transition-transform duration-300">
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

        {/* Junior Section */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#cc2b5e] text-white p-3 rounded-2xl shadow-lg">
              <span className="text-xl font-bold">🖌️</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#cc2b5e]">Junior</h2>
              <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                Ages 9-14 • Drawing, perspective, and color theories • <span className="text-[#cc2b5e] font-semibold">₹3,500/month</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Split Card for Advanced Character Design */}
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-red-900/5 overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all duration-300 group border border-gray-100">
              <div className="w-full md:w-1/2 overflow-hidden">
                <img src={course2} alt="Advanced Character Design" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 min-h-[300px]" />
              </div>
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-2 text-red-500 font-bold text-xs tracking-wider uppercase mb-4">
                  <Heart className="w-4 h-4 fill-red-500" /> MOST POPULAR
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">Advanced Character Design</h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                  Master the fundamentals of anatomy, silhouette, and storytelling through character creation.
                </p>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-purple-100 p-2.5 rounded-xl">
                    <Star className="w-5 h-5 text-purple-600 fill-purple-600" />
                  </div>
                  <span className="font-bold text-xl text-purple-700">₹3,500/month</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <button className="flex-grow bg-[#00668A] text-white py-4 px-6 rounded-xl font-bold hover:bg-[#004e6e] transition-colors shadow-lg shadow-blue-900/20">
                    Enroll Now
                  </button>
                  <button className="p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 hover:border-red-500 hover:text-red-500 transition-all text-gray-400">
                    <Heart className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </div>

            {/* Watercolor Card */}
            <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 overflow-hidden flex flex-col hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
              <div className="h-48 md:h-56 overflow-hidden group">
                <img src={course5} alt="Watercolor Techniques" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-8 flex flex-col flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Watercolor Techniques</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-8 flex-grow">
                  Learning wet-on-wet, dry brush, and color layering to create atmospheric landscapes.
                </p>
                <button className="w-full py-3.5 border-2 border-[#00668A] text-[#00668A] font-bold rounded-xl hover:bg-[#00668A] hover:text-white transition-colors duration-300">
                  Explore
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Senior Section */}
        <section className="pb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="bg-[#5a653e] text-white p-3 rounded-2xl shadow-lg">
              <span className="text-xl font-bold">A</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-[#5a653e]">Senior</h2>
              <p className="text-gray-500 font-medium text-sm md:text-base mt-1">
                Ages 15+ & Adults • Advanced portfolio & industry standard techniques • <span className="text-[#5a653e] font-semibold">₹5,000/month</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Small Card */}
            <div className="bg-white rounded-3xl p-8 shadow-xl shadow-green-900/5 hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-lime-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              
              <div className="bg-lime-200 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner">
                <div className="w-8 h-8 border-4 border-lime-600 rounded-sm transform rotate-45 flex items-center justify-center">
                  <div className="w-2 h-2 bg-lime-600 rounded-full"></div>
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 mb-4">3D Modeling Intro</h3>
              <p className="text-gray-500 leading-relaxed mb-8 flex-grow">
                Introduction to Blender and industry pipelines for game development and animation.
              </p>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 font-bold text-sm">
                  AC
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Instructor</p>
                  <p className="font-bold text-gray-900">Alex Chen</p>
                </div>
              </div>
            </div>

            {/* Large Split Card */}
            <div className="lg:col-span-2 bg-[#eef0ff] rounded-3xl shadow-xl shadow-indigo-900/10 overflow-hidden flex flex-col md:flex-row hover:shadow-2xl transition-all duration-300">
              <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
                <div className="text-indigo-600 font-bold text-xs tracking-wider uppercase mb-4">
                  MASTERCLASS
                </div>
                <h3 className="text-3xl md:text-4xl font-extrabold text-indigo-950 mb-4 leading-tight">Concept Art Masterclass</h3>
                <p className="text-indigo-900/70 mb-8 leading-relaxed font-medium">
                  A rigorous program focusing on environment design and cinematic lighting for senior students.
                </p>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-indigo-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/30">
                    <Star className="w-5 h-5 text-white fill-white" />
                  </div>
                  <span className="font-bold text-xl text-indigo-900">₹5,000/month</span>
                </div>
                
                <button className="w-max bg-[#00668A] text-white py-4 px-8 rounded-xl font-bold hover:bg-[#004e6e] transition-colors shadow-lg shadow-blue-900/20">
                  Apply Now
                </button>
              </div>
              <div className="w-full md:w-1/2 overflow-hidden group">
                <img src={course6} alt="Concept Art Masterclass" className="w-full h-full object-cover min-h-[300px] group-hover:scale-105 transition-transform duration-700" />
              </div>
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
