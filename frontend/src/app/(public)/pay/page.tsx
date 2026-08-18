'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
  const router = useRouter();

  useEffect(() => {
    // In Offline Charity ERP mode, redirect directly to the admin dashboard
    router.replace('/admin/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold">
      جاري التوجيه إلى لوحة تحكم وسندات الجمعية...
    </div>
  );
}
