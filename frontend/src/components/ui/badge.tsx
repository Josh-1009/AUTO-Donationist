import React from 'react';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const normalized = (status || '').toLowerCase();

  switch (normalized) {
    case 'paid':
    case 'collected':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 ${className}`}>
          ● مسدد بالكامل
        </span>
      );

    case 'partially_paid':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 ${className}`}>
          ● مسدد جزئياً
        </span>
      );

    case 'pending':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 ${className}`}>
          ● بانتظار التحصيل
        </span>
      );

    case 'postponed':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200 ${className}`}>
          ● مؤجل
        </span>
      );

    case 'skipped':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 ${className}`}>
          ● تم التخطي
        </span>
      );

    case 'needs_followup':
    case 'failed':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 ${className}`}>
          ● مطلوب متابعة عاجلة
        </span>
      );

    case 'active':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 ${className}`}>
          نشط
        </span>
      );

    case 'paused':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          موقوف مؤقتاً
        </span>
      );

    case 'cancelled':
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 ${className}`}>
          ملغي
        </span>
      );

    case 'cash':
    case 'cash_office':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200 ${className}`}>
          نقدي بالمقر
        </span>
      );

    case 'collector':
    case 'collector_visit':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 ${className}`}>
          مندوب ميداني
        </span>
      );

    case 'instapay':
    case 'instapay_manual':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200 ${className}`}>
          إنستاباي
        </span>
      );

    case 'vodafone_cash':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-red-50 text-red-700 border border-red-200 ${className}`}>
          فودافون كاش
        </span>
      );

    case 'bank_transfer':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 ${className}`}>
          تحويل بنكي
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 ${className}`}>
          {status}
        </span>
      );
  }
}
