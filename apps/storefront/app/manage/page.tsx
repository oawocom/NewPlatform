'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ManagePage() {
  const router = useRouter();
  
  useEffect(() => {
    router.push('/manage/login');
  }, [router]);
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>Redirecting...</div>
    </div>
  );
}
