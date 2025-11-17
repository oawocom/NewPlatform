'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditUserPage() {
  const [roles, setRoles] = useState([]);
  const [tenantAdmins, setTenantAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    role_id: '',
    tenant_id: '',
    company_name: '',
    parent_admin_id: '',
    is_active: true
  });

  const [showParent, setShowParent] = useState(false);
  const [showCompany, setShowCompany] = useState(false);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setCurrentUser(user);
    setIsSuperAdmin(user.role === 'SUPER_ADMIN');
    fetchRoles();
    fetchTenantAdmins();
    fetchUser();
  }, []);

  useEffect(() => {
    if (formData.role_id && roles.length > 0) {
      const role = roles.find(r => r.id === parseInt(formData.role_id));
      if (role) {
        const isAdmin = role.name === 'SUPER_ADMIN' || role.name === 'TENANT_ADMIN';
        setShowParent(!isAdmin);
        setShowCompany(isAdmin && isSuperAdmin);
      }
    }
  }, [formData.role_id, roles, isSuperAdmin]);

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/rbac/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTenantAdmins = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/admin/tenant-admins', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTenantAdmins(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUser = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) throw new Error('User not found');
      
      const user = await res.json();
      
      let companyName = '';
      let parentAdminId = '';
      
      if (user.tenant_id) {
        const tenantRes = await fetch(`/api/v1/crud/tenants/${user.tenant_id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (tenantRes.ok) {
          const tenant = await tenantRes.json();
          companyName = tenant.name || '';
        }
        
        const adminsRes = await fetch('/api/v1/admin/tenant-admins', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (adminsRes.ok) {
          const adminsData = await adminsRes.json();
          const parentAdmin = (adminsData.items || []).find(a => a.tenant_id === user.tenant_id);
          if (parentAdmin) {
            parentAdminId = parentAdmin.id;
          }
        }
      }
      
      setFormData({
        email: user.email || '',
        full_name: user.full_name || '',
        role_id: user.role_id || '',
        tenant_id: user.tenant_id || '',
        company_name: companyName,
        parent_admin_id: parentAdminId,
        is_active: user.is_active !== undefined ? user.is_active : true
      });
      setLoadingData(false);
    } catch (err) {
      alert('Failed to load user');
      router.push('/admin/users');
    }
  };

  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return roles;
    }
    return roles.filter(r => r.name === 'TENANT_USER' || r.name === 'TENANT_VIEWER');
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert('Password must be at least 6 characters');
      return;
    }
    
    const token = localStorage.getItem('token');
    try {
      const params = new URLSearchParams({ new_password: newPassword });
      const res = await fetch(`/api/v1/admin/users/${userId}/reset-password?${params}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Password reset successfully!');
        setShowResetPassword(false);
        setNewPassword('');
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to reset password');
      }
    } catch (err) {
      alert('Failed to reset password');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      let newTenantId = formData.tenant_id;
      
      if (showParent && formData.parent_admin_id) {
        const admin = tenantAdmins.find(a => a.id === parseInt(formData.parent_admin_id));
        newTenantId = admin ? admin.tenant_id : formData.tenant_id;
      }
      
      const updateUserData = {
        full_name: formData.full_name,
        role_id: parseInt(formData.role_id),
        tenant_id: parseInt(newTenantId),
        is_active: formData.is_active
      };

      const userRes = await fetch(`/api/v1/crud/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateUserData)
      });

      if (!userRes.ok) {
        const error = await userRes.json();
        throw new Error(error.detail || 'Failed to update user');
      }

      if (showCompany && formData.tenant_id && formData.company_name) {
        await fetch(`/api/v1/crud/tenants/${formData.tenant_id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: formData.company_name })
        });
      }

      alert('User updated successfully!');
      router.push('/admin/users');
    } catch (err) {
      alert(err.message);
    }
    setLoading(false);
  };

  if (loadingData) return <div className="p-6">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Edit User</h1>
        <p className="text-gray-600 mt-1">Update user information</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" disabled value={formData.email} className="w-full px-3 py-2 border rounded-lg bg-gray-100" />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select
              required
              value={formData.role_id}
              onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select role...</option>
              {getAvailableRoles().map(role => (
                <option key={role.id} value={role.id}>{role.display_name}</option>
              ))}
            </select>
            {!isSuperAdmin && (
              <p className="text-xs text-gray-500 mt-1">You can only assign user and viewer roles</p>
            )}
          </div>

          {showCompany && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {showParent && isSuperAdmin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent (Tenant Admin) *</label>
              <select
                required
                value={formData.parent_admin_id}
                onChange={(e) => setFormData({ ...formData, parent_admin_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select parent admin...</option>
                {tenantAdmins.map(admin => (
                  <option key={admin.id} value={admin.id}>
                    {admin.full_name} - {admin.company_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="is_active" className="ml-2 text-sm">Active User</label>
          </div>

          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowResetPassword(!showResetPassword)}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              {showResetPassword ? 'Cancel Password Reset' : '🔒 Reset Password'}
            </button>
            
            {showResetPassword && (
              <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="flex space-x-2">
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter new password (min 6 characters)"
                  />
                  <button
                    type="button"
                    onClick={handleResetPassword}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Reset
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => router.push('/admin/users')} className="px-6 py-2 border rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
