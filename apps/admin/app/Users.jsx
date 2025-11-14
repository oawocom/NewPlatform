import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import ListView from '../components/common/ListView';

const API_URL = '/api/v1';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define columns for ListView
  const columns = [
    { key: 'id', label: 'ID', sortable: true, searchable: true },
    { key: 'full_name', label: 'Name', sortable: true, searchable: true, type: 'avatar' },
    { key: 'email', label: 'Email', sortable: true, searchable: true },
    { key: 'role', label: 'Role', sortable: true, type: 'badge' },
    { 
      key: 'is_active', 
      label: 'Status', 
      type: 'badge',
      // Transform boolean to string for badge display
      render: (item) => item.is_active ? 'active' : 'inactive'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      // Note: Adjust endpoint when CRUD API is ready
      // For now, just show current user
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Temporary: Show current user in list
      setUsers([response.data.user]);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    setLoading(false);
  };

  // Handle actions from ListView
  const handleAction = (action, user) => {
    switch (action) {
      case 'view':
        navigate(`/users/${user.id}`);
        break;
      case 'edit':
        navigate(`/users/edit/${user.id}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this user?')) {
          // TODO: Call delete API
          console.log('Delete user:', user.id);
        }
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Users</h2>
            <p className="text-gray-500 mt-1">Manage your team members</p>
          </div>
          <button
            onClick={() => navigate('/users/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <span className="text-xl">➕</span>
            <span>Add User</span>
          </button>
        </div>

        {/* Use ListView Component */}
        <ListView
          data={users}
          columns={columns}
          title="Team Members"
          onAction={handleAction}
          searchable={true}
          actions={['view', 'edit', 'delete']}
          emptyMessage="No users found"
        />
      </div>
    </Layout>
  );
}