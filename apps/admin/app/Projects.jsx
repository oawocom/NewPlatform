import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/layout/Layout';
import ListView from '../components/common/ListView';

const API_URL = '/api/v1';

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Define columns for ListView
  const columns = [
    { key: 'id', label: 'ID', sortable: true, searchable: true },
    { key: 'name', label: 'Project Name', sortable: true, searchable: true },
    { key: 'type', label: 'Type', sortable: true, searchable: true },
    { key: 'status', label: 'Status', sortable: true, type: 'badge' },
    { key: 'created_at', label: 'Created', sortable: true, type: 'date' }
  ];

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/crud/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
    setLoading(false);
  };

  // Handle actions from ListView
  const handleAction = (action, project) => {
    switch (action) {
      case 'view':
        navigate(`/projects/${project.id}`);
        break;
      case 'edit':
        navigate(`/projects/edit/${project.id}`);
        break;
      case 'delete':
        if (confirm('Are you sure you want to delete this project?')) {
          // TODO: Call delete API
          console.log('Delete project:', project.id);
        }
        break;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6">
        {/* Header with Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <p className="text-gray-500 mt-1">Manage your projects</p>
          </div>
          <button
            onClick={() => navigate('/projects/create')}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <span className="text-xl">➕</span>
            <span>Add Project</span>
          </button>
        </div>

        {/* Use ListView Component */}
        <ListView
          data={projects}
          columns={columns}
          title="All Projects"
          onAction={handleAction}
          searchable={true}
          actions={['view', 'edit', 'delete']}
          emptyMessage="No projects yet. Create your first project to get started!"
        />
      </div>
    </Layout>
  );
}