import { headers } from 'next/headers';
import { getSubdomain, getProject } from '../../../lib/subdomain';
import NotAvailable from '../../components/NotAvailable';
import DashboardClient from './DashboardClient';

export default async function ManageDashboardPage() {
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

  return <DashboardClient project={project} />;
}
