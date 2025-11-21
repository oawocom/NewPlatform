'use client';
import { useEffect, useState } from 'react';
import DataTable, { Badge, EditIcon, DeleteIcon } from '../../components/DataTable';
import api from '../../lib/api';

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
    try {
      const usersRes = await api.get('/admin/users');
      setUsers(usersRes.data.items || []);

      const tenantsRes = await api.get('/tenants');
      setTenants(Array.isArray(tenantsRes.data) ? tenantsRes.data : []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Delete this user?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
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

  // Define table columns
  const columns = [
    {
      key: 'full_name',
      label: 'User',
      render: (user) => (
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user.full_name}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user.email}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      render: (user) => (
        <Badge color="blue">
          {getRoleDisplay(user)}
        </Badge>
      )
    },
    {
      key: 'tenant_id',
      label: 'Company',
      sortable: false,
      render: (user) => (
        <span className="text-sm text-gray-900 dark:text-gray-100">
          {getTenant(user.tenant_id)?.name || '-'}
        </span>
      )
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (user) => (
        <Badge color={user.is_active ? 'green' : 'red'}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'partner_code',
      label: 'Partner Code',
      sortable: false,
      render: (user) => {
        const partnerCode = user.role === 'TENANT_ADMIN' ? generatePartnerCode(user.id) : null;
        return partnerCode ? (
          <button
            onClick={() => copyPartnerCode(partnerCode)}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            title="Click to copy"
          >
            {partnerCode}
          </button>
        ) : (
          <span className="text-sm text-gray-400">-</span>
        );
      }
    }
  ];

  // Render action buttons
  const renderActions = (user) => (
    <>
      <EditIcon href={`/admin/users/${user.id}/edit`} />
      <DeleteIcon onClick={() => handleDelete(user.id)} />
    </>
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users</p>
        </div>
        <a href="/admin/users/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add User
        </a>
      </div>

      <DataTable
        columns={columns}
        data={users}
        renderActions={renderActions}
        loading={loading}
        emptyMessage="No users found"
      />
    </div>
  );
}