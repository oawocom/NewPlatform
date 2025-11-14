'use client';
import { useEffect, useState } from 'react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    fetch('/api/v1/admin/dashboard/stats', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Users</p>
              <p className="text-3xl font-bold">{stats?.users_count || 0}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Projects</p>
              <p className="text-3xl font-bold">{stats?.projects_count || 0}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-2xl">📁</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Active Projects</p>
              <p className="text-3xl font-bold">{stats?.active_projects || 0}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <a href="/admin/projects/create" className="block p-4 border-2 border-dashed rounded-lg hover:border-blue-500 hover:bg-blue-50 text-center transition">
              <p className="font-medium">➕ Create New Project</p>
            </a>
            <a href="/admin/users/create" className="block p-4 border-2 border-dashed rounded-lg hover:border-green-500 hover:bg-green-50 text-center transition">
              <p className="font-medium">👤 Add New User</p>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">System Info</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Your Role</span>
              <span className="font-medium capitalize">{stats?.role?.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="text-gray-600">Platform Version</span>
              <span className="font-medium">2.0.0</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
