import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bgImage from '../assets/background-home.jpeg';
import mobileBg from '../assets/background.png';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { FiX } from 'react-icons/fi';
import { API_BASE_URL, getImageUrl } from '../config/api';

export default function Gallery() {
  const navigate = useNavigate();
  const [visibleCount, setVisibleCount] = useState(8);
  const [artworks, setArtworks] = useState<any[]>([]);
  const [featuredArtworks, setFeaturedArtworks] = useState<any[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<any | null>(null);

  useEffect(() => {

    // Fetch gallery images
    fetch(`${API_BASE_URL}/api/gallery?limit=100`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to load gallery'))
      .then(data => {
        if (data && data.images && data.images.length > 0) {
          // Map MongoDB format
          const formatted = data.images.map((img: any) => {
            const cat = img.category || 'Uncategorized';
            let cleanedCat = cat.replace(/\b(beginner|advanced|intermediate)\b/gi, '')
              .replace(/\(\s*\)/g, '')
              .replace(/^[\s-–—:]+|[\s-–—:]+$/g, '')
              .replace(/\s+/g, ' ')
              .trim();
            if (!cleanedCat) cleanedCat = 'Uncategorized';

            return {
              id: img._id,
              author: img.description || 'Anonymous',
              image: img.imageUrl,
              title: img.title,
              type: cleanedCat
            };
          });
          setArtworks(formatted);

          // Extract featured images
          const featured = data.images
            .filter((img: any) => img.isFeatured)
            .slice(0, 3)
            .map((img: any, idx: number) => {
              const bgColors = ['bg-[#ff8da1]', 'bg-[#59a9ff]', 'bg-[#8dc63f]'];
              const cat = img.category || 'Uncategorized';
              let cleanedCat = cat.replace(/\b(beginner|advanced|intermediate)\b/gi, '')
                .replace(/\(\s*\)/g, '')
                .replace(/^[\s-–—:]+|[\s-–—:]+$/g, '')
                .replace(/\s+/g, ' ')
                .trim();
              if (!cleanedCat) cleanedCat = 'Uncategorized';

              return {
                id: img._id,
                title: img.title,
                author: img.description || 'Anonymous',
                image: img.imageUrl,
                color: bgColors[idx % bgColors.length],
                type: cleanedCat
              };
            });
          if (featured.length > 0) {
            setFeaturedArtworks(featured);
          }
        } else {
          setArtworks([]);
          setFeaturedArtworks([]);
        }
      })
      .catch(err => {
        console.error("Failed to load gallery images:", err);
      });
  }, []);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const displayedArtworks = artworks.slice(0, visibleCount);

  return (
    <>
      <Navbar />
      <div 
        className="text-slate-800 min-h-screen relative overflow-hidden font-sans pt-28"
        style={{
          backgroundImage: `url(${isMobile ? mobileBg : bgImage})`,
          backgroundSize: '100% auto',
          backgroundRepeat: 'repeat-y',
          backgroundPosition: 'top center'
        }}
      >

      {/* Decorative Background Elements */}
      <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] rounded-full filter blur-[80px] opacity-40 pointer-events-none z-0 bg-gradient-to-r from-[#ffa3bc] to-transparent"></div>

      {/* Art Doodles & Splashes */}
      <div className="absolute left-[5%] top-28 pointer-events-none z-0 hidden md:block select-none">
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-25 transform -rotate-45">
          <path d="M18 3L21 6L9 18H6V15L18 3Z" fill="#f1f5f9" />
          <path d="M16 5L19 8" />
          <path d="M6 15L3 21L9 18" />
          <path d="M21 6C21 6 22 8 20 10C18 12 16 12 16 12" />
        </svg>
      </div>

      <div className="absolute right-[5%] top-36 pointer-events-none z-0 hidden md:block select-none">
        <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="opacity-20 transform rotate-12">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 9.5 20.5 7.5 18.5 6.5C18.5 4.5 17 3 15 3C14.5 3 14 3.2 13.5 3.5C12.5 2.5 11 2 9.5 2C5.35786 2 2 5.35786 2 9.5C2 15 7.5 22 12 22Z" fill="#f8fafc" />
          <circle cx="7.5" cy="7.5" r="1.5" fill="#358091" />
          <circle cx="11.5" cy="6.5" r="1.5" fill="#ffd166" />
          <circle cx="15.5" cy="8.5" r="1.5" fill="#ef476f" />
          <circle cx="14.5" cy="13.5" r="1.5" fill="#06d6a0" />
          <circle cx="9.5" cy="16.5" r="2.5" fill="#cbd5e1" />
        </svg>
      </div>

      {/* Paint Splats */}
      <div className="absolute left-[-60px] top-[480px] pointer-events-none z-0 select-none">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="#358091" className="opacity-[0.06]">
          <path d="M30,50 C20,35 10,65 25,75 C40,85 50,65 65,75 C80,85 90,60 80,45 C70,30 85,15 65,20 C45,25 40,5 30,25 C20,45 40,65 30,50 Z" />
          <circle cx="15" cy="25" r="4" />
          <circle cx="85" cy="30" r="3" />
          <circle cx="75" cy="75" r="5" />
          <circle cx="20" cy="80" r="3" />
        </svg>
      </div>

      <div className="absolute right-[-80px] top-[950px] pointer-events-none z-0 select-none">
        <svg width="220" height="220" viewBox="0 0 100 100" fill="#ff9f1c" className="opacity-[0.05]">
          <path d="M40,30 C55,10 60,35 75,25 C90,15 80,45 85,60 C90,75 65,70 55,85 C45,100 35,75 20,80 C5,85 15,55 10,40 C5,25 25,50 40,30 Z" />
          <circle cx="25" cy="15" r="3" />
          <circle cx="88" cy="48" r="4" />
          <circle cx="50" cy="92" r="3" />
          <circle cx="12" cy="65" r="5" />
        </svg>
      </div>

      {/* Floating Sparkles/Stars */}
      <div className="absolute left-[8%] top-[820px] pointer-events-none z-0 select-none animate-pulse hidden lg:block">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="#ffccd5" className="opacity-60">
          <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
        </svg>
      </div>
      
      <div className="absolute right-[12%] top-[620px] pointer-events-none z-0 select-none animate-pulse hidden lg:block">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="#d2ff55" className="opacity-40">
          <path d="M12 2L14.8 8.6L22 9.2L16.5 14L18.2 21L12 17.3L5.8 21L7.5 14L2 9.2L9.2 8.6L12 2Z" />
        </svg>
      </div>

      {/* Lime Green Paint Splash */}
      <div className="absolute right-[10%] top-[450px] pointer-events-none z-0 select-none hidden lg:block">
        <svg width="150" height="150" viewBox="0 0 100 100" fill="#d2ff55" className="opacity-[0.08]">
          <path d="M30,40 C15,30 25,10 40,20 C55,10 65,30 80,25 C95,35 85,55 90,70 C75,85 55,75 40,90 C25,85 10,65 20,50 C30,40 10,45 30,40 Z" />
          <circle cx="85" cy="15" r="4" />
          <circle cx="15" cy="80" r="3" />
        </svg>
      </div>

      {/* Pink Paint Splash */}
      <div className="absolute left-[8%] top-[1750px] pointer-events-none z-0 select-none">
        <svg width="180" height="180" viewBox="0 0 100 100" fill="#ff8aa1" className="opacity-[0.09]">
          <path d="M50,15 C60,5 75,25 70,35 C85,30 90,45 80,55 C95,65 75,70 70,85 C65,100 45,80 35,90 C25,100 10,85 20,70 C5,65 10,45 25,40 C15,25 35,25 50,15 Z" />
          <circle cx="85" cy="20" r="3" />
          <circle cx="15" cy="50" r="4" />
        </svg>
      </div>

      {/* Cute Crayon 1 */}
      <div className="absolute left-[3%] top-[700px] pointer-events-none z-0 hidden xl:block select-none transform rotate-12">
        <svg width="50" height="100" viewBox="0 0 24 48" fill="none" stroke="#ef476f" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 12h12v28H6z" fill="#ffccd5" />
          <path d="M6 12L12 2l6 10H6z" fill="#ef476f" />
          <path d="M8 20h8v4H8z" fill="#ffffff" opacity="0.3" />
          <path d="M10 24l2 4 2-4" stroke="#ffffff" />
        </svg>
      </div>

      {/* Cute Crayon 2 */}
      <div className="absolute right-[4%] top-[1400px] pointer-events-none z-0 hidden xl:block select-none transform -rotate-45">
        <svg width="50" height="100" viewBox="0 0 24 48" fill="none" stroke="#4f46e5" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 12h12v28H6z" fill="#c7d2fe" />
          <path d="M6 12L12 2l6 10H6z" fill="#4f46e5" />
          <path d="M8 20h8v4H8z" fill="#ffffff" opacity="0.3" />
          <path d="M10 24l2 4 2-4" stroke="#ffffff" />
        </svg>
      </div>

      {featuredArtworks.length > 0 && (
        <>
          <header className="relative z-10 text-center px-5 pt-4 pb-6 max-w-xl mx-auto">
            <span className="inline-block bg-[#358091] text-white px-4 py-1.5 rounded-full text-xs font-semibold mb-3 mt-4">
              ⭐ Artist of the Month
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-[#00738e] mb-3 tracking-tight">
              Creative Stars
            </h1>
            <p className="text-slate-500 text-sm md:text-base leading-relaxed">
              Celebrating the bold imaginations and vibrant colors of our most prolific young creators this month.
            </p>
          </header>

          <section className="relative z-10 flex flex-wrap justify-center gap-8 px-5 md:px-10 pb-16">
            {featuredArtworks.map(artist => (
              <div 
                className="bg-white rounded-[24px] p-4 w-[320px] shadow-sm hover:-translate-y-2 transition-transform duration-300 ease-out border border-slate-100 cursor-pointer" 
                key={artist.id}
                onClick={() => setSelectedArtwork(artist)}
              >
                <div className="w-full h-[288px] rounded-2xl overflow-hidden mb-4 bg-slate-100">
                  <img src={getImageUrl(artist.image)} alt={artist.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex justify-between items-center px-2 pb-2">
                  <div>
                    <h3 className="text-[#00738e] font-bold text-lg leading-tight mb-1">{artist.title}</h3>
                    <p className="text-slate-400 text-xs font-semibold mb-2">{artist.author}</p>
                    <span className="text-[10px] font-bold text-white bg-[#00738e] px-2.5 py-0.5 rounded-full">{artist.type}</span>
                  </div>
                  <button 
                    className={`w-10 h-10 rounded-full border-none text-white text-lg cursor-pointer flex items-center justify-center hover:scale-110 transition-transform ${artist.color}`}
                    aria-label="Like"
                  >
                    ♥
                  </button>
                </div>
              </div>
            ))}
          </section>
        </>
      )}

      <section className="relative z-10 max-w-6xl mx-auto px-5 md:px-10 pb-20">
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-800 mb-2">Student Art Gallery</h2>
          <p className="text-slate-500 text-sm">A collection of masterpieces from our latest academy workshop.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-10">
          {displayedArtworks.map(art => (
            <div 
              className="bg-white rounded-2xl p-4 shadow-sm hover:-translate-y-1 transition-transform duration-300 border border-slate-100 flex flex-col justify-between cursor-pointer" 
              key={art.id}
              onClick={() => setSelectedArtwork(art)}
            >
              <div>
                <div className="w-full aspect-square rounded-xl overflow-hidden mb-3 bg-slate-50">
                  <img src={getImageUrl(art.image)} alt={art.title} loading="lazy" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
                <h4 className="m-0 px-2 text-[#00738e] text-base font-bold truncate mb-1">{art.title}</h4>
                <p className="m-0 px-2 text-slate-500 text-xs font-medium truncate mb-2">{art.author}</p>
              </div>
              <div className="px-2 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] font-bold text-white bg-[#00738e] px-2.5 py-0.5 rounded-full">{art.type}</span>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < artworks.length && (
          <div className="text-center">
            <button 
              className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold px-8 py-3 rounded-full cursor-pointer transition-colors duration-200 text-sm"
              onClick={() => setVisibleCount(prev => prev + 4)}
            >
              Load More Masterpieces
            </button>
          </div>
        )}
      </section>

      <section className="relative z-10 px-5 md:px-10 pb-20 max-w-6xl mx-auto">
        <div className="bg-gradient-to-br from-[#00738e] to-[#004e66] rounded-[32px] py-16 px-8 text-center text-white shadow-md">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Start Your Art Journey?</h2>
          <p className="text-base md:text-lg opacity-90 max-w-xl mx-auto mb-8 leading-relaxed">
            Enroll today and let your child explore the magic of colors, shapes, and boundless imagination at Luminous Academy.
          </p>
          <div className="flex justify-center gap-5 flex-wrap">
            <button 
              onClick={() => navigate('/courses')}
              className="bg-white text-[#00738e] font-bold px-8 py-3.5 rounded-full text-base cursor-pointer hover:-translate-y-0.5 transition-transform shadow-md"
            >
              Join the Academy
            </button>
            <button className="bg-transparent text-white border-2 border-white font-bold px-8 py-3 rounded-full text-base cursor-pointer hover:bg-white/10 hover:-translate-y-0.5 transition-all shadow-md">
              Request a Tour
            </button>
          </div>
        </div>
      </section>

      {/* LIGHTBOX MODAL */}
      {selectedArtwork && (
        <div
          className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="bg-white rounded-[2rem] max-w-4xl w-full max-h-[90vh] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button for mobile */}
            <button
              onClick={() => setSelectedArtwork(null)}
              className="absolute top-4 right-4 md:hidden text-white bg-black/50 hover:bg-black/80 rounded-full p-2 z-10"
            >
              <FiX size={20} />
            </button>

            {/* Image */}
            <div className="md:w-2/3 bg-slate-950 flex items-center justify-center min-h-[300px]">
              <img
                src={getImageUrl(selectedArtwork.image)}
                alt={selectedArtwork.title}
                className="w-full h-full object-contain max-h-[50vh] md:max-h-[80vh]"
              />
            </div>

            {/* Details panel */}
            <div className="md:w-1/3 p-6 md:p-8 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-slate-800 leading-tight">{selectedArtwork.title}</h3>
                  <button
                    onClick={() => setSelectedArtwork(null)}
                    className="hidden md:flex text-slate-400 hover:text-slate-600 p-1 shrink-0 ml-2"
                  >
                    <FiX size={24} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="text-xs font-bold text-white bg-[#00738e] px-3 py-1 rounded-full">{selectedArtwork.type}</span>
                </div>

                <p className="text-slate-500 text-sm font-semibold mb-2">Creator</p>
                <p className="text-[#00738e] text-base font-bold mb-4">{selectedArtwork.author}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-auto">
                <button
                  onClick={() => setSelectedArtwork(null)}
                  className="w-full bg-[#00738e] text-white font-bold py-3 rounded-xl hover:bg-[#005c72] transition-colors shadow-sm"
                >
                  Close View
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      </div>
      <Footer />
    </>
  );
}
