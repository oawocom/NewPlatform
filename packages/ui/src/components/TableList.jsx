import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import ListView from './common/ListView';
import ConfirmModal from './common/ConfirmModal';
import { getTableConfig } from '../config/tables';

export default function TableList() {
  const { table } = useParams();
  const navigate = useNavigate();
  const config = getTableConfig(table);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    loadData();
  }, [table]);

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await api.get(config.apiEndpoint);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
    setLoading(false);
  };

  const handleAction = (action, item) => {
    switch (action) {
      case 'view':
        console.log('View:', item);
        break;
      case 'edit':
        navigate(`/${table}/edit/${item.id}`);
        break;
      case 'delete':
        setDeleteModal({ isOpen: true, item });
        break;
      default:
        break;
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`${config.apiEndpoint}/${deleteModal.item.id}`);
      setDeleteModal({ isOpen: false, item: null });
      loadData();
    } catch (error) {
      console.error('Failed to delete:', error);
      alert('Failed to delete item');
    }
  };

  const handleCreate = () => {
    navigate(`/${table}/create`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ListView
          title={config.label}
          data={data}
          columns={config.listColumns}
          searchable={true}
          actions={config.actions}
          onAction={handleAction}
          emptyMessage={config.emptyMessage}
          createButton={config.canCreate ? {
            label: `Create ${config.singularLabel}`,
            onClick: handleCreate
          } : null}
        />
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={handleDelete}
        title={`Delete ${config.singularLabel}`}
        message={`Are you sure you want to delete this ${config.singularLabel.toLowerCase()}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />
    </div>
  );
}
