'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RolesPage() {
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: ''
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/rbac/roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRoles(data.items || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setRoles([]);
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/rbac/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPermissions(data.items || []);
    } catch (err) {
      console.error(err);
      setPermissions([]);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/v1/rbac/roles', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', display_name: '', description: '' });
        fetchRoles();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to create role');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create role');
    }
  };

  const handleDelete = async (roleId) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/rbac/roles/${roleId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchRoles();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to delete role');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete role');
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-gray-600 mt-1">Manage user roles and their permissions</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Role
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Total Roles</p>
          <p className="text-3xl font-bold">{roles.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-sm mb-1">Total Permissions</p>
          <p className="text-3xl font-bold">{permissions.length}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Permissions</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.map((role) => (
              <tr key={role.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{role.display_name}</div>
                  <div className="text-sm text-gray-500">{role.name}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{role.description || '-'}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {role.permissions_count || 0} permissions
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}
                </td>
                <td className="px-6 py-4 text-right text-sm space-x-3">
                  <a href={'/admin/roles/' + role.id} className="text-blue-600 hover:text-blue-900">Edit</a>
                  <button onClick={() => handleDelete(role.id)} className="text-red-600 hover:text-red-900">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Role</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                <input type="text" required value={formData.display_name} onChange={(e) => setFormData({ ...formData, display_name: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 border rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg">Create Role</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
