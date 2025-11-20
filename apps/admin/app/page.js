'use client';
import { useState, useEffect } from 'react';
import { BRANDING } from './config/branding';
import { MODULES } from './config/modules';

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
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: loginData.email,
          password: loginData.password
        })
      });

      if (!response.ok) {
        const error = await response.json();
        
        if (error.detail === 'Please verify your email before logging in') {
          const confirmResend = confirm('Your email is not verified yet. Would you like to resend the verification code?');
          if (confirmResend) {
            const resendRes = await fetch(`${API_URL}/auth/resend-otp?email=${encodeURIComponent(loginData.email)}`, {
              method: 'POST'
            });
            const resendData = await resendRes.json();
            
            if (resendData.email_sent) {
              alert('✅ Verification code sent! Check your email.');
              window.location.href = `/verify-email?email=${encodeURIComponent(loginData.email)}`;
            } else {
              setLoginErrors({ submit: 'Failed to send verification code. Please try again.' });
            }
          } else {
            window.location.href = `/verify-email?email=${encodeURIComponent(loginData.email)}`;
          }
          return;
        }
        
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      window.location.href = '/admin/dashboard';
    } catch (error) {
      setLoginErrors({ submit: error.message || 'Login failed' });
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
        <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
          
          <div className="text-center md:text-left">
            <img src={BRANDING.logo.image} alt={BRANDING.logo.alt} className="h-16 mb-6 mx-auto md:mx-0" />
            
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Build Your Digital Empire
              </h1>
              <p className="text-lg md:text-xl text-gray-600">
                Everything you need to run your business in one powerful platform
              </p>
            </div>

            {isDesktop && (
              <>
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

                    <button
                      onClick={() => setShowModulesPopup(true)}
                      className="absolute right-[60px] top-1/2 text-gray-700 hover:text-primary-600 transition-colors arrow-animate"
                      title="View all modules"
                    >
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>

                  {isTransitioning && (
                    <div className="flex items-start space-x-4 absolute w-full slide-in-up">
                      <span className="text-5xl flex-shrink-0">{nextModule.icon}</span>
                      <div className="flex-1 pr-16">
                        <h3 className="font-bold text-gray-900 text-xl mb-1">{nextModule.title}</h3>
                        <p className="text-gray-600 text-base">{nextModule.description}</p>
                      </div>

                      <button
                        onClick={() => setShowModulesPopup(true)}
                        className="absolute right-[60px] top-1/2 text-gray-700 hover:text-primary-600 transition-colors arrow-animate"
                        title="View all modules"
                      >
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-left">
                  <p className="text-gray-700 font-medium">
                    ✨ Join thousands of businesses already transforming their operations
                  </p>
                  <p className="text-gray-600 text-sm">
                    🚀 Get started in minutes • 💪 No credit card required • 🎉 14-day free trial
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
              <p className="text-gray-600 mt-1">Welcome back! Please enter your details.</p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    loginErrors.email ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-500`}
                  placeholder="you@example.com"
                />
                {loginErrors.email && <p className="text-red-500 text-sm mt-1">{loginErrors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className={`w-full px-4 py-3 rounded-lg border ${
                    loginErrors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:ring-2 focus:ring-primary-500`}
                  placeholder="••••••••"
                />
                {loginErrors.password && <p className="text-red-500 text-sm mt-1">{loginErrors.password}</p>}
              </div>

              {loginErrors.submit && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {loginErrors.submit}
                </div>
              )}

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full bg-primary-600 text-white py-3 rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
              >
                {loginLoading ? 'Signing in...' : 'Sign in'}
              </button>

              <div className="text-center space-y-2">
                <a href="/forgot-password" className="text-sm text-primary-600 hover:underline block">
                  Forgot password?
                </a>
                <div className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <a href="/register" className="text-primary-600 hover:underline font-medium">
                    Sign up
                  </a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showModulesPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl w-full max-w-[95%] max-h-[90vh] overflow-y-auto p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">All Modules ({MODULES.length})</h2>
              <button
                onClick={() => setShowModulesPopup(false)}
                className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {MODULES.map((module, idx) => (
                <div key={idx} className="flex items-start space-x-3 p-4 rounded-lg hover:bg-gray-50 border border-gray-100 transition">
                  <span className="text-3xl flex-shrink-0">{module.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base mb-1">{module.title}</h3>
                    <p className="text-gray-600 text-xs">{module.description}</p>
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
