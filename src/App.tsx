import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isContactPage = location.pathname === '/contact';

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe]">
      {/* Floating sticky Navbar */}
      {!isContactPage && <Navbar />}

      {/* Main Content Area */}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {!isContactPage && <Footer />}
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
