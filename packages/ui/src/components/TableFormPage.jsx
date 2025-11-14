import { useNavigate, useParams } from 'react-router-dom';
import { getTableConfig } from '../config/tables';
import FormView from './common/FormView';

export default function TableFormPage() {
  const { table, id } = useParams();
  const navigate = useNavigate();
  const config = getTableConfig(table);

  const handleSuccess = () => {
    navigate(`/${table}`);
  };

  const handleCancel = () => {
    navigate(`/${table}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FormView
          itemId={id}
          fields={config.columns}
          apiEndpoint={config.apiEndpoint}
          title={id ? `Edit ${config.singularLabel}` : `Create ${config.singularLabel}`}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
