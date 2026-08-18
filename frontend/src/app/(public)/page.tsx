'use client';

import React from 'react';
import Link from 'next/link';
import {
  Heart,
  FileText,
  Users,
  PhoneCall,
  LayoutDashboard,
  Printer,
  Sparkles,
  ShieldCheck,
  Building,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '../../components/navbar';

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-6 border border-emerald-200 shadow-inner">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>منظومة إدارة وتحصيل الجمعية الخيرية (Offline Charity ERP)</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight mb-4 max-w-3xl">
          إدارة التحصيل الميداني والمكتبي وسندات القبض المعتمدة
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed mb-8">
          نظام داخلي متكامل لإدارة بيانات المتبرعين، توثيق تحصيلات المندوبين وأمناء الصندوق، طباعة إيصالات وسندات القبض الرسمية فوراً، والتواصل المباشر مع المتبرعين عبر واتساب والمكالمات.
        </p>

        {/* Quick Action Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl mb-12">
          <Link
            href="/admin/dashboard"
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-right group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">لوحة التحكم والمؤشرات</h3>
              <p className="text-xs text-slate-500">متابعة إجمالي التحصيلات اليومية والشهرية ونسب إنجاز المشاريع.</p>
            </div>
          </Link>

          <Link
            href="/admin/donors"
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-right group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">دليل وسجل المتبرعين</h3>
              <p className="text-xs text-slate-500">استعراض الأكواد (DNR-XXX)، العناوين للمندوب، وأزرار الواتساب.</p>
            </div>
          </Link>

          <Link
            href="/admin/approvals"
            className="p-6 bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500 transition-all text-right group flex flex-col justify-between"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base mb-1">سندات القبض المعتمدة</h3>
              <p className="text-xs text-slate-500">أرشيف إيصالات وسندات التحصيل مع إمكانية الطباعة الفورية.</p>
            </div>
          </Link>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center items-center gap-4 text-xs text-slate-600 font-bold">
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>طباعة سندات قبض تفقيطاً (Tafqeet)</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>أزرار واتساب ذكية لتجديد النية</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>كشوفات المندوبين والتحصيل المكتبي</span>
          </div>
        </div>
      </main>
    </div>
  );
}
