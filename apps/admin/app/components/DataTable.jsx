'use client';

/**
 * Reusable DataTable Component
 * Design standard for all admin tables
 *
 * @param {Object} props
 * @param {Array} props.columns - Array of column definitions
 *   - key: string - unique identifier
 *   - label: string - column header text
 *   - align: 'left' | 'center' | 'right' - text alignment (default: 'left')
 *   - render: function(item) - custom render function for cell content
 * @param {Array} props.data - Array of data items
 * @param {Function} props.renderActions - Function to render action buttons, receives item
 * @param {String} props.emptyMessage - Message when no data (default: "No items found")
 * @param {Boolean} props.loading - Loading state (default: false)
 */
export default function DataTable({
  columns = [],
  data = [],
  renderActions,
  emptyMessage = "No items found",
  loading = false
}) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
          Loading...
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-8 text-center text-gray-600 dark:text-gray-400">
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-${column.align || 'left'} text-xs font-medium text-gray-500 dark:text-gray-300 uppercase`}
              >
                {column.label}
              </th>
            ))}
            {renderActions && (
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((item, index) => (
            <tr key={item.id || index} className="hover:bg-gray-50 dark:hover:bg-gray-700">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={`px-6 py-4 text-${column.align || 'left'}`}
                >
                  {column.render ? column.render(item) : item[column.key]}
                </td>
              ))}
              {renderActions && (
                <td className="px-6 py-4">
                  <div className="flex gap-3 justify-center items-center">
                    {renderActions(item)}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Badge Component for status/role badges
 */
export function Badge({ children, color = 'blue' }) {
  const colorClasses = {
    blue: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    green: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    red: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200',
    gray: 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${colorClasses[color] || colorClasses.blue}`}>
      {children}
    </span>
  );
}

/**
 * Action Icon Components
 */
export function EditIcon({ href, onClick, title = "Edit" }) {
  const className = "text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300";
  const svg = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );

  if (href) {
    return (
      <a href={href} className={className} title={title}>
        {svg}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={className} title={title}>
      {svg}
    </button>
  );
}

export function DeleteIcon({ onClick, title = "Delete" }) {
  return (
    <button
      onClick={onClick}
      className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
      title={title}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
}

export function PublishIcon({ onClick, title = "Publish" }) {
  return (
    <button
      onClick={onClick}
      className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
      title={title}
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </button>
  );
}
