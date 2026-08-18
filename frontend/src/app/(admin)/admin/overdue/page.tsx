'use client';

import React, { useEffect, useState } from 'react';
import {
  PhoneCall,
  MessageCircle,
  Clock,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  CheckCircle2,
  RefreshCw,
  Plus,
  ArrowRight,
  Phone,
  Building,
} from 'lucide-react';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { apiGet, apiPost } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { OverdueFollowupItem } from '../../../../lib/types';
import { StatusBadge } from '../../../../components/ui/badge';
import { Modal } from '../../../../components/ui/modal';
import { ReceiptVoucherModal } from '../../../../components/receipt-voucher-modal';

export default function AdminOverduePage() {
  const [items, setItems] = useState<OverdueFollowupItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Log Followup Modal State
  const [selectedItemForLog, setSelectedItemForLog] = useState<OverdueFollowupItem | null>(null);
  const [contactType, setContactType] = useState('phone_call');
  const [outcome, setOutcome] = useState('promised_to_pay');
  const [followupNotes, setFollowupNotes] = useState('');
  const [contactedBy, setContactedBy] = useState('أ / محمود الشافعي');
  const [submittingLog, setSubmittingLog] = useState(false);

  // Postpone Modal State
  const [postponeItem, setPostponeItem] = useState<OverdueFollowupItem | null>(null);
  const [postponeNotes, setPostponeNotes] = useState('');
  const [submittingPostpone, setSubmittingPostpone] = useState(false);

  // Quick Voucher Modal State
  const [voucherItem, setVoucherItem] = useState<OverdueFollowupItem | null>(null);

  useEffect(() => {
    fetchOverdueList();
  }, []);

  const fetchOverdueList = async () => {
    setLoading(true);
    const res = await apiGet<OverdueFollowupItem[]>(ENDPOINTS.CYCLES_OVERDUE);
    setLoading(false);
    if (res.success && res.data) {
      setItems(res.data);
    }
  };

  const handleLogFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForLog) return;

    setSubmittingLog(true);
    const res = await apiPost(ENDPOINTS.FOLLOWUPS_LIST, {
      donorId: selectedItemForLog.donorId,
      cycleId: selectedItemForLog.id,
      contactType,
      outcome,
      notes: followupNotes,
      contactedBy,
    });
    setSubmittingLog(false);

    if (res.success) {
      setSelectedItemForLog(null);
      setFollowupNotes('');
      fetchOverdueList();
    }
  };

  const handlePostpone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponeItem) return;

    setSubmittingPostpone(true);
    const res = await apiPost(ENDPOINTS.CYCLES_POSTPONE, {
      cycleId: postponeItem.id,
      notes: postponeNotes,
    });
    setSubmittingPostpone(false);

    if (res.success) {
      setPostponeItem(null);
      setPostponeNotes('');
      fetchOverdueList();
    }
  };

  const handleSkip = async (item: OverdueFollowupItem) => {
    const reason = prompt('سبب تخطي دورة هذا الشهر:');
    if (reason === null) return;

    await apiPost(ENDPOINTS.CYCLES_SKIP, {
      cycleId: item.id,
      reason: reason || 'طلب المتبرع التخطي',
    });
    fetchOverdueList();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {/* Header Banner */}
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-white mb-8 border border-slate-800 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-bold mb-3 border border-rose-500/30">
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>طابور المتابعة والاتصال المباشر بالمتبرعين</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  متابعة الالتزامات الشهرية والمتأخرين عن التحصيل
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl font-light leading-relaxed">
                  قائمة المتبرعين المطلوب التواصل معهم عبر واتساب أو الاتصال الهاتفي لتنسيق موعد زيارة المندوب أو استلام المساهمة بالمقر.
                </p>
              </div>

              <button
                onClick={fetchOverdueList}
                className="px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all flex items-center gap-2 self-start shrink-0 shadow-lg shadow-emerald-600/30"
              >
                <RefreshCw className="w-4 h-4" />
                <span>تحديث القائمة</span>
              </button>
            </div>
          </div>

          {/* Followup Queue Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 text-sm">قائمة المتابعة الحالية:</span>
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 font-bold rounded-full text-xs">
                  {items.length} حالة
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">كود المتبرع</th>
                    <th className="py-3.5 px-4">اسم المتبرع وبياناته</th>
                    <th className="py-3.5 px-4">العنوان للمندوب</th>
                    <th className="py-3.5 px-4">المشروع والمبلغ المتبقي</th>
                    <th className="py-3.5 px-4">طريقة التحصيل</th>
                    <th className="py-3.5 px-4">الحالة والتأجيل</th>
                    <th className="py-3.5 px-4">آخر متابعة مسجلة</th>
                    <th className="py-3.5 px-4 text-center">أزرار التواصل والإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-slate-400">
                        جاري تحميل طابور المتابعة...
                      </td>
                    </tr>
                  ) : items.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-16 text-slate-400">
                        <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                        <span className="font-bold text-slate-700 text-sm block">كافة الالتزامات مسددة بنجاح!</span>
                        <span className="text-xs text-slate-400">لا توجد اشتراكات متأخرة تتطلب المتابعة حالياً.</span>
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-slate-800">
                          {item.donorCode}
                        </td>
                        <td className="py-4 px-4 font-bold text-slate-900">
                          {item.donorName}
                          <span className="block font-mono text-slate-600 text-xs font-normal mt-0.5" dir="ltr">
                            {item.phone}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-600 max-w-[180px] truncate" title={item.address}>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="truncate">{item.address}</span>
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <strong className="text-slate-800 block">{item.campaignTitle}</strong>
                          <span className="text-emerald-700 font-bold text-sm">
                            {item.remainingAmount} ج.م
                          </span>
                          <span className="text-[10px] text-slate-400 block">شهر: {item.cycleMonth}</span>
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={item.preferredMethod} />
                        </td>
                        <td className="py-4 px-4">
                          <StatusBadge status={item.status} />
                          {item.postponeCount > 0 && (
                            <span className="block text-[10px] text-amber-700 mt-1">
                              تأجيل {item.postponeCount} مرات
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4">
                          {item.latestFollowup ? (
                            <div>
                              <span className="font-bold text-slate-700 block">
                                {item.latestFollowup.outcome === 'promised_to_pay' ? 'وعد بالسداد' : item.latestFollowup.outcome}
                              </span>
                              <span className="text-[10px] text-slate-400 block">
                                {item.latestFollowup.notes || 'لا توجد ملاحظات'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-400 text-[11px]">لم يتم التواصل بعد</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            {/* Quick Collect */}
                            <button
                              onClick={() => setVoucherItem(item)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              title="تسجيل تحصيل وإصدار سند قبض"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>تحصيل</span>
                            </button>

                            {/* WhatsApp Follow-up */}
                            {item.followupWhatsAppUrl && (
                              <a
                                href={item.followupWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="إرسال رسالة متابعة بالواتساب"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}

                            {/* Phone Call */}
                            <a
                              href={`tel:${item.phone}`}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              title="اتصال هاتفي مباشر"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            {/* Log Followup */}
                            <button
                              onClick={() => {
                                setSelectedItemForLog(item);
                                setFollowupNotes('');
                              }}
                              className="p-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg transition-colors text-[10px] font-bold"
                              title="تسجيل نتيجة المكالمة / المتابعة"
                            >
                              توثيق
                            </button>

                            {/* Postpone */}
                            <button
                              onClick={() => {
                                setPostponeItem(item);
                                setPostponeNotes('');
                              }}
                              className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg transition-colors"
                              title="تأجيل موعد التحصيل"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log Followup Modal */}
          {selectedItemForLog && (
            <Modal
              isOpen={!!selectedItemForLog}
              onClose={() => setSelectedItemForLog(null)}
              title={`تسجيل متابعة مع المتبرع: ${selectedItemForLog.donorName}`}
              maxWidth="md"
            >
              <form onSubmit={handleLogFollowup} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع وسيلة التواصل *</label>
                  <select
                    value={contactType}
                    onChange={(e) => setContactType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                  >
                    <option value="phone_call">مكالمة هاتفية</option>
                    <option value="whatsapp">محادثة واتساب</option>
                    <option value="field_visit">زيارة ميدانية للمندوب</option>
                    <option value="sms">رسالة SMS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">نتيجة التواصل والرد *</label>
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold text-slate-800"
                  >
                    <option value="promised_to_pay">وعد بالسداد خلال أيام</option>
                    <option value="postponed">طلب تأجيل الموعد</option>
                    <option value="skipped">طلب تخطي هذا الشهر لظروف خاصة</option>
                    <option value="contacted_ok">تم التواصل بنجاح والتنسيق</option>
                    <option value="unreachable">لم يرد / الهاتف مغلق</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">ملاحظات المكالمة والتفاصيل</label>
                  <textarea
                    rows={3}
                    value={followupNotes}
                    onChange={(e) => setFollowupNotes(e.target.value)}
                    placeholder="أفاد المتبرع بأنه سيتواجد بالمنزل يوم الخميس بعد الساعة 6 مساءً لاستقبال المندوب..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم الموظف أو المندوب القائم بالتواصل</label>
                  <input
                    type="text"
                    value={contactedBy}
                    onChange={(e) => setContactedBy(e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingLog}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                >
                  {submittingLog ? 'جاري الحفظ...' : 'حفظ المتابعة في سجل المتبرع'}
                </button>
              </form>
            </Modal>
          )}

          {/* Postpone Modal */}
          {postponeItem && (
            <Modal
              isOpen={!!postponeItem}
              onClose={() => setPostponeItem(null)}
              title={`تأجيل موعد تحصيل: ${postponeItem.donorName}`}
              maxWidth="md"
            >
              <form onSubmit={handlePostpone} className="space-y-4 text-xs">
                <p className="text-slate-600">
                  سيتم زيادة عداد التأجيلات وتمديد المهلة مع توثيق الملاحظة:
                </p>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">سبب التأجيل أو التاريخ الجديد</label>
                  <input
                    type="text"
                    required
                    value={postponeNotes}
                    onChange={(e) => setPostponeNotes(e.target.value)}
                    placeholder="المتبرع مسافر ويعود الأسبوع القادم..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submittingPostpone}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all mt-2"
                >
                  {submittingPostpone ? 'جاري التأجيل...' : 'تأكيد التأجيل'}
                </button>
              </form>
            </Modal>
          )}

          {/* Quick Collect Modal */}
          {voucherItem && (
            <ReceiptVoucherModal
              isOpen={!!voucherItem}
              onClose={() => setVoucherItem(null)}
              donorId={voucherItem.donorId}
              cycleId={voucherItem.id}
              donorName={voucherItem.donorName}
              donorCode={voucherItem.donorCode}
              donorPhone={voucherItem.phone}
              suggestedAmount={voucherItem.remainingAmount}
              campaignId={voucherItem.campaignId}
              onSuccess={() => fetchOverdueList()}
            />
          )}
        </main>
      </div>
    </div>
  );
}
