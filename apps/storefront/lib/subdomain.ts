export function getSubdomain(host: string): string | null {
  // Remove port if exists
  const hostname = host.split(':')[0];
  
  // Split by dots
  const parts = hostname.split('.');
  
  // Check if it's a subdomain of buildown.design
  // Format: subdomain.buildown.design
  if (parts.length >= 3 && parts[parts.length - 2] === 'buildown' && parts[parts.length - 1] === 'design') {
    return parts[0];
  }
  
  // For localhost testing: subdomain.localhost
  if (parts.length >= 2 && parts[parts.length - 1] === 'localhost') {
    return parts[0];
  }
  
  return null;
}
