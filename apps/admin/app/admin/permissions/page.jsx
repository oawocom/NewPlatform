'use client';
import { useEffect, useState } from 'react';

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    resource: '',
    action: '',
    description: ''
  });

  useEffect(() => {
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/rbac/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setPermissions(data.items);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch('/api/v1/rbac/permissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowCreateModal(false);
        setFormData({ name: '', display_name: '', resource: '', action: '', description: '' });
        fetchPermissions();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to create permission');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to create permission');
    }
  };

  const handleDelete = async (permId) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/rbac/permissions/${permId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        fetchPermissions();
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to delete permission');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to delete permission');
    }
  };

  // Group permissions by resource
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) acc[perm.resource] = [];
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Permissions</h1>
          <p className="text-gray-600 mt-1">Manage system permissions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Create Permission</span>
        </button>
      </div>

      {/* Permissions by Resource */}
      <div className="space-y-6">
        {Object.entries(groupedPermissions).map(([resource, perms]) => (
          <div key={resource} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 capitalize">{resource}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {perms.map((perm) => (
                <div key={perm.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                        {perm.action}
                      </span>
                      <span className="font-medium text-gray-900">{perm.display_name}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{perm.description || perm.name}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(perm.id)}
                    className="ml-4 text-red-600 hover:text-red-900 text-sm"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New Permission</h2>
            <form onSubmit={handleCreate}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Permission Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., view_reports"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., View Reports"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Resource</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., reports"
                    value={formData.resource}
                    onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
                  <select
                    required
                    value={formData.action}
                    onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select action...</option>
                    <option value="read">Read</option>
                    <option value="create">Create</option>
                    <option value="update">Update</option>
                    <option value="delete">Delete</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows="2"
                    placeholder="Brief description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setFormData({ name: '', display_name: '', resource: '', action: '', description: '' });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Create Permission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
