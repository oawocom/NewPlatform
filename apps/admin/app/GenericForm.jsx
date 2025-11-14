import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/layout/Layout';
import FormView from '../components/common/FormView';

export default function GenericForm() {
  const { entity, id } = useParams();
  const navigate = useNavigate();
  
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTableMetadata();
  }, [entity]);

  const loadTableMetadata = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Loading metadata for entity:', entity);
      
      // Fetch table structure from backend
      const response = await api.get(`/meta/${entity}`);
      
      console.log('Meta API response:', response.data);
      console.log('Config title:', response.data.title);
      console.log('Config fields:', response.data.fields);
      
      setConfig(response.data);
    } catch (err) {
      console.error('Failed to load table metadata:', err);
      setError(`Failed to load form configuration for "${entity}"`);
    }
    setLoading(false);
  };

  const handleSuccess = (data) => {
    console.log(`${entity} saved:`, data);
    navigate(`/${entity}`);
  };

  const handleCancel = () => {
    navigate(`/${entity}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading form...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !config) {
    return (
      <Layout>
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error || 'Form configuration not found'}</p>
            <button
              onClick={() => navigate(`/${entity}`)}
              className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isEdit = !!id;
  const displayTitle = isEdit ? `Edit ${config?.title || 'Item'}` : `Create New ${config?.title || 'Item'}`;

  console.log('Rendering form with config:', config);
  console.log('Display title:', displayTitle);

  return (
    <Layout>
      <div className="p-6">
        <FormView
          itemId={id}
          fields={config.fields}
          apiEndpoint={`/crud/${entity}`}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          title={displayTitle}
        />
      </div>
    </Layout>
  );
}