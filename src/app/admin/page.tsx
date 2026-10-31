'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/books');
  }, [router]);

  return (
    <div className="h-96 flex flex-col items-center justify-center gap-3 text-primary animate-pulse font-mono text-sm">
      <span className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <span>Loading Book Manager...</span>
    </div>
  );
}
