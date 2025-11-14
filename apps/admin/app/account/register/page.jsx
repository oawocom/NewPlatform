'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    company_name: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Registration failed');

      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Redirect based on role
      if (data.user.role === 'tenant_admin' || data.user.role === 'system_admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">Register</h2>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" required className="w-full px-3 py-2 border rounded"
              value={formData.full_name}
              onChange={(e) => setFormData({...formData, full_name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input type="email" required className="w-full px-3 py-2 border rounded"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Company Name</label>
            <input type="text" required className="w-full px-3 py-2 border rounded"
              value={formData.company_name}
              onChange={(e) => setFormData({...formData, company_name: e.target.value})} />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input type="password" required minLength={8} className="w-full px-3 py-2 border rounded"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})} />
          </div>
          
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {loading ? 'Creating...' : 'Register'}
          </button>
        </form>
        
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/account/login" className="text-blue-600">Login</a>
        </p>
      </div>
    </div>
  );
}
