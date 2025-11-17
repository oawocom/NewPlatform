'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateUserPage() {
  const [roles, setRoles] = useState([]);
  const [tenantAdmins, setTenantAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    password: '',
    company_name: '',
    role_id: '',
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

  const getAvailableRoles = () => {
    if (isSuperAdmin) {
      return roles;
    }
    // Tenant admin can only create TENANT_USER and TENANT_VIEWER
    return roles.filter(r => r.name === 'TENANT_USER' || r.name === 'TENANT_VIEWER');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const params = new URLSearchParams({
        email: formData.email,
        full_name: formData.full_name,
        password: formData.password,
        role_id: formData.role_id,
        is_active: formData.is_active
      });
      
      if (showCompany && formData.company_name) {
        params.append('company_name', formData.company_name);
      }
      
      // For tenant admin, always use their own ID as parent
      if (!isSuperAdmin) {
        params.append('parent_admin_id', currentUser.id);
      } else if (showParent && formData.parent_admin_id) {
        params.append('parent_admin_id', formData.parent_admin_id);
      }

      const res = await fetch(`/api/v1/admin/users/create?${params}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        alert('User created successfully!');
        router.push('/admin/users');
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to create user');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create user');
    }
    setLoading(false);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New User</h1>
        <p className="text-gray-600 mt-1">Add a new user to the platform</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
              <p className="text-xs text-gray-500 mt-1">You can only create users and viewers</p>
            )}
          </div>

          {showCompany && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="ACME Corporation"
              />
              <p className="text-xs text-gray-500 mt-1">New company will be created for this admin</p>
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
              <p className="text-xs text-gray-500 mt-1">User will belong to this admin's company</p>
            </div>
          )}

          {showParent && !isSuperAdmin && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                👤 User will be assigned to your company automatically
              </p>
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

          <div className="flex space-x-3 pt-4 border-t">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create User'}
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
