'use client';

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  MapPin,
  Building,
  GraduationCap,
  Calendar,
  Eye,
  FileText,
  MessageCircle,
  Clock,
  CheckCircle,
  Coins,
} from 'lucide-react';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { Donor, Campaign } from '../../../../lib/types';
import { StatusBadge } from '../../../../components/ui/badge';
import { Modal } from '../../../../components/ui/modal';
import { ReceiptVoucherModal } from '../../../../components/receipt-voucher-modal';

export default function AdminDonorsPage() {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [methodFilter, setMethodFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected Donor for Detail View
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);

  // Voucher Modal State for Specific Donor
  const [voucherModalDonor, setVoucherModalDonor] = useState<Donor | null>(null);

  // New Donor Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newForm, setNewForm] = useState({
    fullName: '',
    phone: '',
    phoneSecondary: '',
    address: '',
    dept: '',
    academicYear: '',
    committedAmount: 500,
    preferredMethod: 'cash_office',
    campaignId: '',
    notes: '',
  });
  const [creating, setCreating] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDonors();
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    const res = await apiGet<Campaign[]>(ENDPOINTS.CAMPAIGNS_LIST);
    if (res.success && res.data) {
      const data = res.data;
      setCampaigns(data);
      if (data.length > 0) {
        setNewForm((prev) => ({ ...prev, campaignId: data[0].id }));
      }
    }
  };

  const fetchDonors = async () => {
    setLoading(true);
    const res = await apiGet<Donor[]>(ENDPOINTS.DONORS_LIST, {
      search: search || undefined,
      status: statusFilter || undefined,
      preferredMethod: methodFilter || undefined,
    });
    setLoading(false);
    if (res.success && res.data) {
      setDonors(res.data);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDonors();
  };

  const handleCreateDonor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newForm.fullName || !newForm.phone) {
      setErrorMsg('الاسم ورقم الهاتف حقول إجبارية');
      return;
    }

    setCreating(true);
    setErrorMsg('');

    const res = await apiPost<Donor>(ENDPOINTS.DONORS_LIST, newForm);
    setCreating(false);

    if (res.success) {
      setIsNewModalOpen(false);
      setNewForm({
        fullName: '',
        phone: '',
        phoneSecondary: '',
        address: '',
        dept: '',
        academicYear: '',
        committedAmount: 500,
        preferredMethod: 'cash_office',
        campaignId: campaigns[0]?.id || '',
        notes: '',
      });
      fetchDonors();
    } else {
      setErrorMsg(res.message || 'فشل تسجيل المتبرع');
    }
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
              <h1 className="text-2xl font-black text-slate-900">دليل وسجل المتبرعين (Donors CRM)</h1>
              <p className="text-xs text-slate-500 mt-1">
                إدارة بيانات المتبرعين، العناوين، أرقام الهواتف، تسجيل التحصيل، وأزرار التواصل المباشر
              </p>
            </div>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة متبرع جديد</span>
            </button>
          </div>

          {/* Search & Filters */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm mb-6 space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث بالاسم، الكود (DNR-XXX)، الهاتف، أو العنوان..."
                  className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>

              <select
                value={methodFilter}
                onChange={(e) => {
                  setMethodFilter(e.target.value);
                  setTimeout(fetchDonors, 0);
                }}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700"
              >
                <option value="">كل طرق التحصيل</option>
                <option value="cash_office">نقدي بالمقر</option>
                <option value="collector_visit">مندوب ميداني</option>
                <option value="instapay_manual">إنستاباي</option>
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

          {/* Donors Table */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="py-3.5 px-4">كود المتبرع</th>
                    <th className="py-3.5 px-4">الاسم الكامل</th>
                    <th className="py-3.5 px-4">رقم الهاتف</th>
                    <th className="py-3.5 px-4">العنوان والمقر</th>
                    <th className="py-3.5 px-4">الالتزام الشهري</th>
                    <th className="py-3.5 px-4">طريقة التحصيل</th>
                    <th className="py-3.5 px-4">الحالة</th>
                    <th className="py-3.5 px-4 text-center">أزرار الإجراءات السريعة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-8 text-slate-400">
                        جاري تحميل سجل المتبرعين...
                      </td>
                    </tr>
                  ) : donors.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-10 text-slate-400">
                        لا يوجد متبرعون يطابقون معايير البحث
                      </td>
                    </tr>
                  ) : (
                    donors.map((donor) => (
                      <tr key={donor.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                          {donor.donorCode}
                        </td>
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {donor.fullName}
                          {donor.dept && (
                            <span className="block text-[10px] font-normal text-slate-500">{donor.dept}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="text-slate-800 font-mono block" dir="ltr">{donor.phone}</span>
                          {donor.phoneSecondary && (
                            <span className="text-slate-400 font-mono text-[10px] block" dir="ltr">{donor.phoneSecondary}</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate" title={donor.address || ''}>
                          {donor.address ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{donor.address}</span>
                            </span>
                          ) : (
                            <span className="text-slate-400">غير مسجل</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                          {donor.committedAmount} ج.م
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={donor.preferredMethod} />
                        </td>
                        <td className="py-3.5 px-4">
                          <StatusBadge status={donor.status} />
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Quick Collect Button */}
                            <button
                              onClick={() => setVoucherModalDonor(donor)}
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-sm flex items-center gap-1"
                              title="تسجيل تحصيل وإصدار سند قبض فوري"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>تحصيل</span>
                            </button>

                            {/* WhatsApp Reminder Button */}
                            {donor.reminderWhatsAppUrl && (
                              <a
                                href={donor.reminderWhatsAppUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                                title="إرسال رسالة تذكير وتجديد النية بالواتساب"
                              >
                                <MessageCircle className="w-4 h-4" />
                              </a>
                            )}

                            {/* Direct Phone Call Button */}
                            <a
                              href={`tel:${donor.phone}`}
                              className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                              title="اتصال هاتفي مباشر"
                            >
                              <Phone className="w-4 h-4" />
                            </a>

                            {/* Full Profile View */}
                            <button
                              onClick={() => setSelectedDonor(donor)}
                              className="p-1.5 hover:bg-slate-100 text-slate-600 rounded-lg transition-colors"
                              title="عرض ملف المتبرع وسجل السندات"
                            >
                              <Eye className="w-4 h-4" />
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

          {/* Donor Detail Modal */}
          {selectedDonor && (
            <Modal
              isOpen={!!selectedDonor}
              onClose={() => setSelectedDonor(null)}
              title={`ملف المتبرع: ${selectedDonor.fullName}`}
              maxWidth="lg"
            >
              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100">
                  <div>
                    <span className="font-mono font-bold text-base text-emerald-800 block">
                      {selectedDonor.donorCode}
                    </span>
                    <strong className="text-slate-900 text-sm block">{selectedDonor.fullName}</strong>
                    <span className="text-slate-500 text-[11px] block">{selectedDonor.dept} - {selectedDonor.academicYear}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const d = selectedDonor;
                        setSelectedDonor(null);
                        setVoucherModalDonor(d);
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-sm"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>إصدار سند قبض</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <span className="text-slate-400 block text-[11px]">رقم الهاتف الأساسي:</span>
                    <strong dir="ltr" className="text-slate-800">{selectedDonor.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">العنوان المسجل:</span>
                    <strong className="text-slate-800">{selectedDonor.address || 'غير محدد'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">الالتزام الشهري:</span>
                    <strong className="text-emerald-700 text-sm">{selectedDonor.committedAmount} ج.م</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">طريقة التحصيل المفضلة:</span>
                    <StatusBadge status={selectedDonor.preferredMethod} />
                  </div>
                </div>

                {/* Vouchers History */}
                <h4 className="font-bold text-slate-800 mt-4">سندات القبض المسجلة للمتبرع:</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {!selectedDonor.vouchers || selectedDonor.vouchers.length === 0 ? (
                    <p className="text-slate-400 py-3 text-center">لا توجد سندات قبض سابقة</p>
                  ) : (
                    selectedDonor.vouchers.map((v) => (
                      <div key={v.id} className="p-3 border rounded-xl flex items-center justify-between bg-slate-50">
                        <div>
                          <strong className="font-mono text-emerald-800 block">{v.voucherNumber}</strong>
                          <span className="text-slate-500">
                            المبلغ: <strong>{v.amount} ج.م</strong> | التاريخ: {new Date(v.receiptDate).toLocaleDateString('ar-EG')}
                          </span>
                        </div>
                        <StatusBadge status={v.paymentMethod} />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* New Donor Modal */}
          <Modal
            isOpen={isNewModalOpen}
            onClose={() => setIsNewModalOpen(false)}
            title="تسجيل متبرع جديد في المنظومة"
          >
            <form onSubmit={handleCreateDonor} className="space-y-3 text-xs">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={newForm.fullName}
                  onChange={(e) => setNewForm({ ...newForm, fullName: e.target.value })}
                  placeholder="محمد أحمد إبراهيم"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">رقم الهاتف الأساسي *</label>
                  <input
                    type="tel"
                    required
                    value={newForm.phone}
                    onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                    placeholder="01012345678"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف إضافي / أرضي</label>
                  <input
                    type="tel"
                    value={newForm.phoneSecondary}
                    onChange={(e) => setNewForm({ ...newForm, phoneSecondary: e.target.value })}
                    placeholder="0223344556"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">العنوان بالتفصيل (لزيارات المندوب والمحصل)</label>
                <input
                  type="text"
                  value={newForm.address}
                  onChange={(e) => setNewForm({ ...newForm, address: e.target.value })}
                  placeholder="المعادي - شارع 9 - عمارة 12 الدور 4"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">القسم / الكلية / المنطقة</label>
                  <input
                    type="text"
                    value={newForm.dept}
                    onChange={(e) => setNewForm({ ...newForm, dept: e.target.value })}
                    placeholder="كلية الهندسة..."
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">الدفعة / الفرقة</label>
                  <input
                    type="text"
                    value={newForm.academicYear}
                    onChange={(e) => setNewForm({ ...newForm, academicYear: e.target.value })}
                    placeholder="دفعة 2018"
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الالتزام الشهري (ج.م) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newForm.committedAmount}
                    onChange={(e) => setNewForm({ ...newForm, committedAmount: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border rounded-xl font-bold text-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">طريقة التحصيل المفضلة</label>
                  <select
                    value={newForm.preferredMethod}
                    onChange={(e) => setNewForm({ ...newForm, preferredMethod: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white font-bold"
                  >
                    <option value="cash_office">نقدي بالمقر</option>
                    <option value="collector_visit">مندوب ميداني</option>
                    <option value="instapay_manual">إنستاباي</option>
                    <option value="vodafone_cash">فودافون كاش</option>
                    <option value="bank_transfer">تحويل بنكي</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">المشروع أو الحملة الخيرية</label>
                <select
                  value={newForm.campaignId}
                  onChange={(e) => setNewForm({ ...newForm, campaignId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  {campaigns.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات إضافية</label>
                <input
                  type="text"
                  value={newForm.notes}
                  onChange={(e) => setNewForm({ ...newForm, notes: e.target.value })}
                  placeholder="مواعيد التواجد، تفضيلات التواصل..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <button
                type="submit"
                disabled={creating}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all mt-4"
              >
                {creating ? 'جاري الحفظ والتسجيل...' : 'حفظ وتوليد كود DNR-XXX'}
              </button>
            </form>
          </Modal>

          {/* Quick Receipt Voucher Modal for specific donor */}
          {voucherModalDonor && (
            <ReceiptVoucherModal
              isOpen={!!voucherModalDonor}
              onClose={() => setVoucherModalDonor(null)}
              donorId={voucherModalDonor.id}
              donorName={voucherModalDonor.fullName}
              donorCode={voucherModalDonor.donorCode}
              donorPhone={voucherModalDonor.phone}
              suggestedAmount={voucherModalDonor.committedAmount}
              onSuccess={() => {
                fetchDonors();
              }}
            />
          )}
        </main>
      </div>
    </div>
  );
}
