import React, { useState, useEffect } from 'react';
import './Contact.css';

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

  // Scroll State
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
    <div className="contact-page-container">
      {/* Header/Navbar */}
      <header className={`contact-header ${isScrolled ? 'scrolled' : ''}`}>
        <div className="nav-pill-container">
          <a href="#" className="nav-logo">
            Glo<span>Smart</span>
          </a>
          <nav>
            <ul className="nav-links">
              <li><a href="#about">ABOUT</a></li>
              <li><a href="#contact" className="active">CONTACT</a></li>
              <li><a href="#gallery">GALLERY</a></li>
              <li><a href="#courses">COURSES</a></li>
              <li><a href="#faqs">FAQS</a></li>
            </ul>
          </nav>
          <div className="nav-actions">
            <a href="#login" className="btn-login">Login</a>
            <a href="#join" className="btn-join">Join Academy</a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="contact-main-content">
        {/* Hero Section */}
        <section className="contact-hero">
          <h1>Let's Connect and Create</h1>
          <p>We are here to help you begin your creative journey</p>
        </section>

        {/* Contact Info & Message Form */}
        <section className="info-form-grid">
          <div className="info-column">
            <div className="info-card phone">
              <div className="info-icon-wrapper">
                <PhoneIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Phone</span>
                <span className="info-value">+91 9876543210</span>
              </div>
            </div>

            <div className="info-card email">
              <div className="info-icon-wrapper">
                <MailIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Email</span>
                <span className="info-value">glosmart@gmail.com</span>
              </div>
            </div>

            <div className="info-card address">
              <div className="info-icon-wrapper">
                <PinIcon />
              </div>
              <div className="info-details">
                <span className="info-label">Address</span>
                <span className="info-value">24, K.K Nagar, Sivakasi - 626123</span>
              </div>
            </div>
          </div>

          <div className="message-form-card">
            <h2>Send Us a Message</h2>
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
                <div className="form-group">
                  <label htmlFor="name">Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn-send-message">
                  Send Message
                </button>
              </form>
            )}
          </div>
        </section>

        {/* Visit section */}
        <section className="visit-section">
          <div className="come-visit-card">
            <h3>Come Visit Us!</h3>
            <p>Our studio is located in the heart of the Art District. Look for the building with the colorful mural!</p>
            <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="link-directions">
              Get Directions <ArrowRightIcon />
            </a>
          </div>

          <div className="map-container">
            <iframe
              title="GloSmart Studio Location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555138407!2d-122.50764020300378!3d37.75781499691929!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80859a6d00690021%3A0x4a501367f076adff!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              allowFullScreen={true}
              loading="lazy"
            ></iframe>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2>Common Questions</h2>
          <p className="faq-subtitle">Maybe we already answered your masterpiece curiosity?</p>

          <div className="faq-grid">
            {FAQS.map((faq, index) => (
              <div key={faq.question} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                <button className="faq-trigger" onClick={() => toggleFaq(index)}>
                  <span>{faq.question}</span>
                  <span className="faq-icon-circle">
                    {openFaq === index ? <MinusIcon /> : <PlusIcon />}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="faq-content">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>

          <span className="link-all-faqs">View all FAQs</span>
        </section>
      </main>

      {/* Footer */}
      <footer className="contact-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <a href="#" className="footer-logo">
              Glo<span>Smart</span>
            </a>
            <p className="footer-description">
              Nurturing creativity, one brushstroke at a time.
            </p>
            <div className="footer-socials">
              <a href="#" className="social-btn">
                <ShareIcon />
              </a>
              <a href="mailto:glosmart@gmail.com" className="social-btn">
                <MailIcon />
              </a>
            </div>
          </div>

          <div className="footer-column">
            <h4>Quick Links</h4>
            <ul className="footer-links">
              <li><a href="#home">Home</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
              <li><a href="#gallery">Gallery</a></li>
              <li><a href="#faqs">FAQs</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Our Courses</h4>
            <ul className="footer-links">
              <li><a href="#pre-junior">Pre-Junior Batch (4 – 8 Years)</a></li>
              <li><a href="#junior">Junior Batch (9 – 14 Years)</a></li>
              <li><a href="#senior">Senior Batch (15+ Years)</a></li>
            </ul>
          </div>

          <div className="footer-column">
            <h4>Contact</h4>
            <ul className="footer-links">
              <li className="footer-contact-item">
                <span>+91 98765 43210</span>
              </li>
              <li className="footer-contact-item">
                <span>glosmart@gmail.com</span>
              </li>
              <li className="footer-contact-item">
                <span>24, K.K Nagar, Sivakasi - 626123</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2024 Luminous Academy. Built for the dreamers and creators.</p>
          <div className="footer-bottom-right">
            <span>Designed with ❤️ for Kids</span>
            <div className="status-indicator">
              <div className="status-dot"></div>
              <span>Learning Platform Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
