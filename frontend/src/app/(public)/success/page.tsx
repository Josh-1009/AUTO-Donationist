'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/approvals');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold">
      جاري التوجيه إلى سجل سندات القبض...
    </div>
  );
}
