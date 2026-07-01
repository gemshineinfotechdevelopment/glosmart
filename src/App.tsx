import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './pages/About';

function App(): React.JSX.Element {
  return (
    <Router>
      <div className="flex flex-col min-h-screen bg-[#fcfbfe] w-full overflow-x-hidden">
        {/* Floating sticky Navbar */}
        <Navbar />

        {/* Main Content Area */}
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<About />} />
            {/* Fallback route back to About page */}
            <Route path="*" element={<About />} />
          </Routes>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
