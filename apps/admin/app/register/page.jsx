'use client';
import { useState } from 'react';
import { BRANDING } from '../config/branding';
import axios from 'axios';

const API_URL = '/api/v1';

export default function Register() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name.trim()) newErrors.full_name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        full_name: formData.full_name,
        email: formData.email,
        company_name: formData.company_name,
        password: formData.password
      });
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      window.location.href = '/admin/dashboard';
    } catch (error) {
      setErrors({ 
        submit: error.response?.data?.detail || 'Registration failed. Please try again.'
      });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo - Outside, Left-aligned, Bigger */}
        <img src={BRANDING.logo.image} alt={BRANDING.logo.alt} className="h-16 mb-8" />
        
        {/* Title - Outside, Left-aligned */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Account</h1>
          <p className="text-gray-600 mt-2">Start your free 14-day trial. No credit card required.</p>
        </div>

        {/* Card - Form in 2 columns */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {errors.submit && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-800">{errors.submit}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 2 Column Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="John Doe"
                />
                {errors.full_name && <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="john@company.com"
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Company Name - Full Width */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                placeholder="ACME Corporation"
              />
              {errors.company_name && <p className="text-red-500 text-sm mt-1">{errors.company_name}</p>}
            </div>

            {/* Password + Confirm in 2 columns */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-xl transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              Already have an account?{' '}
              <a href="/" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</a>
            </p>
          </div>
        </div>

        {/* Footer - Outside */}
        <div className="mt-6 flex items-center justify-center text-sm text-gray-500">
          <span className="mr-2">🔒</span>
          <span>14-day free trial • No credit card required</span>
        </div>
      </div>
    </div>
  );
}
