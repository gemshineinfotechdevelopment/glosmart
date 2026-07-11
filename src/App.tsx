import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';
import Contact from './pages/Contact';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Course from './pages/Course';
import Faqs from './pages/Faqs';
import AdminDashboard from './pages/admin/Dashboard';
import AdminCoursePage from './pages/admin/AdminCoursePage.tsx';
import AdminCreateCoursePage from './pages/admin/AdminCreateCoursePage';
import AdminCourseBatchesPage from './pages/admin/AdminCourseBatchesPage.tsx';
import Teachers from './pages/admin/Teachers';

import FeesPayments from './pages/admin/FeesPayments';
import Students from './pages/admin/Students';
import BatchDetails from './pages/admin/BatchDetails';
import AdminGalleryPage from './pages/admin/AdminGalleryPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';


function AppContent(): React.JSX.Element {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isGalleryPage = location.pathname === '/gallery';

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe] w-full overflow-x-hidden">
      {/* Floating sticky Navbar */}
      {!isAdminPage && !isGalleryPage && <Navbar />}

      {/* Main Content Area */}
      <div className={isAdminPage ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/courses" element={<AdminCoursePage />} />
          <Route path="/admin/courses/new" element={<AdminCreateCoursePage />} />
          <Route path="/admin/courses/edit/:id" element={<AdminCreateCoursePage />} />
          <Route path="/admin/courses/:id/batches" element={<AdminCourseBatchesPage />} />
          <Route path="/admin/teachers" element={<Teachers />} />
          <Route path="/admin/fees" element={<FeesPayments />} />
          <Route path="/admin/students" element={<Students />} />
          <Route path="/admin/students/:batchId" element={<BatchDetails />} />
          <Route path="/admin/gallery" element={<AdminGalleryPage />} />
          <Route path="/admin/settings" element={<AdminSettingsPage />} />

          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {!isLoginPage && !isSignupPage && !isAdminPage && !isGalleryPage && <Footer />}
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

