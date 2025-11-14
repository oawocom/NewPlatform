import { useParams } from 'react-router-dom';
import { getTableConfig, tableExists } from '../config/tables';

export default function TableManager({ children }) {
  const { table } = useParams();
  
  // Check if table exists
  if (!tableExists(table)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Table Not Found</h2>
          <p className="text-gray-600">The table "{table}" does not exist or is not configured.</p>
          <a href="/dashboard" className="mt-4 inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }
  
  const config = getTableConfig(table);
  
  // Pass config to children
  return children({ config, table });
}
