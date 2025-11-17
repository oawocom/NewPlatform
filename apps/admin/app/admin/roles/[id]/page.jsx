'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditRolePage() {
  const [role, setRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const params = useParams();
  const roleId = params.id;

  useEffect(() => {
    fetchRole();
    fetchAllPermissions();
  }, []);

  const fetchRole = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/rbac/roles/${roleId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setRole(data);
      setSelectedPermissions(data.permissions.map(p => p.id));
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert('Failed to load role');
      router.push('/admin/roles');
    }
  };

  const fetchAllPermissions = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/v1/rbac/permissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setAllPermissions(data.items || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePermissionToggle = (permissionId) => {
    if (selectedPermissions.includes(permissionId)) {
      setSelectedPermissions(selectedPermissions.filter(id => id !== permissionId));
    } else {
      setSelectedPermissions([...selectedPermissions, permissionId]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`/api/v1/rbac/roles/${roleId}/permissions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ permission_ids: selectedPermissions })
      });

      if (res.ok) {
        alert('Permissions updated successfully!');
        router.push('/admin/roles');
      } else {
        const error = await res.json();
        alert(error.detail || 'Failed to update permissions');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to update permissions');
    }
    setSaving(false);
  };

  // Group permissions by resource
  const groupedPermissions = allPermissions.reduce((acc, perm) => {
    if (!acc[perm.resource]) {
      acc[perm.resource] = [];
    }
    acc[perm.resource].push(perm);
    return acc;
  }, {});

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Role: {role?.display_name}</h1>
        <p className="text-gray-600 mt-1">{role?.description}</p>
      </div>

      {/* Role Info */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
            <p className="text-lg font-semibold">{role?.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
            <p className="text-lg font-semibold">{role?.display_name}</p>
          </div>
        </div>
      </div>

      {/* Permissions Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">Manage Permissions</h2>
          <span className="text-sm text-gray-600">
            {selectedPermissions.length} of {allPermissions.length} permissions selected
          </span>
        </div>

        {/* Permissions grouped by resource */}
        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([resource, permissions]) => (
            <div key={resource} className="border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b">
                <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center justify-between">
                  {resource}
                  <span className="text-sm font-normal text-gray-600">
                    {permissions.filter(p => selectedPermissions.includes(p.id)).length} / {permissions.length}
                  </span>
                </h3>
              </div>
              <div className="divide-y">
                {permissions.map((permission) => (
                  <div 
                    key={permission.id} 
                    className="px-4 py-3 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                    onClick={() => handlePermissionToggle(permission.id)}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedPermissions.includes(permission.id)}
                        onChange={() => handlePermissionToggle(permission.id)}
                        className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{permission.display_name}</p>
                        <p className="text-sm text-gray-500">{permission.description || permission.name}</p>
                      </div>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold rounded bg-blue-100 text-blue-800">
                      {permission.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6 pt-6 border-t">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Permissions'}
          </button>
          <button
            onClick={() => router.push('/admin/roles')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
