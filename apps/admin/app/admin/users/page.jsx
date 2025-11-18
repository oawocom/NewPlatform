'use client';
import { useEffect, useState } from 'react';

const generatePartnerCode = (userId) => {
  const encoded = userId * 10007;
  return `PA${encoded}`;
};

const ROLE_LABELS = {
  'SUPER_ADMIN': 'Super Admin',
  'TENANT_ADMIN': 'Tenant Admin',
  'USER': 'User',
  'VIEWER': 'Viewer'
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    
    try {
      const usersRes = await fetch('/api/v1/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const usersData = await usersRes.json();
      setUsers(usersData.items || []);

      const tenantsRes = await fetch('/api/v1/crud/tenants', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tenantsData = await tenantsRes.json();
      setTenants(Array.isArray(tenantsData) ? tenantsData : []);

    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    const token = localStorage.getItem('token');
    
    try {
      await fetch(`/api/v1/crud/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchData();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const getTenant = (tenantId) => {
    return tenants.find(t => t.id === tenantId);
  };

  const getRoleDisplay = (user) => {
    return ROLE_LABELS[user.role] || user.role || 'No Role';
  };

  const copyPartnerCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Partner code ${code} copied to clipboard!`);
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-gray-600 mt-1">Manage users</p>
        </div>
        <a href="/admin/users/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Add User</a>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>No users found</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Partner Code</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => {
                const tenant = getTenant(user.tenant_id);
                const partnerCode = (user.role === 'TENANT_ADMIN') ? generatePartnerCode(user.id) : null;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {getRoleDisplay(user)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {tenant?.name || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {partnerCode && (
                        <button
                          onClick={() => copyPartnerCode(partnerCode)}
                          className="text-blue-600 hover:text-blue-700 font-mono text-xs"
                          title="Click to copy"
                        >
                          {partnerCode}
                        </button>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <a href={`/admin/users/${user.id}/edit`} className="text-blue-600 hover:text-blue-900 mr-4">
                        Edit
                      </a>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
