'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import api from '../../../../lib/api';
import { MODULES } from '../../../../config/modules';

export default function EditProjectPage() {
  const [formData, setFormData] = useState({
    name: '',
    subdomain: '',
    description: '',
    password: '',
    modules_enabled: []
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
        const response = await api.get('/projects/' + projectId);
        setFormData({
          name: response.data.name || '',
          subdomain: response.data.subdomain || '',
          description: response.data.description || '',
          password: '',
          modules_enabled: response.data.modules_enabled || []
        });
        setLoadingData(false);
      } catch (err) {
        setError('Failed to load project');
        setLoadingData(false);
      }
    };
    fetchProject();
  }, [projectId]);

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

    try {
      const updateData = {
        name: formData.name,
        subdomain: formData.subdomain,
        description: formData.description,
        modules_enabled: formData.modules_enabled
      };
      if (formData.password) {
        updateData.password = formData.password;
      }
      await api.put('/projects/' + projectId, updateData);
      alert('✅ Project updated!');
      router.push('/admin/projects');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update');
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

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project Name *</label>
            <input 
              type="text" 
              required 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
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
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Change Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              placeholder="Leave blank to keep current" 
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Modules ({formData.modules_enabled.length})
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-900/20">
              {MODULES.map((m) => (
                <label 
                  key={m.id} 
                  className={`p-3 border rounded cursor-pointer transition-colors ${
                    formData.modules_enabled.includes(m.id) 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-gray-900 dark:text-gray-100' 
                      : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <input 
                    type="checkbox" 
                    className="mr-2" 
                    checked={formData.modules_enabled.includes(m.id)} 
                    onChange={() => handleModuleToggle(m.id)} 
                  />
                  <span className="text-sm">{m.icon} {m.title}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
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
    </div>
  );
}
