import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';
  const isGalleryPage = location.pathname === '/gallery';

  // Hide the global Navbar and Footer on /contact and /gallery as they render their own custom headers/footers
  const showNavbarFooter = !isContactPage && !isGalleryPage;

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe]">
      {/* Floating sticky Navbar */}
      {showNavbarFooter && <Navbar />}

      {/* Main Content Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {showNavbarFooter && <Footer />}
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
