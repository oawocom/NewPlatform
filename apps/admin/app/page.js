'use client';
import { useState, useEffect } from 'react';
import { BRANDING } from './config/branding';
import { MODULES } from './config/modules';
import axios from 'axios';

const API_URL = '/api/v1';

export default function HomePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showModulesPopup, setShowModulesPopup] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setNextIndex((currentIndex + 1) % MODULES.length);
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % MODULES.length);
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({ ...prev, [name]: value }));
    if (loginErrors[name]) setLoginErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!loginData.email.trim()) newErrors.email = 'Email is required';
    if (!loginData.password) newErrors.password = 'Password is required';
    setLoginErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    setLoginLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, loginData);
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify({
        ...response.data.user,
        tenant_id: response.data.tenant.id
      }));
      window.location.href = '/admin/dashboard';
    } catch (error) {
      setLoginErrors({ submit: error.response?.data?.detail || 'Login failed' });
    }
    setLoginLoading(false);
  };

  const currentModule = MODULES[currentIndex];
  const nextModule = MODULES[nextIndex];

  const [isDesktop, setIsDesktop] = useState(false);
  useEffect(() => {
    const checkDesktop = () => setIsDesktop(window.innerWidth >= 768);
    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <style jsx>{`
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes arrowSlide {
          0%, 100% { transform: translateX(0) translateY(-50%); }
          50% { transform: translateX(8px) translateY(-50%); }
        }
        .slide-out-up {
          animation: slideOutUp 0.5s forwards;
        }
        .slide-in-up {
          animation: slideInUp 0.5s forwards;
        }
        .arrow-animate {
          animation: arrowSlide 1.2s ease-in-out infinite;
        }
      `}</style>

      <div className="max-w-6xl mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          
          {/* LEFT */}
          <div>
            <img src={BRANDING.logo.image} alt={BRANDING.logo.alt} className="h-16 mb-4" />
            
            <div className="mb-4">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Build Your Digital Empire
              </h1>
              <p className="text-xl text-gray-600">
                Everything you need to run your business in one powerful platform
              </p>
            </div>

            {/* Animation Container with Arrow 100px from right */}
            <div className="relative h-24 overflow-visible">
              <div 
                className={`flex items-start space-x-4 absolute w-full ${
                  isTransitioning ? 'slide-out-up' : ''
                }`}
              >
                <span className="text-5xl flex-shrink-0">{currentModule.icon}</span>
                <div className="flex-1 pr-16">
                  <h3 className="font-bold text-gray-900 text-xl mb-1">{currentModule.title}</h3>
                  <p className="text-gray-600 text-base">{currentModule.description}</p>
                </div>

                {/* Arrow positioned 100px from right edge */}
                {isDesktop && (
                  <button
                    onClick={() => setShowModulesPopup(true)}
                    className="absolute right-[100px] top-1/2 text-gray-700 hover:text-primary-600 transition-colors arrow-animate"
                    title="View all modules"
                  >
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>

              {isTransitioning && (
                <div className="flex items-start space-x-4 absolute w-full slide-in-up">
                  <span className="text-5xl flex-shrink-0">{nextModule.icon}</span>
                  <div className="flex-1 pr-16">
                    <h3 className="font-bold text-gray-900 text-xl mb-1">{nextModule.title}</h3>
                    <p className="text-gray-600 text-base">{nextModule.description}</p>
                  </div>

                  {/* Arrow for next module */}
                  {isDesktop && (
                    <button
                      onClick={() => setShowModulesPopup(true)}
                      className="absolute right-[100px] top-1/2 text-gray-700 hover:text-primary-600 transition-colors arrow-animate"
                      title="View all modules"
                    >
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Join text */}
            <p className="text-gray-700 text-lg mt-2 mb-4">
              <span className="font-bold text-gray-900">Join 10,000+ businesses</span> already growing with Buildown
            </p>
            <a 
              href="/register" 
              className="inline-block bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-8 rounded-xl transition text-lg"
            >
              Start Free Trial →
            </a>
          </div>

          {/* RIGHT - Login Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-6">Sign in to your account to continue</p>

            {loginErrors.submit && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-sm">{loginErrors.submit}</p>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="you@company.com"
                />
                {loginErrors.email && <p className="text-red-500 text-xs mt-1">{loginErrors.email}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot?
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                  placeholder="••••••••"
                />
                {loginErrors.password && <p className="text-red-500 text-xs mt-1">{loginErrors.password}</p>}
              </div>

              <button 
                type="submit" 
                disabled={loginLoading}
                className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
              >
                {loginLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="text-primary-600 hover:text-primary-700 font-semibold">Create account</a>
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* Modules Popup */}
      {showModulesPopup && isDesktop && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 z-50"
          onClick={() => setShowModulesPopup(false)}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl w-full h-full flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-3xl font-bold text-gray-900">All Platform Modules</h2>
              <button
                onClick={() => setShowModulesPopup(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light"
              >
                ×
              </button>
            </div>
            
            <div className="p-8 flex-1 grid grid-cols-5 gap-4 auto-rows-min">
              {MODULES.map((module) => (
                <div 
                  key={module.id} 
                  className="p-3 border border-gray-200 rounded-xl hover:border-primary-500 hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center">
                    <span className="text-3xl mb-2">{module.icon}</span>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">{module.title}</h3>
                    <p className="text-gray-600 text-xs leading-tight">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
