'use client';
import { useEffect, useState } from 'react';

// Partner code generation (same logic as backend)
const generatePartnerCode = (userId) => {
  const encoded = userId * 10007;
  return `PA${encoded}`;
};

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
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

      const rolesRes = await fetch('/api/v1/rbac/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rolesData = await rolesRes.json();
      setRoles(rolesData.items || []);

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

  const getRoleName = (user) => {
    if (user.role) return user.role;
    const role = roles.find(r => r.id === user.role_id);
    return role ? role.name : 'NO_ROLE';
  };

  const getRoleDisplay = (user) => {
    if (user.role) return user.role;
    const role = roles.find(r => r.id === user.role_id);
    return role ? role.display_name : 'No Role';
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
          <div className="p-8 text-center">No users found</div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => {
                const tenant = getTenant(user.tenant_id);
                const roleName = getRoleName(user);
                const isTenantAdmin = roleName === 'TENANT_ADMIN';
                const partnerCode = isTenantAdmin ? generatePartnerCode(user.id) : null;
                
                return (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{user.full_name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm">{tenant ? tenant.name : '-'}</td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                          {getRoleDisplay(user)}
                        </span>
                        {isTenantAdmin && partnerCode && (
                          <div className="mt-2">
                            <button
                              onClick={() => copyPartnerCode(partnerCode)}
                              className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-700 font-mono bg-blue-50 px-2 py-1 rounded"
                              title="Click to copy"
                            >
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                              </svg>
                              <span>{partnerCode}</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-sm space-x-3">
                      <a href={'/admin/users/' + user.id + '/edit'} className="text-blue-600">Edit</a>
                      <button onClick={() => handleDelete(user.id)} className="text-red-600">Delete</button>
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
