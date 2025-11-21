'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('project_token');
    if (!token) {
      router.push('/manage/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Project Dashboard</h1>
          <button
            onClick={() => {
              localStorage.removeItem('project_token');
              router.push('/manage/login');
            }}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Welcome to Admin Dashboard</h2>
          <p className="text-gray-600">
            This is your project management dashboard. More features coming soon!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">📊 Analytics</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">⚙️ Settings</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
            <div className="border rounded-lg p-4">
              <h3 className="font-bold text-lg mb-2">📦 Modules</h3>
              <p className="text-sm text-gray-600">Coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
