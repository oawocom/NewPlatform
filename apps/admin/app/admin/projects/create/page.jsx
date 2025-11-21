'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { MODULES } from '../../../config/modules';

export default function CreateProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: '',
    password: '',
    modules_enabled: []
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      modules_enabled: prev.modules_enabled.includes(moduleId)
        ? prev.modules_enabled.filter(id => id !== moduleId)
        : [...prev.modules_enabled, moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.subdomain.length < 8) {
      setError('Subdomain must be at least 8 characters');
      setLoading(false);
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));

    try {
      await api.post('/projects', {
        name: formData.name,
        subdomain: formData.subdomain,
        description: formData.description || '',
        password: formData.password || null,
        modules_enabled: formData.modules_enabled,
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

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="My Awesome Project"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomain * (min 8 chars)</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                minLength={8}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your project..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Admin Password</label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Password for /manage"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Modules ({formData.modules_enabled.length} selected)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-3">
              {MODULES.map((module) => (
                <label key={module.id} className={`p-3 border rounded cursor-pointer ${formData.modules_enabled.includes(module.id) ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-600'}`}>
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.modules_enabled.includes(module.id)}
                    onChange={() => handleModuleToggle(module.id)}
                  />
                  <span className="text-sm">{module.icon} {module.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <button type="submit" disabled={loading} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : '✨ Create'}
            </button>
            <button type="button" onClick={() => router.push('/admin/projects')} className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
