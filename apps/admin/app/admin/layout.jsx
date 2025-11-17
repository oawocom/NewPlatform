'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLayout({ children }) {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/');
      return;
    }
    
    const user = JSON.parse(userData);
    
    // Check if user is admin
    if (user.role !== 'TENANT_ADMIN' && user.role !== 'SUPER_ADMIN') {
      router.push('/admin/dashboard');
      return;
    }
    
    setUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-600 hover:text-gray-900">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-xl font-bold">🚀 Admin Panel</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">{user.role}</span>
            <span className="text-sm text-gray-600">{user.full_name}</span>
            <button onClick={handleLogout} className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-white shadow-sm fixed left-0 top-16 bottom-0 overflow-hidden transition-all duration-300`}>
          <nav className="p-4 space-y-2">
            <a href="/admin/dashboard" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>📊</span>
              <span>Dashboard</span>
            </a>
            <a href="/admin/projects" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>📁</span>
              <span>Projects</span>
            </a>
            <a href="/admin/users" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>👥</span>
              <span>Users</span>
            </a>
            <a href="/admin/roles" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>🔐</span>
              <span>Roles</span>
            </a>
            <a href="/admin/permissions" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>🛡️</span>
              <span>Permissions</span>
            </a>
            <a href="/admin/settings" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>⚙️</span>
              <span>Settings</span>
            </a>
            <a href="/admin/billing" className="flex items-center space-x-3 px-4 py-3 rounded hover:bg-blue-50 text-gray-700 hover:text-blue-600">
              <span>💳</span>
              <span>Billing</span>
            </a>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-0'} transition-all duration-300 p-6`}>
          {children}
        </main>
      </div>

      {/* Footer */}
      <footer className={`${sidebarOpen ? 'ml-64' : 'ml-0'} bg-white border-t py-4 px-6 transition-all duration-300`}>
        <div className="text-center text-sm text-gray-600">
          © 2024 Platform V2 Admin Panel
        </div>
      </footer>
    </div>
  );
}
