'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Project {
  id: number;
  name: string;
  subdomain: string;
  status: string;
  modules_enabled?: string[];
}

export default function DashboardClient({ project }: { project: Project }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('manage_token');
    if (!token) {
      router.push('/manage/login');
      return;
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('manage_token');
    router.push('/manage/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-sm text-gray-600">Admin Dashboard</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Welcome to Admin Panel
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-sm text-gray-600">Status</p>
              <p className="text-lg font-semibold text-blue-600">{project.status}</p>
            </div>
            <div className="p-4 bg-green-50 rounded">
              <p className="text-sm text-gray-600">Subdomain</p>
              <p className="text-lg font-semibold text-green-600">{project.subdomain}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded">
              <p className="text-sm text-gray-600">Modules</p>
              <p className="text-lg font-semibold text-purple-600">
                {project.modules_enabled?.length || 0} enabled
              </p>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-semibold text-gray-700 mb-2">Enabled Modules:</h3>
            {project.modules_enabled && project.modules_enabled.length > 0 ? (
              <ul className="space-y-2">
                {project.modules_enabled.map((module: string) => (
                  <li key={module} className="flex items-center space-x-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-gray-700">{module}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No modules enabled</p>
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              🚧 Dashboard content coming soon! This is where you'll manage your project content.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
