'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      router.push('/account/login');
      return;
    }
    
    const user = JSON.parse(userData);
    
    // Redirect admins to admin panel
    if (user.role === 'tenant_admin' || user.role === 'system_admin') {
      router.push('/admin/dashboard');
      return;
    }
    
    setUser(user);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/account/login');
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">🚀 Platform V2</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm">{user.full_name}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold mb-6">Welcome, {user.full_name}!</h2>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-xl font-bold mb-4">My Projects</h3>
          <p className="text-gray-500">Your assigned projects will appear here.</p>
        </div>
      </main>
    </div>
  );
}
