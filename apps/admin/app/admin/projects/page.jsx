'use client';
import { useEffect, useState } from 'react';
import DataTable, { Badge, EditIcon, DeleteIcon, PublishIcon, UnpublishIcon } from '../../components/DataTable';
import api from '../../lib/api';

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/admin/projects');
      setProjects(response.data.items || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (projectId) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.delete('/projects/' + projectId);
      alert('Project deleted');
      fetchProjects();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handlePublish = async (projectId) => {
    if (!confirm('Publish this project?')) return;
    try {
      await api.post('/projects/' + projectId + '/publish');
      alert('✅ Published!');
      fetchProjects();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleUnpublish = async (projectId) => {
    if (!confirm('Unpublish this project?')) return;
    try {
      await api.post('/projects/' + projectId + '/unpublish');
      alert('✅ Unpublished!');
      fetchProjects();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      render: (project) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {project.name}
        </span>
      )
    },
    {
      key: 'subdomain',
      label: 'Subdomain',
      render: (project) => (
        <a
        
          href={'https://' + project.subdomain + '.buildown.design'}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          {project.subdomain}
        </a>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (project) => (
        <Badge color={project.published_at ? 'green' : 'gray'}>
          {project.published_at ? 'Published' : 'Draft'}
        </Badge>
      )
    },
    {
      key: 'created_by',
      label: 'Created By',
      render: (project) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {project.created_by_name || '-'}
        </span>
      )
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (project) => (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {project.created_at ? new Date(project.created_at).toLocaleDateString() : 'N/A'}
        </span>
      )
    }
  ];

  const renderActions = (project) => (
    <>
      {!project.published_at ? (
        <PublishIcon onClick={() => handlePublish(project.id)} />
      ) : (
        <UnpublishIcon onClick={() => handleUnpublish(project.id)} />
      )}
      <EditIcon href={'/admin/projects/' + project.id + '/edit'} />
      <DeleteIcon onClick={() => handleDelete(project.id)} />
    </>
  );

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Projects</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Create and manage your projects</p>
        </div>
        <a href="/admin/projects/create" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          ➕ Create Project
        </a>
      </div>

      {!loading && projects.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <p className="mb-4 text-xl text-gray-600 dark:text-gray-400">No projects yet</p>
          <a href="/admin/projects/create" className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Create Your First Project
          </a>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={projects}
          renderActions={renderActions}
          loading={loading}
          emptyMessage="No projects found"
        />
      )}
    </div>
  );
}