import { headers } from 'next/headers';
import { getSubdomain, getProject } from '../lib/subdomain';
import NotAvailable from './components/NotAvailable';

export default async function HomePage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const subdomain = getSubdomain(host);
  
  if (!subdomain) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>⚠️ No Subdomain</h1>
        <p>Please access via your project subdomain</p>
      </div>
    );
  }
  
  const project = await getProject(subdomain);
  
  if (!project) {
    return <NotAvailable subdomain={subdomain} />;
  }

  // Check if project is not published
  if (!project.published_at) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Project Not Published Yet
            </h1>
            <p className="text-gray-600 mb-6">
              This project is currently in draft mode and not accessible to visitors.
            </p>
          </div>
          
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Project Owner?</strong> Login to your admin panel to publish this project.
            </p>
          </div>

          <a 
            href="/manage"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔐 Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={{padding: '40px', maxWidth: '1200px', margin: '0 auto'}}>
      <h1>🚀 {project.name}</h1>
      <p><strong>Subdomain:</strong> {project.subdomain}.buildown.design</p>
      <p><strong>Status:</strong> {project.status}</p>
      {project.description && <p><strong>Description:</strong> {project.description}</p>}
      
      {project.modules_enabled && project.modules_enabled.length > 0 && (
        <div style={{marginTop: '20px'}}>
          <strong>Enabled Modules:</strong>
          <ul>
            {project.modules_enabled.map((module: string) => (
              <li key={module}>{module}</li>
            ))}
          </ul>
        </div>
      )}
      
      <div style={{marginTop: '30px'}}>
        <a href="/manage" style={{
          padding: '10px 20px',
          background: '#4F46E5',
          color: 'white',
          textDecoration: 'none',
          borderRadius: '5px',
          display: 'inline-block'
        }}>
          🔐 Admin Login
        </a>
      </div>
    </div>
  );
}
