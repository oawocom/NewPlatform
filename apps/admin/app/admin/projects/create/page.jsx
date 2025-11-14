'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    try {
      const res = await fetch('/api/v1/crud/projects', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name,
          subdomain: formData.subdomain,
          description: formData.description || '',
          tenant_id: user.tenant_id,
          status: 'ACTIVE'
          // NO TYPE - projects start simple, extend with modules later
        })
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to create project');
      }

      alert('✅ Project created successfully!');
      router.push('/admin/projects');
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const modules = [
    { icon: '🌍', name: 'Multilingual', desc: 'Multi-language support' },
    { icon: '🔐', name: 'RBAC & Permissions', desc: 'Role-based access' },
    { icon: '📊', name: 'Audit Logs', desc: 'Activity tracking' },
    { icon: '🔗', name: 'API Integrations', desc: 'Connect external services' },
    { icon: '🤖', name: 'AI Brain', desc: 'Private AI training' },
    { icon: '📧', name: 'AI Email Assistant', desc: 'Auto-reply & drafts' },
    { icon: '📄', name: 'AI Document Analyzer', desc: 'Smart doc processing' },
    { icon: '💼', name: 'AI Sales Assistant', desc: 'Sales automation' },
    { icon: '📈', name: 'Predictive Analytics', desc: 'AI forecasting' },
    { icon: '🔍', name: 'AI Fraud Detection', desc: 'Security alerts' },
    { icon: '📝', name: 'CMS', desc: 'Content management' },
    { icon: '📁', name: 'Document Management', desc: 'File storage & versioning' },
    { icon: '📚', name: 'Knowledge Base', desc: 'Internal wiki' },
    { icon: '✍️', name: 'Digital Signature', desc: 'e-Sign documents' },
    { icon: '👥', name: 'HR Management', desc: 'Employee database' },
    { icon: '⏰', name: 'Attendance & Timesheet', desc: 'Time tracking' },
    { icon: '💰', name: 'Payroll', desc: 'Salary management' },
    { icon: '🎯', name: 'Recruitment (ATS)', desc: 'Hiring & onboarding' },
    { icon: '📊', name: 'Performance Reviews', desc: 'Employee evaluation' },
    { icon: '🏖️', name: 'Leave Management', desc: 'Vacation tracking' },
    { icon: '🧾', name: 'Invoicing', desc: 'Create & send invoices' },
    { icon: '💳', name: 'Payments', desc: 'Payment processing' },
    { icon: '📒', name: 'Accounting', desc: 'Double-entry ledger' },
    { icon: '💵', name: 'Expense Management', desc: 'Track spending' },
    { icon: '🏦', name: 'Bank Reconciliation', desc: 'Auto-matching' },
    { icon: '📊', name: 'Financial Reports', desc: 'P&L, Balance Sheet' },
    { icon: '🔄', name: 'Subscription Billing', desc: 'Recurring payments' },
    { icon: '📦', name: 'Inventory Management', desc: 'Stock tracking' },
    { icon: '🏭', name: 'Multi-Warehouse', desc: 'Multiple locations' },
    { icon: '📱', name: 'Barcode/QR Scanner', desc: 'Mobile scanning' },
    { icon: '📋', name: 'Purchase Orders', desc: 'PO management' },
    { icon: '🔢', name: 'Serial & Batch Tracking', desc: 'Item traceability' },
    { icon: '🛒', name: 'Procurement', desc: 'RFQ & supplier management' },
    { icon: '🤝', name: 'Supplier Database', desc: 'Vendor ranking' },
    { icon: '📑', name: 'Contract Management', desc: 'Legal agreements' },
    { icon: '🚚', name: 'Delivery Tracking', desc: 'Shipment monitoring' },
    { icon: '🎯', name: 'CRM', desc: 'Customer relationship' },
    { icon: '💼', name: 'Sales Pipeline', desc: 'Deal tracking' },
    { icon: '📞', name: 'Lead Management', desc: 'Lead nurturing' },
    { icon: '📱', name: 'WhatsApp Integration', desc: 'Chat with customers' },
    { icon: '🎫', name: 'Customer Support', desc: 'Ticketing system' },
    { icon: '💬', name: 'Live Chat', desc: 'Real-time support' },
    { icon: '🎁', name: 'Loyalty System', desc: 'Rewards program' },
    { icon: '📋', name: 'Project Management', desc: 'Tasks & milestones' },
    { icon: '📊', name: 'Kanban Board', desc: 'Visual workflow' },
    { icon: '📅', name: 'Gantt Charts', desc: 'Timeline view' },
    { icon: '⏱️', name: 'Time Tracking', desc: 'Billable hours' },
    { icon: '🔧', name: 'Work Orders', desc: 'Service management' },
    { icon: '🏗️', name: 'Maintenance (CMMS)', desc: 'Asset maintenance' },
    { icon: '📍', name: 'Field Service', desc: 'Technician dispatch' },
    { icon: '🗺️', name: 'GPS Tracking', desc: 'Location monitoring' },
    { icon: '⚙️', name: 'Manufacturing', desc: 'BOM & production' },
    { icon: '📝', name: 'Work Orders (MFG)', desc: 'Production orders' },
    { icon: '✅', name: 'Quality Control', desc: 'Inspection & testing' },
    { icon: '📊', name: 'OEE Monitoring', desc: 'Machine efficiency' },
    { icon: '📧', name: 'Email Marketing', desc: 'Campaign automation' },
    { icon: '📱', name: 'WhatsApp Campaigns', desc: 'Bulk messaging' },
    { icon: '🎨', name: 'Landing Page Builder', desc: 'No-code pages' },
    { icon: '🧪', name: 'A/B Testing', desc: 'Optimize conversion' },
    { icon: '✍️', name: 'AI Copywriting', desc: 'Generate content' },
    { icon: '📱', name: 'Social Media Scheduler', desc: 'Auto-posting' },
    { icon: '🚚', name: 'Logistics', desc: 'Delivery management' },
    { icon: '🚗', name: 'Fleet Management', desc: 'Vehicle tracking' },
    { icon: '🗺️', name: 'Route Optimization', desc: 'AI-based routing' },
    { icon: '📦', name: 'Shipment Tracking', desc: 'Real-time updates' },
    { icon: '🛒', name: 'E-Commerce', desc: 'Online store' },
    { icon: '💳', name: 'Online Payments', desc: 'Payment gateway' },
    { icon: '🎫', name: 'Coupon System', desc: 'Discounts & promos' },
    { icon: '↩️', name: 'Returns Management', desc: 'Refund processing' },
    { icon: '🔍', name: 'SEO Tools', desc: 'Search optimization' },
    { icon: '⚖️', name: 'Legal Management', desc: 'Case tracking' },
    { icon: '📋', name: 'Compliance Tracker', desc: 'Regulatory compliance' },
    { icon: '🛡️', name: 'Risk Assessment', desc: 'Risk monitoring' },
    { icon: '📄', name: 'NDA/Contract Manager', desc: 'Legal agreements' },
    { icon: '🔐', name: 'User Access Control', desc: 'Security management' },
    { icon: '🖥️', name: 'IT Service Desk', desc: 'ITSM ticketing' },
    { icon: '☁️', name: 'Backup System', desc: 'Auto backups' },
    { icon: '🚨', name: 'Security Alerts', desc: 'Threat detection' },
    { icon: '⚓', name: 'Marine Management', desc: 'Vessel & crew' },
    { icon: '🏗️', name: 'Construction', desc: 'BOQ & site reports' },
    { icon: '⚡', name: 'Energy Management', desc: 'Metering & monitoring' },
    { icon: '🔧', name: 'Form Builder', desc: 'Custom forms' },
    { icon: '🔄', name: 'Workflow Automation', desc: 'No-code workflows' },
    { icon: '🔌', name: 'Webhooks', desc: 'Event triggers' },
    { icon: '🌐', name: 'Company Portal', desc: 'Internal intranet' },
  ];

  return (
    <div>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-6">Create New Project</h2>
        
        <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Start with a simple project. Add modules below after creation to expand functionality and features.
          </p>
        </div>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Subdomain *</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                className="flex-1 px-3 py-2 border rounded-l focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.subdomain}
                onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                placeholder="myproject"
              />
              <span className="px-3 py-2 bg-gray-100 border border-l-0 rounded-r text-sm text-gray-600">
                .buildown.design
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your project..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : '✨ Create Project'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/admin/projects')}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold mb-4">📦 Available Modules ({modules.length} total)</h3>
        <p className="text-sm text-gray-600 mb-4">Add these modules after creating your project</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {modules.map((module, index) => (
            <div key={index} className="p-3 border rounded hover:shadow-md transition text-sm">
              <div className="font-medium">{module.icon} {module.name}</div>
              <div className="text-xs text-gray-500 mt-1">{module.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
