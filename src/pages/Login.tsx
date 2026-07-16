import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import loginImg from '../assets/login.png';
import crayonImg from '../assets/crayon.png';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        login(data);
        if (data.role === 'student') {
          try {
            const studentRes = await fetch(`http://127.0.0.1:5000/api/students/${data.profileId}`);
            if (studentRes.ok) {
              const studentData = await studentRes.json();
              if (!studentData.enrolledCourses || studentData.enrolledCourses.length === 0) {
                navigate('/student/courses', { state: { fromRestricted: true } });
                return;
              }
            }
          } catch (err) {
            console.error('Error checking student enrollment on login:', err);
          }
          navigate('/student/dashboard');
        } else {
          navigate('/admin');
        }
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    }
  };

  return (
    <div className="min-h-screen bg-[#fafbfc] flex flex-col font-sans relative overflow-hidden">
      
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-6 pt-32 pb-20 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
        
        {/* Left Column - Branding */}
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 bg-[#e0f7fa] text-[#00838f] text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider self-start shadow-sm">
            <div className="w-4 h-4 bg-[#00838f] text-white rounded-full flex items-center justify-center">
              <FiCheck size={10} strokeWidth={4} />
            </div>
            UNLEASH YOUR CREATIVITY
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#112a36] leading-tight tracking-tight">
            Start Your <span className="text-[#007b8b] italic pr-1">Creative</span><br />
            Journey Today
          </h1>
          
          <p className="text-slate-600 text-lg leading-relaxed max-w-md">
            Join a community of 5,000+ young artists exploring digital painting, traditional sketching, and 3D modeling.
          </p>

          <div className="mt-8 relative max-w-[500px]">
            {/* The Illustration placeholder */}
            <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-slate-100 relative">
               <img 
                 src={loginImg} 
                 alt="Students creating art" 
                 className="w-full h-full object-cover"
               />
               <div className="absolute inset-0 bg-[#007b8b]/10 mix-blend-overlay"></div>
            </div>
            
            {/* Floating Students online badge */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[85%] bg-white/90 backdrop-blur-md rounded-2xl py-3 px-6 shadow-xl flex items-center gap-4">
              <div className="flex -space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-200 border-2 border-white shadow-sm"></div>
                <div className="w-8 h-8 rounded-full bg-pink-200 border-2 border-white shadow-sm"></div>
                <div className="w-8 h-8 rounded-full bg-yellow-200 border-2 border-white shadow-sm"></div>
              </div>
              <span className="font-bold text-sm text-[#007b8b]">500+ Students online now</span>
            </div>
          </div>
        </div>

        {/* Right Column - Login Form */}
        <div className="flex justify-center lg:justify-end relative">
          
          {/* Crayon Box Decorative */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 pointer-events-none hidden lg:block z-0 drop-shadow-2xl">
            <img src={crayonImg} alt="Crayon Box" className="w-full h-full object-contain" />
          </div>

          <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-50 relative z-10">
            
            {/* Floating "Art is Calling" badge */}
            <div className="absolute -top-4 -right-2 bg-[#7c631e] text-white text-xs font-bold px-4 py-1.5 rounded-full transform rotate-3 shadow-lg">
              Art is Calling!
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="w-14 h-14 bg-[#007b8b] rounded-2xl flex items-center justify-center mb-6 shadow-md text-white">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                  <polyline points="10 17 15 12 10 7"></polyline>
                  <line x1="15" y1="12" x2="3" y2="12"></line>
                </svg>
              </div>
              <h2 className="text-3xl font-extrabold text-[#112a36] mb-2">Welcome Back!</h2>
              <p className="text-slate-500 text-sm">Ready to ignite your next masterpiece?</p>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-sm text-yellow-800">
              <p className="font-bold mb-2">Demo Credentials:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><span className="font-semibold">Admin:</span> admin@glosmart.com / admin</li>
                <li><span className="font-semibold">Teacher:</span> teacher@glosmart.com / teacher</li>
                <li><span className="font-semibold">Student:</span> student@glosmart.com / student</li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="abcdefgh@gmail.com"
                  className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <a href="#" className="text-xs font-bold text-[#007b8b] hover:underline">Forgot?</a>
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400 tracking-widest"
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-[#005c6a] hover:bg-[#004853] text-white font-bold rounded-xl py-3.5 mt-2 transition-colors shadow-lg shadow-teal-900/10"
              >
                Log In
              </button>
            </form>

            <div className="flex items-center gap-4 my-8">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-semibold text-slate-500">Or continue with</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl py-3.5 flex items-center justify-center gap-3 transition-colors shadow-sm">
              <FcGoogle size={20} />
              Log in with Google
            </button>

            <div className="text-center mt-8 text-sm text-slate-600 font-medium">
              New to Academy? <Link to="/signup" className="text-[#007b8b] font-bold hover:underline">Sign up</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
