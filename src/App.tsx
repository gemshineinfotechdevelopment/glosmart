import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { FiBell, FiX } from 'react-icons/fi';
import { API_BASE_URL } from './config/api';
import ProtectedRoute from './components/ProtectedRoute';
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
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage';
import AdminAttendancePage from './pages/admin/AdminAttendancePage';
import TutorReports from './pages/admin/TutorReports';
import BatchTransferManagement from './pages/admin/BatchTransferManagement';
import AdminLayout from './layouts/AdminLayout';

// Student Pages
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentCourses from './pages/student/StudentCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentFees from './pages/student/StudentFees';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentLayout from './layouts/StudentLayout';

import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent(): React.JSX.Element {
  const location = useLocation();
  const { user } = useAuth();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const socket = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      timeout: 10000
    });

    socket.on('connect', () => {
      console.log('Socket client connected to backend');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });

    socket.on('notification', (notif: any) => {
      const isAdmin = user.role === 'admin';
      const isMyNotification = user.role === 'student' && notif.email && user.email.toLowerCase() === notif.email.toLowerCase();

      if (isAdmin || isMyNotification) {
        setToastMessage(notif.message);
        setTimeout(() => setToastMessage(null), 6000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isStudentPage = location.pathname.startsWith('/student');
  const isGalleryPage = location.pathname === '/gallery';

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe] w-full overflow-x-hidden relative">
      {/* Floating sticky Navbar */}
      {!isAdminPage && !isStudentPage && !isGalleryPage && <Navbar />}

      {/* Main Content Area */}
      <div className={(isAdminPage || isStudentPage) ? "" : "flex-grow"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/courses" element={<Course />} />
          <Route path="/faqs" element={<Faqs />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Admin Routes — nested under AdminLayout so sidebar persists */}
          <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin', 'teacher']}><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="courses" element={<AdminCoursePage />} />
            <Route path="courses/new" element={<AdminCreateCoursePage />} />
            <Route path="courses/edit/:id" element={<AdminCreateCoursePage />} />
            <Route path="courses/:id/batches" element={<AdminCourseBatchesPage />} />
            <Route path="teachers" element={<ProtectedRoute allowedRoles={['admin']}><Teachers /></ProtectedRoute>} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['admin']}><FeesPayments /></ProtectedRoute>} />
            <Route path="students" element={<Students />} />
            <Route path="students/:batchId" element={<BatchDetails />} />
            <Route path="transfers" element={<ProtectedRoute allowedRoles={['admin']}><BatchTransferManagement /></ProtectedRoute>} />
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="tutor-reports" element={<TutorReports />} />
          </Route>

          {/* Student Routes — nested under StudentLayout */}
          <Route path="/student" element={<ProtectedRoute allowedRoles={['student']}><StudentLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/student/dashboard" replace />} />
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="profile" element={<StudentProfile />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="courses" element={<StudentCourses />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="fees" element={<StudentFees />} />
          </Route>

          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {!isLoginPage && !isSignupPage && !isAdminPage && !isStudentPage && !isGalleryPage && <Footer />}

      {/* Real-time Socket Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-[9999] bg-[#1c1c28] text-white border border-slate-700/50 p-4 rounded-2xl shadow-2xl flex items-center gap-3 animate-fade-in font-sans max-w-sm">
          <div className="w-8 h-8 rounded-full bg-[#6247df] text-white flex items-center justify-center shrink-0">
            <FiBell size={14} className="animate-bounce" />
          </div>
          <div className="flex-grow">
            <p className="text-[10px] font-black uppercase text-[#6247df] tracking-widest leading-none mb-1">New Alert</p>
            <p className="text-xs font-semibold text-slate-350 leading-normal">{toastMessage}</p>
          </div>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-450 hover:text-white p-1 bg-transparent border-none cursor-pointer shrink-0"
          >
            <FiX size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

function ScrollToTop(): null {
  const { pathname } = useLocation();

  React.useEffect(() => {
    // Don't scroll to top for admin/student pages — they use a fixed sidebar layout
    const isAdminOrStudent = pathname.startsWith('/admin') || pathname.startsWith('/student');
    if (!isAdminOrStudent) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
}

function App(): React.JSX.Element {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

