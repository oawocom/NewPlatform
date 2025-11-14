export default {
  table: 'projects',
  label: 'Projects',
  singularLabel: 'Project',
  apiEndpoint: '/crud/projects',
  
  // Form fields for create/edit
  columns: [
    {
      name: 'name',
      label: 'Project Name',
      type: 'text',
      required: true,
      placeholder: 'My Awesome Project',
      helpText: 'Choose a unique name for your project'
    },
    {
      name: 'type',
      label: 'Project Type',
      type: 'select',
      required: true,
      options: [
        { value: 'ecommerce', label: 'E-commerce Store' },
        { value: 'cms', label: 'Content Website' },
        { value: 'portfolio', label: 'Portfolio' },
        { value: 'marketplace', label: 'Marketplace' },
        { value: 'booking', label: 'Booking System' },
        { value: 'crm', label: 'CRM' },
        { value: 'hr', label: 'HR Management' },
        { value: 'social', label: 'Social Network' },
        { value: 'elearning', label: 'E-learning Platform' }
      ]
    },
    {
      name: 'subdomain',
      label: 'Subdomain',
      type: 'text',
      required: true,
      placeholder: 'myproject',
      helpText: 'Your site will be accessible at: myproject.buildown.design'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      rows: 3,
      placeholder: 'Brief description of your project...'
    },
    {
      name: 'status',
      label: 'Status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
        { value: 'draft', label: 'Draft' }
      ]
    }
  ],
  
  // Columns to display in list view
  listColumns: [
    {
      key: 'name',
      label: 'Project Name',
      sortable: true,
      searchable: true,
      type: 'link',
      linkTo: (item) => `/projects/${item.id}`
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      type: 'badge'
    },
    {
      key: 'subdomain',
      label: 'URL',
      sortable: true,
      searchable: true,
      render: (value) => `${value}.buildown.design`
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      type: 'badge'
    },
    {
      key: 'created_at',
      label: 'Created',
      sortable: true,
      type: 'date'
    }
  ],
  
  // Available actions
  actions: ['view', 'edit', 'delete'],
  
  // Can create new records
  canCreate: true,
  
  // Empty state message
  emptyMessage: 'No projects yet. Create your first project!'
};
