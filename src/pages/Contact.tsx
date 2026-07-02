import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

// SVG Icons defined as components for cleanliness
const PhoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6.62 10.79a15.149 15.149 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
  </svg>
);

const MailIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

const PinIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const MinusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Is there a trial class?',
    answer:
      'Yes, we offer a free trial class for all new students. Contact us or register online to schedule your session!',
  },
  {
    question: 'Age requirements?',
    answer:
      'We offer programs tailored to various age groups: Pre-Junior (4–8 years), Junior (9–14 years), and Senior (15+ years).',
  },
];

export const Contact: React.FC = () => {
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Accordion State — first FAQ open by default, matching the design
  const [openFaq, setOpenFaq] = useState<number | null>(0);


  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.email && formData.message) {
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({ name: '', phone: '', email: '', message: '' });
      }, 3000);
    }
  };

  return (
    <div
      className="font-sans text-[#1e295d] bg-[#faf7f0] min-h-screen relative flex flex-col"
      style={{
        backgroundImage: "url('/src/assets/contact-bg.png')",
        backgroundAttachment: 'fixed',
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <Navbar />

      {/* Main Container */}
      <main className="flex-grow w-full max-w-[1100px] mx-auto px-5 pt-28 pb-20 relative z-10 box-border">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="font-fredoka text-4xl md:text-5xl text-[#1b2559] font-bold mb-4 tracking-tight">
            Let's Connect and Create
          </h1>
          <p className="text-lg text-[#616c96]">
            We are here to help you begin your creative journey
          </p>
        </section>

        {/* Contact Info & Message Form */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr] gap-12 mb-20 items-start">
          {/* Info Card Column */}
          <div className="flex flex-col gap-7 pt-5">
            <div className="flex items-center gap-5 bg-transparent rounded-2xl py-1 px-0 transition-transform duration-300 hover:scale-105">
              <div className="flex justify-center items-center w-12 h-12 rounded-full shrink-0 bg-[#005a78] text-white">
                <PhoneIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-[#616c96] uppercase tracking-wider mb-1">Phone</span>
                <span className="text-[17px] font-semibold text-[#1e295d]">+91 9876543210</span>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-transparent rounded-2xl py-1 px-0 transition-transform duration-300 hover:scale-105">
              <div className="flex justify-center items-center w-12 h-12 rounded-full shrink-0 bg-[#e67e9c] text-white">
                <MailIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-[#616c96] uppercase tracking-wider mb-1">Email</span>
                <span className="text-[17px] font-semibold text-[#1e295d]">glosmart@gmail.com</span>
              </div>
            </div>

            <div className="flex items-center gap-5 bg-transparent rounded-2xl py-1 px-0 transition-transform duration-300 hover:scale-105">
              <div className="flex justify-center items-center w-12 h-12 rounded-full shrink-0 bg-[#c7a73e] text-white">
                <PinIcon />
              </div>
              <div className="flex flex-col">
                <span className="text-[12px] font-extrabold text-[#616c96] uppercase tracking-wider mb-1">Address</span>
                <span className="text-[17px] font-semibold text-[#1e295d]">24, K.K Nagar, Sivakasi - 626123</span>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-[28px] p-10 shadow-lg shadow-slate-100/40 border border-white/80">
            <h2 className="font-fredoka text-2xl text-[#b84d63] font-bold text-center mb-7">Send Us a Message</h2>
            {isSubmitted ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#10b981', fontWeight: 'bold' }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ marginBottom: '16px' }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                <p>Thank you! Your message has been sent successfully.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="name" className="text-[15px] font-semibold text-[#1e295d]">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-[#e8e5e1] border-none rounded-lg py-3.5 px-4 font-sans text-[15px] text-[#1e295d] outline-none transition-all duration-300 focus:bg-[#dfdbd6] focus:ring-2 focus:ring-[#b84d63]/15"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="phone" className="text-[15px] font-semibold text-[#1e295d]">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="bg-[#e8e5e1] border-none rounded-lg py-3.5 px-4 font-sans text-[15px] text-[#1e295d] outline-none transition-all duration-300 focus:bg-[#dfdbd6] focus:ring-2 focus:ring-[#b84d63]/15"
                  />
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="email" className="text-[15px] font-semibold text-[#1e295d]">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="bg-[#e8e5e1] border-none rounded-lg py-3.5 px-4 font-sans text-[15px] text-[#1e295d] outline-none transition-all duration-300 focus:bg-[#dfdbd6] focus:ring-2 focus:ring-[#b84d63]/15"
                    required
                  />
                </div>

                <div className="flex flex-col gap-2 mb-5">
                  <label htmlFor="message" className="text-[15px] font-semibold text-[#1e295d]">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="bg-[#e8e5e1] border-none rounded-lg py-3.5 px-4 font-sans text-[15px] text-[#1e295d] outline-none transition-all duration-300 focus:bg-[#dfdbd6] focus:ring-2 focus:ring-[#b84d63]/15 resize-y min-h-[90px]"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="w-full bg-[#00668f] text-white border-none rounded-lg py-4 text-[16px] font-bold cursor-pointer transition-colors duration-300 hover:bg-[#005172] active:scale-[0.99] mt-2.5">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Visit section */}
        <section className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 mb-20 items-stretch">
          <div className="bg-white rounded-3xl p-8 shadow-lg shadow-slate-100/40 border border-white/80 flex flex-col justify-center">
            <h3 className="font-fredoka text-[26px] font-bold text-[#004b73] mb-4">Come Visit Us!</h3>
            <p className="text-[15px] leading-relaxed text-[#616c96] mb-6">Our studio is located in the heart of the Art District. Look for the building with the colorful mural!</p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[15px] font-bold text-[#00668f] no-underline inline-flex items-center gap-1.5 transition-all hover:gap-2.5 hover:underline">
              Get Directions <ArrowRightIcon />
            </a>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-lg shadow-slate-100/40 border border-white/80 h-[280px] relative bg-[#e5e9f0]">
            <iframe
              title="GloSmart Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555138407!2d-122.50764020300378!3d37.75781499691929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              allowFullScreen={true}
              loading="lazy"
              className="w-full h-full border-none block"
            ></iframe>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="text-center mb-20">
          <h2 className="font-fredoka text-[34px] font-bold text-[#004b73] mb-3">Common Questions</h2>
          <p className="text-[15px] text-[#616c96] mb-10">Maybe we already answered your masterpiece curiosity?</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[900px] mx-auto mb-8 text-left">
            {FAQS.map((faq, index) => (
              <div key={faq.question} className={`bg-white rounded-3xl shadow-sm border border-white/80 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md overflow-hidden ${openFaq === index ? 'border-[#00668f]/20' : ''}`}>
                <button className="w-full bg-transparent border-none flex justify-between items-center py-[26px] px-7 text-left text-[17px] font-semibold text-[#1b2559] cursor-pointer outline-none font-fredoka" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <span className={`flex items-center justify-center w-8 h-8 rounded-full border shrink-0 transition-all duration-300 ${openFaq === index ? 'bg-[#00668f] border-[#00668f] text-white' : 'bg-transparent border-[#1b2559] text-[#1b2559]'}`}>
                    {openFaq === index ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-7 pb-6 text-[14px] leading-relaxed text-[#616c96] border-t border-slate-50 pt-4">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <span className="inline-block text-[14px] font-bold text-[#00668f] underline cursor-pointer hover:opacity-80 transition-opacity">View all FAQs</span>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1b2559] text-white rounded-t-[50px] px-10 pt-16 pb-8 relative z-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[1.2fr_0.8fr_1fr_1fr] gap-10 mb-12">
          <div className="flex flex-col gap-5">
            <Link to="/" className="font-fredoka text-3xl font-bold text-white no-underline">
              Glo<span className="text-[#38bdf8]">Smart</span>
            </Link>
            <p className="text-[14px] leading-relaxed text-slate-400 max-w-[240px]">
              Nurturing creativity, one brushstroke at a time.
            </p>
            <div className="flex gap-3">
              <a href="#" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white no-underline transition-all hover:bg-white/10 hover:border-white/40">
                <ShareIcon />
              </a>
              <a href="mailto:glosmart@gmail.com" className="flex items-center justify-center w-10 h-10 rounded-full border border-white/20 text-white no-underline transition-all hover:bg-white/10 hover:border-white/40">
                <MailIcon />
              </a>
            </div>
          </div>

          <div className="flex flex-col">
            <h4 className="font-fredoka text-[16px] font-semibold text-white mb-6">Quick Links</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              <li><Link to="/" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Home</Link></li>
              <li><Link to="/" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">About</Link></li>
              <li><Link to="/contact" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Contact</Link></li>
              <li><Link to="/gallery" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Gallery</Link></li>
              <li><Link to="/faqs" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">FAQs</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="font-fredoka text-[16px] font-semibold text-white mb-6">Our Courses</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              <li><Link to="/courses" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Pre-Junior Batch (4 – 8 Years)</Link></li>
              <li><Link to="/courses" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Junior Batch (9 – 14 Years)</Link></li>
              <li><Link to="/courses" className="text-[13px] text-slate-400 no-underline transition-colors hover:text-white">Senior Batch (15+ Years)</Link></li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="font-fredoka text-[16px] font-semibold text-white mb-6">Contact</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-3.5">
              <li className="flex flex-col gap-1">
                <span className="text-[13px] text-slate-400">+91 98765 43210</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[13px] text-slate-400">glosmart@gmail.com</span>
              </li>
              <li className="flex flex-col gap-1">
                <span className="text-[13px] text-slate-400">24, K.K Nagar, Sivakasi - 626123</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-[1100px] mx-auto border-t border-white/10 pt-6 flex flex-col sm:flex-row justify-between items-center text-[12px] text-slate-500 gap-4">
          <p>© 2024 Luminous Academy. Built for the dreamers and creators.</p>
          <div className="flex gap-6 items-center">
            <span>Designed with ❤️ for Kids</span>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#84cc16]"></div>
              <span>Learning Platform Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
