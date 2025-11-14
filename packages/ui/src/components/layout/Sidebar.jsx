import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, setIsOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tenant = user.tenant_name || 'Company';

  const menuItems = [
    { name: 'Dashboard', icon: '📊', path: '/dashboard' },
    { name: 'Users', icon: '👥', path: '/users' },
    { name: 'Projects', icon: '📁', path: '/projects' },
  ];

  return (
    <aside className={`${isOpen ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 transition-all duration-300 flex flex-col`}>
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
        {isOpen ? (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🚀</span>
            <span className="text-lg font-bold text-gray-900">Platform</span>
          </div>
        ) : (
          <span className="text-2xl mx-auto">🚀</span>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {isOpen ? '◀' : '▶'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 py-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition ${
              location.pathname === item.path ? 'bg-primary-50 text-primary-600 border-r-2 border-primary-600' : ''
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            {isOpen && <span className="font-medium">{item.name}</span>}
          </button>
        ))}
      </nav>

      {/* User Info */}
      <div className="p-4 border-t border-gray-200">
        {isOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user.full_name}</p>
              <p className="text-xs text-gray-500 truncate">{tenant}</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold mx-auto">
            {user.full_name?.charAt(0) || 'U'}
          </div>
        )}
      </div>
    </aside>
  );
}