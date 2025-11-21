'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { MODULES } from '../../../config/modules';

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

    const user = JSON.parse(localStorage.getItem('user'));

    try {
      await api.post('/projects', {
        name: formData.name,
        subdomain: formData.subdomain,
        description: formData.description || '',
        tenant_id: user.tenant_id,
        status: 'ACTIVE'
      });

      alert('✅ Project created successfully!');
      router.push('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Create New Project</h2>

        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            💡 <strong>Tip:</strong> Start with a simple project. Add modules below after creation to expand functionality and features.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomain *</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.subdomain}
                onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                placeholder="myproject"
              />
              <span className="px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 border-l-0 rounded-r text-sm text-gray-600 dark:text-gray-400">
                .buildown.design
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (Optional)</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your project..."
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
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
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📦 Available Modules ({MODULES.length} total)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Add these modules after creating your project</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
          {MODULES.map((module) => (
            <div key={module.id} className="p-3 border border-gray-300 dark:border-gray-600 rounded hover:shadow-md transition text-sm bg-white dark:bg-gray-700">
              <div className="font-medium text-gray-900 dark:text-gray-100">{module.icon} {module.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{module.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}