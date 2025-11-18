'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setFormData({
        email: data.email,
        full_name: data.full_name,
        role: data.role || 'USER',
        is_active: data.is_active
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        alert('User updated successfully');
        router.push('/admin/users');
      } else {
        alert('Failed to update user');
      }
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
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}/reset-password?new_password=${encodeURIComponent(newPassword)}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Password reset successfully');
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        alert('Failed to reset password');
      }
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  if (loadingData) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information</p>
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" required value={formData.full_name} onChange={(e) => setFormData({ ...formData, full_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
              {getAvailableRoles().map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
            </select>
          </div>
          <div className="flex items-center">
            <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4" />
            <label htmlFor="is_active" className="ml-2 text-sm">Active User</label>
          </div>
          <div className="border-t pt-4">
            <button type="button" onClick={() => setShowResetPassword(!showResetPassword)} className="text-blue-600 text-sm">{showResetPassword ? 'Cancel' : 'Reset Password'}</button>
            {showResetPassword && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-3 py-2 border rounded-lg mb-2" placeholder="New password" />
                <button type="button" onClick={handleResetPassword} className="px-4 py-2 bg-red-600 text-white rounded-lg">Reset</button>
              </div>
            )}
          </div>
          <div className="flex gap-4 pt-4">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg">
              {loading ? 'Saving...' : 'Save'}
            </button>
            <a href="/admin/users" className="px-6 py-2 border rounded-lg">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  );
}
