'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Heart,
  PlusCircle,
  FileText,
  PhoneCall,
  Users,
  LayoutDashboard,
  Printer,
  Sparkles,
} from 'lucide-react';
import { ReceiptVoucherModal } from './receipt-voucher-modal';

export function Navbar() {
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Logo & System Title */}
          <Link href="/admin/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <span className="font-black text-slate-900 text-base sm:text-lg block tracking-tight">
                منظومة إدارة الجمعية الخيرية
              </span>
              <span className="text-[10px] text-emerald-700 font-bold block">
                نظام التحصيل المكتبي والميداني وسندات القبض (Offline ERP)
              </span>
            </div>
          </Link>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsVoucherModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">تسجيل تحصيل وإصدار سند قبض</span>
              <span className="sm:hidden">إصدار سند</span>
            </button>
          </div>
        </div>
      </header>

      {/* Global Quick Receipt Voucher Modal */}
      <ReceiptVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSuccess={() => {
          // Trigger refresh if needed
        }}
      />
    </>
  );
}
