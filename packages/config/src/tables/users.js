export default {
  table: 'users',
  label: 'Users',
  singularLabel: 'User',
  apiEndpoint: '/crud/users',  // Changed from /admin/users
  
  columns: [
    {
      name: 'full_name',
      label: 'Full Name',
      type: 'text',
      required: true,
      searchable: true,
      sortable: true
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: true,
      searchable: true,
      sortable: true
    },
    {
      name: 'role',
      label: 'Role',
      type: 'select',
      required: true,
      sortable: true,
      options: [
        { value: 'super_admin', label: 'Super Admin' },
        { value: 'tenant_admin', label: 'Tenant Admin' },
        { value: 'tenant_user', label: 'Tenant User' }
      ]
    },
    {
      name: 'is_active',
      label: 'Active',
      type: 'toggle',
      checkboxLabel: 'User is active'
    }
  ],
  
  listColumns: [
    {
      key: 'full_name',
      label: 'User',
      sortable: true,
      searchable: true,
      type: 'avatar'
    },
    {
      key: 'email',
      label: 'Email',
      sortable: true,
      searchable: true
    },
    {
      key: 'tenant.name',
      label: 'Company',
      sortable: true,
      searchable: true
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      type: 'badge'
    },
    {
      key: 'is_active',
      label: 'Status',
      type: 'badge'
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      type: 'date'
    }
  ],
  
  actions: ['view', 'edit', 'delete'],
  canCreate: true,
  emptyMessage: 'No users found'
};
