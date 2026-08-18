'use client';

import React, { useEffect, useState } from 'react';
import {
  FileText,
  Printer,
  MessageCircle,
  Search,
  CheckCircle,
  Calendar,
  Building,
  DollarSign,
  Filter,
  Plus,
} from 'lucide-react';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { apiGet } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { ReceiptVoucher } from '../../../../lib/types';
import { StatusBadge } from '../../../../components/ui/badge';
import { Modal } from '../../../../components/ui/modal';
import { ReceiptVoucherModal } from '../../../../components/receipt-voucher-modal';

export default function AdminVouchersArchivePage() {
  const [vouchers, setVouchers] = useState<ReceiptVoucher[]>([]);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Print Preview Modal State
  const [selectedVoucher, setSelectedVoucher] = useState<ReceiptVoucher | null>(null);

  // New Voucher Entry Modal
  const [isNewVoucherModalOpen, setIsNewVoucherModalOpen] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    const res = await apiGet<ReceiptVoucher[]>(ENDPOINTS.VOUCHERS_LIST, {
      search: search || undefined,
      paymentMethod: methodFilter || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setVouchers(res.data);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVouchers();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-black text-slate-900">
                سجل وسندات القبض المعتمدة (Receipt Vouchers)
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                أرشيف كامل لكافة إيصالات التحصيل النقدي والميداني مع إمكانية إعادة الطباعة وإرسال الشكر عبر واتساب
              </p>
            </div>

            <button
              onClick={() => setIsNewVoucherModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار سند قبض جديد</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث برقم السند (REC-XXXX)، اسم المتبرع، الكود، أو اسم المندوب..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setTimeout(fetchVouchers, 0);
                }}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="">كل طرق التحصيل</option>
                <option value="cash">نقدي بالمقر</option>
                <option value="collector">مندوب ميداني</option>
                <option value="instapay">إنستاباي</option>
                <option value="vodafone_cash">فودافون كاش</option>
                <option value="bank_transfer">تحويل بنكي</option>
              </select>

              <button
                type="submit"
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-colors"
              >
                بحث
              </button>
            </form>
          </div>

          {/* Vouchers Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">رقم السند التسلسلي</th>
                    <th className="py-3.5 px-4">المتبرع</th>
                    <th className="py-3.5 px-4">المشروع / الحملة</th>
                    <th className="py-3.5 px-4">المبلغ المسدد</th>
                    <th className="py-3.5 px-4">طريقة التحصيل</th>
                    <th className="py-3.5 px-4">المحصل / المستلم</th>
                    <th className="py-3.5 px-4">تاريخ السند</th>
                    <th className="py-3.5 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        جاري تحميل سندات القبض...
                      </td>
                    </tr>
                  ) : vouchers.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <span className="font-bold text-slate-700 block">لا توجد سندات قبض مسجلة</span>
                      </td>
                    </tr>
                  ) : (
                    vouchers.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                          {v.voucherNumber}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-800">
                          {v.donor?.fullName}
                          <span className="block font-mono text-[10px] text-slate-400 font-normal">
                            {v.donor?.donorCode} | {v.donor?.phone}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">
                          {v.campaign?.title}
                        </td>
                        <td className="py-3.5 px-4">
                          <strong className="text-sm font-black text-emerald-700 block">{v.amount} ج.م</strong>
                          <span className="text-[10px] text-slate-400 block line-clamp-1">{v.amountInWords}</span>
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={v.paymentMethod} />
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {v.collectorName || v.receivedBy}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(v.receiptDate).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* Print Voucher Preview */}
                            <button
                              onClick={() => setSelectedVoucher(v)}
                              className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                              title="معاينة وطباعة سند القبض"
                            >
                              <Printer className="w-3.5 h-3.5 text-emerald-400" />
                              <span>طباعة</span>
                            </button>

                            {/* WhatsApp Thank You */}
                            {v.thankYouWhatsAppUrl && (
                              <a
                                href={v.thankYouWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="إرسال شكر وسند بالواتساب"
                              >
                                <MessageCircle className="w-4 h-4" />
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

          {/* Voucher Preview & Print Modal */}
          {selectedVoucher && (
            <Modal
              isOpen={!!selectedVoucher}
              onClose={() => setSelectedVoucher(null)}
              title={`معاينة سند قبض: ${selectedVoucher.voucherNumber}`}
              maxWidth="lg"
            >
              <div className="space-y-4 text-xs">
                {/* Printable Document Box */}
                <div
                  id="printable-voucher-modal"
                  className="bg-white border-2 border-slate-800 rounded-2xl p-6 text-slate-900 space-y-4"
                >
                  <div className="border-b-2 border-slate-800 pb-4 text-center">
                    <div className="flex justify-between items-start">
                      <div className="text-right">
                        <h3 className="font-black text-sm text-slate-900">الجمعية الخيرية لرعاية الأيتام</h3>
                        <span className="text-[11px] text-slate-500 block">إشهار رقم: 1234 لسنة 2015</span>
                        <span className="text-[11px] text-slate-500 block">الحسابات والتحصيل الداخلي</span>
                      </div>
                      <div className="text-center">
                        <h2 className="font-black text-base text-slate-900">سند قبض نقدي</h2>
                        <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                          {selectedVoucher.voucherNumber}
                        </span>
                      </div>
                      <div className="text-left text-xs font-mono">
                        <span>التاريخ: {new Date(selectedVoucher.receiptDate).toLocaleDateString('ar-EG')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 text-xs leading-relaxed">
                    <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span>استلمنا من الأستاذ / الفاضل:</span>
                      <strong className="text-sm font-bold text-slate-900">
                        {selectedVoucher.donor?.fullName} ({selectedVoucher.donor?.donorCode})
                      </strong>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">مبلغ وقدره:</span>
                        <strong className="text-base font-black text-emerald-700">{selectedVoucher.amount} ج.م</strong>
                      </div>

                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                        <span className="text-slate-500 block text-[11px]">طريقة السداد:</span>
                        <strong className="text-xs font-bold text-slate-800 uppercase">{selectedVoucher.paymentMethod}</strong>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">فقط وقدره كتابة:</span>
                      <strong className="font-bold text-slate-800 text-xs">
                        {selectedVoucher.amountInWords || 'فقط المبلغ المذكور لا غير'}
                      </strong>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 block text-[11px]">وذلك تبرعاً ومساهمة في:</span>
                      <strong className="font-bold text-slate-900 text-xs">
                        {selectedVoucher.campaign?.title || 'حملة الصدقة الدورية'}
                      </strong>
                    </div>

                    {selectedVoucher.notes && (
                      <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 border">
                        ملاحظات: {selectedVoucher.notes}
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">المحصل / المندوب</span>
                      <strong className="mt-1 block">{selectedVoucher.collectorName || '—'}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">أمين الصندوق المستلم</span>
                      <strong className="mt-1 block">{selectedVoucher.receivedBy}</strong>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">ختم الجمعية</span>
                      <div className="w-16 h-8 border border-dashed border-slate-400 rounded mx-auto mt-1 flex items-center justify-center text-[10px] text-slate-400">
                        ختم معتمد
                      </div>
                    </div>
                  </div>
                </div>

                {/* Print and WhatsApp Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={handlePrint}
                    className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                  >
                    <Printer className="w-4 h-4 text-emerald-400" />
                    <span>طباعة السند الآن</span>
                  </button>

                  {selectedVoucher.thankYouWhatsAppUrl && (
                    <a
                      href={selectedVoucher.thankYouWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>إرسال بالواتساب</span>
                    </a>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* Quick Entry Modal */}
          <ReceiptVoucherModal
            isOpen={isNewVoucherModalOpen}
            onClose={() => setIsNewVoucherModalOpen(false)}
            onSuccess={() => fetchVouchers()}
          />
        </main>
      </div>
    </div>
  );
}
