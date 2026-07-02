import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe]">
      {/* Floating sticky Navbar */}
      {!isAdminPage && <Navbar />}

      {/* Main Content Area */}
      <div className={isAdminPage ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {!isLoginPage && !isAdminPage && <Footer />}
    </div>
  );
}

function App(): React.JSX.Element {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
