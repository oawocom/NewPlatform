'use client';
import { useState } from 'react';
import { BRANDING } from '../config/branding';
import axios from 'axios';

const API_URL = '/api/v1';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validateEmail()) return;
    
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/forgot-password?email=${encodeURIComponent(email)}`);
      setSuccess(true);
    } catch (error) {
      setError('Something went wrong. Please try again.');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <img src={BRANDING.logo.image} alt={BRANDING.logo.alt} className="h-16 mb-8" />
          
          <div className="text-center mb-8">
            <span className="text-6xl">✉️</span>
            <h1 className="text-2xl font-bold text-gray-900 mt-4">Check Your Email</h1>
            <p className="text-gray-600 mt-2">We've sent password reset instructions to</p>
            <p className="text-primary-600 font-semibold mt-1">{email}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <p className="text-gray-700 text-center mb-4">
              Click the link in the email to reset your password. Check your spam folder if you don't see it.
            </p>
            <div className="text-center">
              <a href="/" className="text-primary-600 hover:text-primary-700 font-semibold">
                ← Back to login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <img src={BRANDING.logo.image} alt={BRANDING.logo.alt} className="h-16 mb-8" />
        
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
          <p className="text-gray-600 mt-2">
            No worries! Enter your email and we'll send you reset instructions.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="you@company.com"
              />
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send Reset Instructions'}
            </button>

            <div className="text-center">
              <a href="/" className="text-gray-600 hover:text-gray-800 text-sm inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to login
              </a>
            </div>
          </form>
        </div>

        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <span className="mr-2">🔒</span>
          <span>Your security is our priority. The reset link expires in 1 hour.</span>
        </div>
      </div>
    </div>
  );
}
