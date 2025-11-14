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
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`/api/v1/crud/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        alert('Project deleted successfully');
        fetchProjects();
      } else {
        alert('Failed to delete project');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b flex justify-between items-center">
          <h2 className="text-2xl font-bold">Manage Projects</h2>
          <a href="/admin/projects/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            ➕ Create Project
          </a>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="mb-4 text-xl">No projects yet</p>
            <a href="/admin/projects/create" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              Create Your First Project
            </a>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subdomain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {projects.map(project => (
                <tr key={project.id}>
                  <td className="px-6 py-4 font-medium">{project.name}</td>
                  <td className="px-6 py-4">
                    {project.subdomain ? (
                      <a href={`https://${project.subdomain}.buildown.design`} target="_blank" className="text-blue-600 hover:underline">
                        {project.subdomain}
                      </a>
                    ) : (
                      <span className="text-gray-400">Not set</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded ${project.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {project.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}</td>
                  <td className="px-6 py-4">
                    <a href={`/admin/projects/${project.id}/edit`} className="text-blue-600 hover:text-blue-700 mr-3">
                      Edit
                    </a>
                    <button onClick={() => handleDelete(project.id)} className="text-red-600 hover:text-red-700">
                      Delete
                    </button>
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
