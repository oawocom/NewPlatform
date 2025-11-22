import { headers } from 'next/headers';
import { getSubdomain, getProject } from '../../../lib/subdomain';
import NotAvailable from '../../components/NotAvailable';
import LoginForm from './LoginForm';

export default async function ManageLoginPage() {
  const headersList = headers();
  const host = headersList.get('host') || '';
  const subdomain = getSubdomain(host);
  
  if (!subdomain) {
    return <NotAvailable subdomain="unknown" />;
  }
  
  const project = await getProject(subdomain);
  
  if (!project) {
    return <NotAvailable subdomain={subdomain} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">Admin Panel Login</p>
        </div>
        <LoginForm projectId={project.id} subdomain={subdomain} />
      </div>
    </div>
  );
}
