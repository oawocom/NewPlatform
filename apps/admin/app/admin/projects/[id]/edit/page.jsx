'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';
import { MODULES } from '../../../../config/modules';

export default function EditProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const router = useRouter();
  const params = useParams();
  const projectId = params.id;

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await api.get('/crud/projects/' + projectId);
        setFormData({
          name: response.data.name || '',
          subdomain: response.data.subdomain || '',
          description: response.data.description || ''
        });
        setLoadingData(false);
      } catch (err) {
        setError('Failed to load project');
        setLoadingData(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await api.put('/crud/projects/' + projectId, formData);
      alert('✅ Project updated successfully!');
      router.push('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to update project');
    }
    setLoading(false);
  };

  if (loadingData) return <div className="p-8 text-center text-gray-600 dark:text-gray-400">Loading...</div>;

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Edit Project</h2>

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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subdomain *</label>
            <div className="flex items-center">
              <input
                type="text"
                required
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-l bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                value={formData.subdomain}
                onChange={(e) => setFormData({...formData, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : '💾 Save Changes'}
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

      {/* Available Modules Section */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">📦 Available Modules ({MODULES.length} total)</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Expand your project with these modules</p>
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