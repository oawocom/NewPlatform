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

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6">
        <div className="text-red-600">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Total Users</p>
          <p className="text-3xl font-bold">{stats.users_count || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Total Projects</p>
          <p className="text-3xl font-bold">{stats.projects_count || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Total Tenants</p>
          <p className="text-3xl font-bold">{stats.tenants_count || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Active Users</p>
          <p className="text-3xl font-bold">{stats.active_users || 0}</p>
        </div>
      </div>
    </div>
  );
}
