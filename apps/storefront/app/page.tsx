import { headers } from 'next/headers';

function getSubdomain(host: string): string | null {
  // Remove port if present
  const hostname = host.split(':')[0];
  
  // Extract subdomain from hostname
  const parts = hostname.split('.');
  
  // buildown.design or localhost
  if (parts.length < 3) return null;
  
  // subdomain.buildown.design
  const subdomain = parts[0];
  
  // Don't treat 'account' as a project subdomain
  if (subdomain === 'account') return null;
  
  return subdomain;
}

export default async function HomePage() {
  // Get hostname from headers
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
  
  // Fetch project data
  let project = null;
  try {
    const res = await fetch(
      `http://backend:8000/api/v1/projects/by-subdomain/${subdomain}`,
      { cache: 'no-store' }
    );
    if (res.ok) {
      project = await res.json();
    }
  } catch (error) {
    console.error('Error fetching project:', error);
  }

  if (!project) {
    return (
      <div style={{padding: '40px', textAlign: 'center'}}>
        <h1>❌ Project Not Found</h1>
        <p>Subdomain: {subdomain}</p>
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
        <a href="/manage/login" style={{
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
