export function getSubdomain(host: string): string | null {
  const hostname = host.split(':')[0];
  const parts = hostname.split('.');
  if (parts.length < 3) return null;
  const subdomain = parts[0];
  if (subdomain === 'account' || subdomain === 'www') return null;
  return subdomain;
}

export async function getProject(subdomain: string): Promise<any> {
  try {
    const res = await fetch(
      `http://localhost:8002/api/v1/projects/by-subdomain/${subdomain}`,
      { cache: 'no-store' }
    );
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}
