import { useState, useEffect } from 'react';
import axios from 'axios';
import Layout from '../components/layout/Layout';

const API_URL = '/api/v1';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setUser(response.data.user);
      setTenant(response.data.tenant);
      
      // Update localStorage with tenant info
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      storedUser.tenant_name = response.data.tenant?.name;
      localStorage.setItem('user', JSON.stringify(storedUser));
    } catch (error) {
      console.error('Failed to load user data:', error);
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 text-white mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome Back! 🎉</h2>
          <p className="text-primary-100">
            Your account is on a {tenant?.status} plan.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Total Projects</p>
              <span className="text-2xl">📁</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Team Members</p>
              <span className="text-2xl">👥</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">1</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">Storage Used</p>
              <span className="text-2xl">💾</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">0 MB</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}