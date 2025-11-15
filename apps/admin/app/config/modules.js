/**
 * Platform Modules Configuration
 * Used for project creation, feature showcase, etc.
 */

export const MODULES = [
  // AI & Automation
  { id: 'ai-brain', icon: '🤖', title: 'AI Brain', description: 'Private AI training', category: 'ai' },
  { id: 'ai-email', icon: '📧', title: 'AI Email Assistant', description: 'Auto-reply & drafts', category: 'ai' },
  { id: 'ai-document', icon: '📄', title: 'AI Document Analyzer', description: 'Smart doc processing', category: 'ai' },
  { id: 'ai-sales', icon: '💼', title: 'AI Sales Assistant', description: 'Sales automation', category: 'ai' },
  { id: 'ai-analytics', icon: '📈', title: 'Predictive Analytics', description: 'AI forecasting', category: 'ai' },
  { id: 'ai-fraud', icon: '🔍', title: 'AI Fraud Detection', description: 'Security alerts', category: 'ai' },

  // Core Business
  { id: 'cms', icon: '📝', title: 'CMS', description: 'Content management', category: 'core' },
  { id: 'crm', icon: '🎯', title: 'CRM', description: 'Customer relationship', category: 'core' },
  { id: 'ecommerce', icon: '🛒', title: 'E-Commerce', description: 'Online store', category: 'core' },
  { id: 'project-mgmt', icon: '📋', title: 'Project Management', description: 'Tasks & milestones', category: 'core' },

  // HR & Employee
  { id: 'hr', icon: '👥', title: 'HR Management', description: 'Employee database', category: 'hr' },
  { id: 'attendance', icon: '⏰', title: 'Attendance & Timesheet', description: 'Time tracking', category: 'hr' },
  { id: 'payroll', icon: '💰', title: 'Payroll', description: 'Salary management', category: 'hr' },
  { id: 'recruitment', icon: '🎯', title: 'Recruitment (ATS)', description: 'Hiring & onboarding', category: 'hr' },

  // Finance & Accounting
  { id: 'invoicing', icon: '🧾', title: 'Invoicing', description: 'Create & send invoices', category: 'finance' },
  { id: 'payments', icon: '💳', title: 'Payments', description: 'Payment processing', category: 'finance' },
  { id: 'accounting', icon: '📒', title: 'Accounting', description: 'Double-entry ledger', category: 'finance' },
  { id: 'expense', icon: '💵', title: 'Expense Management', description: 'Track spending', category: 'finance' },

  // Inventory
  { id: 'inventory', icon: '📦', title: 'Inventory Management', description: 'Stock tracking', category: 'inventory' },
  { id: 'warehouse', icon: '🏭', title: 'Multi-Warehouse', description: 'Multiple locations', category: 'inventory' },
  { id: 'barcode', icon: '📱', title: 'Barcode/QR Scanner', description: 'Mobile scanning', category: 'inventory' },

  // Sales & Marketing
  { id: 'sales-pipeline', icon: '💼', title: 'Sales Pipeline', description: 'Deal tracking', category: 'sales' },
  { id: 'lead-mgmt', icon: '📞', title: 'Lead Management', description: 'Lead nurturing', category: 'sales' },
  { id: 'email-marketing', icon: '📧', title: 'Email Marketing', description: 'Campaign automation', category: 'marketing' },

  // Logistics
  { id: 'logistics', icon: '🚚', title: 'Logistics', description: 'Delivery management', category: 'logistics' },
  { id: 'fleet', icon: '🚗', title: 'Fleet Management', description: 'Vehicle tracking', category: 'logistics' },

  // Security
  { id: 'rbac', icon: '🔐', title: 'RBAC & Permissions', description: 'Role-based access', category: 'security' },
  { id: 'audit-logs', icon: '📊', title: 'Audit Logs', description: 'Activity tracking', category: 'security' },
];

// Helper functions
export const getModulesByCategory = (category) => {
  return MODULES.filter(m => m.category === category);
};

export const getModuleById = (id) => {
  return MODULES.find(m => m.id === id);
};
