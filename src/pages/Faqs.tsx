import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/background-home.jpeg';
import mobileBg from '../assets/background.png';
import {
  FiStar,
  FiRefreshCw,
  FiEdit3,
  FiUsers,
  FiAward,
  FiMail,
  FiChevronDown,
  FiChevronUp,
  FiBookOpen,
  FiMonitor
} from 'react-icons/fi';
import { MdCurrencyRupee } from 'react-icons/md';

interface FaqItem {
  question: string;
  answer: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
}

type CategoryType = 'enrollment' | 'curriculum' | 'pricing' | 'technical';

interface CategoryData {
  id: CategoryType;
  name: string;
  icon: React.ReactNode;
  items: FaqItem[];
}

export const Faqs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CategoryType>('enrollment');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const categories: CategoryData[] = [
    {
      id: 'enrollment',
      name: 'Enrollment',
      icon: <FiBookOpen className="w-5 h-5" />,
      items: [
        {
          question: 'Is prior art experience needed?',
          answer: 'Not at all. We cater to all skill levels from age 4 to 17. Our mentors provide personalized guidance for everyone, starting from basic shapes and colors up to advanced 3D modeling and concept art. Each student begins with a creative assessment to find their perfect starting point.',
          icon: <FiStar className="w-5 h-5" />,
          iconBg: 'bg-sky-50 border border-sky-100',
          iconColor: 'text-sky-500'
        },
        {
          question: 'Can we switch plans later?',
          answer: 'Yes, you can upgrade, downgrade, or switch plans at any time. Any changes will be applied to your billing cycle on the next month, and you will receive a prorated adjustment for any upgrades.',
          icon: <FiRefreshCw className="w-5 h-5" />,
          iconBg: 'bg-pink-50 border border-pink-100',
          iconColor: 'text-[#e67e9c]'
        },
        {
          question: 'What materials do I need to get started?',
          answer: 'A standard drawing kit with sketchbooks, drawing pencils (2B, 4B, etc.), and coloring tools (markers, watercolors, or colored pencils) is a great start. For digital art, a tablet and stylus are recommended.',
          icon: <FiEdit3 className="w-5 h-5" />,
          iconBg: 'bg-emerald-50 border border-emerald-100',
          iconColor: 'text-emerald-500'
        },
        {
          question: 'Are the classes live or pre-recorded?',
          answer: 'Our classes include a mix of live, interactive mentorship sessions and pre-recorded, structured video tutorials. This hybrid model allows children to learn at their own pace while getting real-time guidance and feedback.',
          icon: <FiUsers className="w-5 h-5" />,
          iconBg: 'bg-purple-50 border border-purple-100',
          iconColor: 'text-purple-500'
        },
        {
          question: 'Is there a certificate of completion?',
          answer: 'Yes, we award certificates of completion upon finishing each core course level. These highlight the skills mastered and project milestones completed by the student.',
          icon: <FiAward className="w-5 h-5" />,
          iconBg: 'bg-teal-50 border border-teal-100',
          iconColor: 'text-teal-500'
        }
      ]
    },
    {
      id: 'curriculum',
      name: 'Curriculum',
      icon: <FiEdit3 className="w-5 h-5" />,
      items: [
        {
          question: 'What topics are covered in the curriculum?',
          answer: 'Our curriculum covers traditional drawing, painting, color theory, digital illustration, 3D modeling, animation, and concept art. It is designed to be well-rounded and engaging.',
          icon: <FiStar className="w-5 h-5" />,
          iconBg: 'bg-sky-50 border border-sky-100',
          iconColor: 'text-sky-500'
        },
        {
          question: 'How are the course levels structured?',
          answer: 'Courses are divided into age-appropriate brackets: Pre-Junior (4–8 years), Junior (9–14 years), and Senior (15+ years). Each bracket progresses through Beginner, Intermediate, and Advanced milestones.',
          icon: <FiUsers className="w-5 h-5" />,
          iconBg: 'bg-purple-50 border border-purple-100',
          iconColor: 'text-purple-500'
        },
        {
          question: 'Who designs the curriculum?',
          answer: 'Our curriculum is designed by certified art educators and professional artists with years of industry experience, ensuring a balance between foundational technique and creative freedom.',
          icon: <FiAward className="w-5 h-5" />,
          iconBg: 'bg-teal-50 border border-teal-100',
          iconColor: 'text-teal-500'
        },
        {
          question: 'Can children work on custom projects?',
          answer: 'Absolutely! We encourage self-expression. In our project-based sessions, students are encouraged to apply what they have learned to create unique pieces reflecting their own ideas and interests.',
          icon: <FiEdit3 className="w-5 h-5" />,
          iconBg: 'bg-emerald-50 border border-emerald-100',
          iconColor: 'text-emerald-500'
        }
      ]
    },
    {
      id: 'pricing',
      name: 'Pricing & Plans',
      icon: <MdCurrencyRupee className="w-5 h-5" />,
      items: [
        {
          question: 'Is there a trial class?',
          answer: 'Yes! We offer a free trial class for all new students. Contact us or register online to schedule your session.',
          icon: <FiStar className="w-5 h-5" />,
          iconBg: 'bg-sky-50 border border-sky-100',
          iconColor: 'text-sky-500'
        },
        {
          question: 'What are your subscription options?',
          answer: 'We offer flexible monthly and annual plans. Annual plans offer a significant discount compared to month-to-month billing. Visit our Pricing page for detailed pricing tables.',
          icon: <FiRefreshCw className="w-5 h-5" />,
          iconBg: 'bg-pink-50 border border-pink-100',
          iconColor: 'text-[#e67e9c]'
        },
        {
          question: 'Are there any hidden fees?',
          answer: 'No. Our pricing is fully transparent and covers access to the platform, live classes, and mentor feedback. The only additional cost is optional personal physical art supplies.',
          icon: <FiAward className="w-5 h-5" />,
          iconBg: 'bg-teal-50 border border-teal-100',
          iconColor: 'text-teal-500'
        },
        {
          question: 'What is your refund policy?',
          answer: 'If you are not satisfied with your experience, you can cancel your subscription anytime. We offer a full refund within the first 14 days of your initial enrollment.',
          icon: <FiEdit3 className="w-5 h-5" />,
          iconBg: 'bg-emerald-50 border border-emerald-100',
          iconColor: 'text-emerald-500'
        }
      ]
    },
    {
      id: 'technical',
      name: 'Technical Setup',
      icon: <FiMonitor className="w-5 h-5" />,
      items: [
        {
          question: 'What devices are recommended?',
          answer: 'For live sessions, a computer, laptop, or tablet with a working web camera and stable internet connection is required. For digital courses, a drawing tablet and compatible stylus are recommended.',
          icon: <FiMonitor className="w-5 h-5" />,
          iconBg: 'bg-sky-50 border border-sky-100',
          iconColor: 'text-sky-500'
        },
        {
          question: 'What software do we need to install?',
          answer: 'Most courses use free or low-cost applications like Krita, Sketchbook, or ibisPaint. Instructions for downloading and setting up software are provided prior to the start of each course.',
          icon: <FiEdit3 className="w-5 h-5" />,
          iconBg: 'bg-emerald-50 border border-emerald-100',
          iconColor: 'text-emerald-500'
        },
        {
          question: 'How do I join the live online classrooms?',
          answer: 'Students can log in to the GloSmart portal and access their dashboard. Live classes can be joined directly from the dashboard with a single click via our secure integrated video system.',
          icon: <FiUsers className="w-5 h-5" />,
          iconBg: 'bg-purple-50 border border-purple-100',
          iconColor: 'text-purple-500'
        },
        {
          question: 'What if we face technical issues during a class?',
          answer: 'Our tech support team is available during all class times. You can contact support via live chat or email, and a mentor will help resolve your connection or software issues.',
          icon: <FiRefreshCw className="w-5 h-5" />,
          iconBg: 'bg-pink-50 border border-pink-100',
          iconColor: 'text-[#e67e9c]'
        }
      ]
    }
  ];

  const handleTabChange = (tabId: CategoryType) => {
    setActiveTab(tabId);
    setOpenFaq(0); // Open the first FAQ of the selected category by default
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currentCategoryData = categories.find((cat) => cat.id === activeTab);
  const displayedItems = currentCategoryData?.items || [];

  return (
    <div
      className="font-sans text-[#1e295d] min-h-screen relative flex flex-col"
      style={{
        backgroundImage: `url(${isMobile ? mobileBg : bgImage})`,
        backgroundSize: '100% auto',
        backgroundRepeat: 'repeat-y',
        backgroundPosition: 'top center',
      }}
    >
      {/* Main Container */}
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-5 pt-32 pb-20 relative z-10 box-border flex flex-col items-center">
        {/* Support Center Badge */}
        <div className="inline-flex items-center gap-2 bg-[#dbeafe]/80 border border-sky-100 rounded-full px-4.5 py-1.5 shadow-sm mb-4 backdrop-blur-sm">
          <svg className="w-3.5 h-3.5 text-[#00668f]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span className="text-[12px] font-extrabold tracking-wider text-[#00668f]">Support Center</span>
        </div>

        {/* Heading */}
        <h1 className="font-fredoka text-4xl md:text-5xl lg:text-6xl text-[#1b2559] font-bold mb-4 tracking-tight text-center">
          Common <span className="text-[#b84d63]">Questions</span>
        </h1>

        {/* Subtitle */}
        <p className="text-base md:text-lg text-[#616c96] max-w-xl text-center mb-8">
          Everything you need to know about our curriculum, enrollment process, and how we help young visionaries ignite their inner masterpiece.
        </p>  

        {/* Categories & FAQs Grid */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 items-start mb-16">
          {/* Sidebar selector */}
          <div className="flex flex-row lg:flex-col overflow-x-auto lg:overflow-x-visible gap-4 pb-2 lg:pb-0 w-full scrollbar-none shrink-0">
            {categories.map((cat) => {
              const isActive = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleTabChange(cat.id)}
                  className={`flex items-center gap-3.5 px-6 py-4 rounded-[18px] text-[15px] font-bold text-left cursor-pointer transition-all duration-300 border outline-none shrink-0 w-auto lg:w-full ${isActive
                      ? 'bg-[#004b73] border-[#004b73] text-white shadow-lg shadow-teal-900/10'
                      : 'bg-white border-white text-[#1b2559] hover:bg-slate-50 shadow-sm shadow-slate-100/40'
                    }`}
                >
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full transition-colors ${isActive ? 'bg-[#003c5d] text-white' : 'bg-slate-50 border border-slate-100 text-[#00668f]'
                    }`}>
                    {cat.icon}
                  </span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* FAQs Accordion list */}
          <div className="flex flex-col gap-5 w-full">
            {displayedItems.length > 0 ? (
              displayedItems.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <div
                    key={item.question}
                    className={`bg-white rounded-[24px] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${isOpen
                        ? 'border-2 border-[#ff8aa1] shadow-md shadow-pink-100/10'
                        : 'border border-white shadow-slate-100/40'
                      }`}
                  >
                    <button
                      className="w-full bg-transparent border-none flex justify-between items-center py-5 px-6 text-left cursor-pointer outline-none font-sans"
                      onClick={() => toggleFaq(index)}
                    >
                      <div className="flex items-center gap-4.5">
                        <span className={`flex items-center justify-center w-10 h-10 rounded-full shrink-0 ${item.iconBg} ${item.iconColor}`}>
                          {item.icon}
                        </span>
                        <span className="text-[16px] md:text-[17px] font-extrabold text-[#1b2559] pr-4">
                          {item.question}
                        </span>
                      </div>
                      <span className={`flex items-center justify-center w-8 h-8 rounded-full border shrink-0 transition-all duration-300 ${isOpen
                          ? 'bg-[#00668f] border-[#00668f] text-white'
                          : 'bg-transparent border-slate-200 text-[#1b2559]'
                        }`}>
                        {isOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6 text-[14px] md:text-[15px] leading-relaxed text-[#616c96] border-t border-slate-50 pt-4 pl-20 pr-10">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-[24px] p-8 text-center text-[#616c96] border border-white shadow-sm">
                No questions found matching your search.
              </div>
            )}
          </div>
        </div>

        {/* "Still have questions?" Box */}
        <div className="w-full bg-gradient-to-br from-[#0b3142] via-[#0b3d54] to-[#005a78] rounded-[32px] p-8 md:p-12 text-center text-white shadow-lg relative overflow-hidden">
          {/* Overlay glow/light elements */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-sky-400/10 rounded-full blur-[60px] pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-[#ff8aa1]/5 rounded-full blur-[40px] pointer-events-none"></div>

          <h2 className="font-fredoka text-3xl md:text-4xl font-bold mb-3 tracking-tight relative z-10">
            Still have questions?
          </h2>
          <p className="text-[15px] md:text-[16px] text-slate-200/90 max-w-xl mx-auto mb-8 leading-relaxed relative z-10">
            Can't find the answer you're looking for? Our team of friendly mentors is here to help you guide your child's creative journey.
          </p>

          <div className="flex justify-center items-center relative z-10">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2.5 bg-[#d2ff55] hover:bg-[#c2ef45] text-[#0b3142] font-extrabold px-8 py-3.5 rounded-full text-[15px] transition-all duration-300 shadow-md shadow-lime-950/10 hover:-translate-y-0.5 no-underline w-full sm:w-auto justify-center"
            >
              <FiMail className="w-4 h-4" />
              Contact Support
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Faqs;
