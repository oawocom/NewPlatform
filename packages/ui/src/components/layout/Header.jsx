import { useNavigate, useLocation } from 'react-router-dom';

export default function Header({ sidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const tenant = user.tenant_name || 'Company';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Get page title from path
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/users') return 'Users';
    if (path === '/projects') return 'Projects';
    return 'Platform';
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{getPageTitle()}</h1>
        <p className="text-sm text-gray-500">{tenant}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 hover:bg-gray-100 rounded-lg relative">
          <span className="text-xl">🔔</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Menu */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-700 hover:text-red-600 font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}