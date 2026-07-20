import React, { useState } from 'react';
import { FiCheck } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import loginImg from '../assets/login.png';
import crayonImg from '../assets/crayon.png';

const Signup: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, phoneNumber, email, password })
      });
      const data = await res.json();
      
      if (res.ok) {
        navigate('/login', { state: { signupSuccess: true } });
      } else {
        setError(data.message || 'Signup failed');
      }
    } catch (err) {
      setError('An error occurred during signup');
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

        {/* Right Column - Signup Form */}
        <div className="flex justify-center lg:justify-end relative">
          
          {/* Crayon Box Decorative */}
          <div className="absolute -bottom-16 -right-16 w-56 h-56 pointer-events-none hidden lg:block z-0 drop-shadow-2xl">
            <img src={crayonImg} alt="Crayon Box" className="w-full h-full object-contain" />
          </div>

          <div className="w-full max-w-[520px] bg-white rounded-[2.5rem] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-50 relative z-10">
            
            {/* Floating "Art is Calling" badge */}
            <div className="absolute -top-4 -right-2 bg-[#7c631e] text-white text-xs font-bold px-4 py-1.5 rounded-full transform rotate-3 shadow-lg">
              Art is Calling!
            </div>

            <div className="flex flex-col mb-8">
              <h2 className="text-3xl font-extrabold text-[#112a36] mb-2">Create Account</h2>
              <p className="text-slate-500 text-sm">Fill in your details to start sparking ideas!</p>
            </div>

            <button className="w-full bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl py-3.5 flex items-center justify-center gap-3 transition-colors shadow-sm mb-6">
              <FcGoogle size={20} />
              Sign up with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-slate-200"></div>
              <span className="text-xs font-semibold text-slate-400">OR</span>
              <div className="flex-1 h-px bg-slate-200"></div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4 text-center font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSignup} className="flex flex-col gap-4">
              
              {/* Full Name & Phone Number Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Claude Monet"
                    className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phone Number</label>
                  <input 
                    type="tel" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1(555) 000-0000"
                    className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
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

              {/* Password & Confirm Password Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400 tracking-widest"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f4f7f9] text-slate-800 rounded-xl px-4 py-3.5 text-sm font-medium outline-none border border-transparent focus:border-[#007b8b]/30 focus:bg-white transition-all placeholder-slate-400 tracking-widest"
                    required
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#005c6a] hover:bg-[#004853] text-white font-bold rounded-xl py-3.5 mt-4 transition-colors shadow-lg shadow-teal-900/10"
              >
                Sign Up
              </button>
            </form>

            <div className="text-center mt-8 text-sm text-slate-600 font-medium">
              Already have an account? <Link to="/login" className="text-[#007b8b] font-bold hover:underline">Log in</Link>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Signup;
