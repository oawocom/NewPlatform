'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';

const AVAILABLE_ROLES = [
  { value: 'SUPER_ADMIN', label: 'Super Admin', adminOnly: true },
  { value: 'TENANT_ADMIN', label: 'Tenant Admin', adminOnly: false },
  { value: 'USER', label: 'User', adminOnly: false },
  { value: 'VIEWER', label: 'Viewer', adminOnly: false }
];

export default function EditUserPage() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role: 'USER',
    is_active: true
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/crud/users/' + userId);
      setFormData({
        email: response.data.email,
        full_name: response.data.full_name,
        role: response.data.role || 'USER',
        is_active: response.data.is_active
      });
      setLoadingData(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load user');
      setLoadingData(false);
    }
  };

  const getAvailableRoles = () => {
    if (currentUser?.role === 'SUPER_ADMIN') {
      return AVAILABLE_ROLES;
    }
    return AVAILABLE_ROLES.filter(r => !r.adminOnly);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/crud/users/' + userId, formData);
      alert('User updated successfully');
      router.push('/admin/users');
    } catch (err) {
      alert('Failed to update user');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    try {
      await api.put('/admin/users/' + userId + '/reset-password?new_password=' + encodeURIComponent(newPassword));
      alert('Password reset successfully');
      setShowResetPassword(false);
      setNewPassword('');
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  if (loadingData) return <div className="p-6 text-gray-600 dark:text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit User</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Update user information</p>
      </div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              required 
              value={formData.email} 
              onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
            <input 
              type="text" 
              required 
              value={formData.full_name} 
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
            <select 
              required 
              value={formData.role} 
              onChange={(e) => setFormData({ ...formData, role: e.target.value })} 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              {getAvailableRoles().map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center">
            <input 
              type="checkbox" 
              id="is_active" 
              checked={formData.is_active} 
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} 
              className="h-4 w-4" 
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active User</label>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <button 
              type="button" 
              onClick={() => setShowResetPassword(!showResetPassword)} 
              className="text-blue-600 dark:text-blue-400 text-sm"
            >
              {showResetPassword ? 'Cancel' : 'Reset Password'}
            </button>
            {showResetPassword && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 mb-2" 
                  placeholder="New password" 
                />
                <button 
                  type="button" 
                  onClick={handleResetPassword} 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <button 
              type="submit" 
              disabled={loading} 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
            <a 
              href="/admin/users" 
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}