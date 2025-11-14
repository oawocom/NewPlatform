import { useState, useEffect } from 'react';
import api from '../api/axios';
import ListView from '../components/common/ListView';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);

      setStats(statsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setError('Access Denied: You need SUPER_ADMIN privileges');
      } else if (error.response?.status !== 401) {
        setError('Failed to load data');
      }
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const handleUserAction = (action, user) => {
    console.log(`${action} user:`, user);
    // TODO: Implement user actions (view, edit, delete)
  };

  // Define columns for ListView
  const userColumns = [
    {
      key: 'full_name',
      label: 'User',
      sortable: true,
      searchable: true,
      type: 'avatar'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      searchable: true
    },
    {
      key: 'tenant.name',
      label: 'Company',
      sortable: true,
      searchable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      type: 'badge'
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'badge',
      render: (value) => value ? 'Active' : 'Inactive'
    },
    {
      key: 'subscription.plan',
      label: 'Plan',
      sortable: true
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      type: 'date'
    }
  ];

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{error}</h2>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <span className="text-3xl">⚙️</span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Platform Admin</h1>
                <p className="text-xs text-gray-500">Manage all users and tenants</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <a href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </a>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Users</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_users || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Total Tenants</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.total_tenants || 0}</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-sm text-gray-600 mb-1">Active Trials</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.active_trials || 0}</p>
          </div>
        </div>

        {/* Users List using Universal ListView */}
        <ListView
          title="Registered Users"
          data={users}
          columns={userColumns}
          searchable={true}
          actions={['view', 'edit']}
          onAction={handleUserAction}
          emptyMessage="No users registered yet"
        />
      </div>
    </div>
  );
}
