'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  Users,
  FileText,
  PhoneCall,
  FolderHeart,
  CalendarPlus,
  Printer,
  MessageCircle,
  ArrowUpRight,
  TrendingUp,
  FileSpreadsheet,
  CheckCircle,
} from 'lucide-react';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { CollectionsChart } from '../../../../components/charts/collections-chart';
import { CampaignsChart } from '../../../../components/charts/campaigns-chart';
import { PaymentMethodsChart } from '../../../../components/charts/payment-methods-chart';
import { apiGet, apiPost } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { DashboardStats, ReceiptVoucher } from '../../../../lib/types';
import { ReceiptVoucherModal } from '../../../../components/receipt-voucher-modal';
import { StatusBadge } from '../../../../components/ui/badge';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingMonthly, setGeneratingMonthly] = useState(false);
  const [notice, setNotice] = useState('');

  // Quick Voucher Modal
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    const res = await apiGet<DashboardStats>(ENDPOINTS.ADMIN_DASHBOARD);
    setLoading(false);
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  const handleGenerateMonthly = async () => {
    setGeneratingMonthly(true);
    setNotice('');
    const res = await apiPost(ENDPOINTS.CYCLES_GENERATE_MONTHLY);
    setGeneratingMonthly(false);
    if (res.success) {
      setNotice(`تم توليد ${res.data?.createdCount || 0} التزام شهري جديد لجميع المتبرعين النشطين بنجاح.`);
      fetchStats();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <span>نظام الجمعية الداخلي للتحصيل والمتابعة</span>
              </div>
              <h1 className="text-2xl font-black text-slate-900">
                لوحة المتابعة والتحصيل الداخلي (Charity ERP)
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                متابعة التحصيلات النقدية والميدانية، إصدار سندات القبض الفورية، والتواصل مع المتبرعين
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsVoucherModalOpen(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
              >
                <FileText className="w-4 h-4" />
                <span>تسجيل تحصيل وإصدار سند</span>
              </button>

              <button
                onClick={handleGenerateMonthly}
                disabled={generatingMonthly}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
              >
                <CalendarPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>{generatingMonthly ? 'جاري التوليد...' : 'توليد الالتزامات الشهرية'}</span>
              </button>

              <Link
                href="/admin/export"
                className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>كشوفات وتقارير</span>
              </Link>
            </div>
          </div>

          {notice && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold animate-in fade-in flex items-center justify-between">
              <span>⚡ {notice}</span>
              <button onClick={() => setNotice('')} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Top KPI Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {/* Total Collected */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">إجمالي المحصل الفعلي</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900">
                  {stats?.kpis?.totalCollected ? stats.kpis.totalCollected.toLocaleString() : '0'}
                </span>
                <span className="text-xs text-slate-500 mr-1">ج.م</span>
              </div>
              <span className="text-[11px] text-emerald-600 font-bold mt-2 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>سندات قبض معتمدة</span>
              </span>
            </div>

            {/* Total Donors */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">دليل المتبرعين</span>
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.kpis?.totalDonors || 0}
              </span>
              <Link href="/admin/donors" className="text-[11px] text-blue-700 font-bold mt-2 hover:underline block">
                دليل المتبرعين والواتساب ←
              </Link>
            </div>

            {/* Total Vouchers Issued */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">سندات القبض الصادرة</span>
                <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-indigo-900">
                {stats?.kpis?.totalVouchers || 0}
              </span>
              <Link href="/admin/approvals" className="text-[11px] text-indigo-700 font-bold mt-2 hover:underline block">
                أرشيف السندات والطباعة ←
              </Link>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">المشاريع والكفالات</span>
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <FolderHeart className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-slate-900">
                {stats?.kpis?.activeCampaigns || 0}
              </span>
              <span className="text-[11px] text-slate-500 mt-2 block">كفالات أيتام وإطعام</span>
            </div>

            {/* Overdue / Needs Followup */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-500 mb-2">
                <span className="text-xs font-bold">طابور المتابعة</span>
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
              </div>
              <span className="text-2xl font-black text-rose-700">
                {stats?.kpis?.overdueCount || 0}
              </span>
              <Link href="/admin/overdue" className="text-[11px] text-rose-700 font-bold mt-2 hover:underline block">
                متابعة المتأخرين هاتفياً ←
              </Link>
            </div>
          </div>

          {/* Latest Issued Vouchers */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">آخر سندات قبض نقدية تم إصدارها:</h3>
                <p className="text-[11px] text-slate-500">سندات معتمدة وموثقة برقم إيصال رسمي</p>
              </div>
              <Link href="/admin/approvals" className="text-xs font-bold text-emerald-700 hover:underline">
                عرض كل السندات ({stats?.kpis?.totalVouchers || 0}) ←
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">رقم السند</th>
                    <th className="py-2.5 px-3">اسم المتبرع</th>
                    <th className="py-2.5 px-3">المشروع / الحملة</th>
                    <th className="py-2.5 px-3">المبلغ المحصل</th>
                    <th className="py-2.5 px-3">طريقة السداد</th>
                    <th className="py-2.5 px-3">المستلم / المندوب</th>
                    <th className="py-2.5 px-3">التاريخ</th>
                    <th className="py-2.5 px-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {!stats?.recentVouchers || stats.recentVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-6 text-slate-400">
                        لم يتم إصدار سندات قبض بعد
                      </td>
                    </tr>
                  ) : (
                    stats.recentVouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {v.voucherNumber}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {v.donor?.fullName}
                          <span className="block font-mono text-[10px] text-slate-400">{v.donor?.donorCode}</span>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{v.campaign?.title}</td>
                        <td className="py-3 px-3 font-black text-emerald-700 text-sm">
                          {v.amount} ج.م
                        </td>
                        <td className="py-3 px-3">
                          <StatusBadge status={v.paymentMethod} />
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {v.collectorName || v.receivedBy}
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {new Date(v.receiptDate).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {v.thankYouWhatsAppUrl && (
                              <a
                                href={v.thankYouWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="إرسال شكر وسند بالواتساب"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4">منحنى التحصيل والمستهدف الشهري للجمعية:</h3>
              <CollectionsChart data={stats?.monthlyTrends || []} />
            </div>

            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-900 text-sm mb-4">طرق التحصيل المتبعة:</h3>
              <PaymentMethodsChart data={stats?.paymentMethodsBreakdown || []} />
            </div>
          </div>

          {/* Campaigns Progress Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-900 text-sm mb-4">نسب إنجاز مستهدفات المشاريع والكفالات:</h3>
            <CampaignsChart data={stats?.campaignsBreakdown || []} />
          </div>
        </main>
      </div>

      {/* Global Quick Receipt Voucher Modal */}
      <ReceiptVoucherModal
        isOpen={isVoucherModalOpen}
        onClose={() => setIsVoucherModalOpen(false)}
        onSuccess={() => fetchStats()}
      />
    </div>
  );
}
