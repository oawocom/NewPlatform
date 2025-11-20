'use client';
import { useEffect, useState } from 'react';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    const token = localStorage.getItem('token');
    fetch('/api/v1/admin/projects', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setProjects(data.items || []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('Project deleted');
        fetchProjects();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePublish = async (projectId) => {
    if (!confirm('Publish this project?')) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/projects/${projectId}/publish`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert('✅ Published!');
        fetchProjects();
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Projects</h2>
          <a href="/admin/projects/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ➕ Create Project
          </a>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-600 dark:text-gray-400500">
            <p className="mb-4 text-xl">No projects yet</p>
            <a href="/admin/projects/create" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Your First Project
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Created By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-600 dark:text-gray-400500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(project => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium">{project.name}</td>
                  <td className="px-6 py-4">
                    <a href={`https://${project.subdomain}.buildown.design`} target="_blank" className="text-blue-600 hover:underline">
                      {project.subdomain}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      project.published_at ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600 dark:text-gray-400800'
                    }`}>
                      {project.published_at ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400600">
                    {project.created_by_name || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400600">
                    {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-3 justify-center items-center">
                      {!project.published_at && (
                        <button 
                          onClick={() => handlePublish(project.id)} 
                          className="text-green-600 hover:text-green-800"
                          title="Publish"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <a 
                        href={`/admin/projects/${project.id}/edit`} 
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </a>
                      <button 
                        onClick={() => handleDelete(project.id)} 
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
