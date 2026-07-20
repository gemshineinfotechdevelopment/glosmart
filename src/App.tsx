import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import AdminLayout from './layouts/AdminLayout';

// Student Pages
import StudentProfile from './pages/student/StudentProfile';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentCourses from './pages/student/StudentCourses';
import StudentAssignments from './pages/student/StudentAssignments';
import StudentFees from './pages/student/StudentFees';
import StudentDashboard from './pages/student/StudentDashboard';

import { AuthProvider } from './context/AuthContext';

function AppContent(): React.JSX.Element {
  const location = useLocation();

  const isLoginPage = location.pathname === '/login';
  const isSignupPage = location.pathname === '/signup';
  const isAdminPage = location.pathname.startsWith('/admin');
  const isStudentPage = location.pathname.startsWith('/student');
  const isGalleryPage = location.pathname === '/gallery';

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfbfe] w-full overflow-x-hidden">
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
            <Route path="gallery" element={<AdminGalleryPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
            <Route path="notifications" element={<AdminNotificationsPage />} />
            <Route path="attendance" element={<AdminAttendancePage />} />
            <Route path="tutor-reports" element={<TutorReports />} />
          </Route>

          {/* Student Routes */}
          <Route path="/student/profile" element={<ProtectedRoute allowedRoles={['student']}><StudentProfile /></ProtectedRoute>} />
          <Route path="/student/attendance" element={<ProtectedRoute allowedRoles={['student']}><StudentAttendance /></ProtectedRoute>} />
          <Route path="/student/courses" element={<ProtectedRoute allowedRoles={['student']}><StudentCourses /></ProtectedRoute>} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={['student']}><StudentAssignments /></ProtectedRoute>} />
          <Route path="/student/fees" element={<ProtectedRoute allowedRoles={['student']}><StudentFees /></ProtectedRoute>} />
          <Route path="/student/dashboard" element={<ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>} />

          {/* Fallback route back to About page */}
          <Route path="*" element={<About />} />
        </Routes>
      </div>

      {/* Footer */}
      {!isLoginPage && !isSignupPage && !isAdminPage && !isStudentPage && !isGalleryPage && <Footer />}
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

