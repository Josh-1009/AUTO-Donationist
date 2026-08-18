'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Printer,
  MessageCircle,
  CheckCircle,
  X,
  Building,
  User,
  DollarSign,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { apiPost, apiGet } from '../lib/api-client';
import { ENDPOINTS } from '../lib/endpoints';
import { Donor, Campaign, ReceiptVoucher } from '../lib/types';
import { Modal } from './ui/modal';

interface ReceiptVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  donorId?: string;
  cycleId?: string;
  donorName?: string;
  donorCode?: string;
  donorPhone?: string;
  suggestedAmount?: number;
  campaignId?: string;
  onSuccess?: () => void;
}

export function ReceiptVoucherModal({
  isOpen,
  onClose,
  donorId,
  cycleId,
  donorName,
  donorCode,
  donorPhone,
  suggestedAmount = 500,
  campaignId,
  onSuccess,
}: ReceiptVoucherModalProps) {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(false);

  // Form State
  const [selectedDonorId, setSelectedDonorId] = useState(donorId || '');
  const [selectedCampaignId, setSelectedCampaignId] = useState(campaignId || '');
  const [amount, setAmount] = useState<number>(suggestedAmount);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [collectorName, setCollectorName] = useState('أمين الصندوق بالمقر');
  const [receivedBy, setReceivedBy] = useState('أمين الصندوق');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result Voucher State (for immediate printing & WhatsApp)
  const [createdVoucher, setCreatedVoucher] = useState<ReceiptVoucher | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCreatedVoucher(null);
      setErrorMsg('');
      setSelectedDonorId(donorId || '');
      setSelectedCampaignId(campaignId || '');
      setAmount(suggestedAmount);
      fetchInitialData();
    }
  }, [isOpen, donorId, campaignId, suggestedAmount]);

  const fetchInitialData = async () => {
    setLoadingInitial(true);
    const [resDonors, resCampaigns] = await Promise.all([
      apiGet<Donor[]>(ENDPOINTS.DONORS_LIST),
      apiGet<Campaign[]>(ENDPOINTS.CAMPAIGNS_LIST),
    ]);
    setLoadingInitial(false);

    if (resDonors.success && resDonors.data) setDonors(resDonors.data);
    if (resCampaigns.success && resCampaigns.data) {
      setCampaigns(resCampaigns.data);
      if (!selectedCampaignId && resCampaigns.data.length > 0) {
        setSelectedCampaignId(resCampaigns.data[0].id);
      }
    }
  };

  const handleCreateVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDonorId || !selectedCampaignId || amount <= 0) {
      setErrorMsg('يرجى التأكد من اختيار المتبرع والمشروع والمبلغ');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    const res = await apiPost<ReceiptVoucher>(ENDPOINTS.VOUCHERS_LIST, {
      donorId: selectedDonorId,
      campaignId: selectedCampaignId,
      cycleId: cycleId || undefined,
      amount,
      paymentMethod,
      collectorName: paymentMethod === 'collector' ? collectorName : undefined,
      receivedBy,
      notes,
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setCreatedVoucher(res.data);
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg(res.message || 'فشل إصدار سند القبض');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={createdVoucher ? 'سند قبض رسمي معتمد' : 'تسجيل تحصيل وإصدار سند قبض نقدي 🧾'}
      maxWidth="lg"
    >
      {createdVoucher ? (
        /* Printable Official Voucher View */
        <div className="space-y-5 animate-in fade-in">
          {/* Top Success Banner */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs font-bold text-emerald-900 flex items-center justify-between no-print">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>تم تسجيل التحصيل وإصدار السند برقم: <strong>{createdVoucher.voucherNumber}</strong></span>
            </div>
            <span className="font-mono text-xs">{createdVoucher.voucherNumber}</span>
          </div>

          {/* Printable Official Voucher Card */}
          <div
            id="printable-voucher"
            className="bg-white border-2 border-slate-800 rounded-2xl p-6 text-slate-900 shadow-sm relative space-y-4 print:border-black print:p-8"
          >
            {/* Header */}
            <div className="border-b-2 border-slate-800 pb-4 text-center">
              <div className="flex justify-between items-start">
                <div className="text-right">
                  <h3 className="font-black text-sm text-slate-900">الجمعية الخيرية لرعاية الأيتام</h3>
                  <span className="text-[11px] text-slate-500 block">إشهار رقم: 1234 لسنة 2015</span>
                  <span className="text-[11px] text-slate-500 block">الحسابات والتحصيل الداخلي</span>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl border border-emerald-300 flex items-center justify-center font-black text-emerald-800 text-lg mx-auto mb-1">
                    خير
                  </div>
                  <h2 className="font-black text-base text-slate-900">سند قبض نقدي</h2>
                  <span className="font-mono font-bold text-xs bg-slate-100 px-2 py-0.5 rounded border border-slate-300 inline-block mt-0.5">
                    {createdVoucher.voucherNumber}
                  </span>
                </div>
                <div className="text-left text-xs font-mono">
                  <span>التاريخ: {new Date(createdVoucher.receiptDate).toLocaleDateString('ar-EG')}</span>
                  <span className="block text-slate-400 text-[10px]">الوقت: {new Date().toLocaleTimeString('ar-EG')}</span>
                </div>
              </div>
            </div>

            {/* Voucher Body */}
            <div className="space-y-3 text-xs leading-relaxed">
              <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span>استلمنا من الأستاذ / الفاضل:</span>
                <strong className="text-sm font-bold text-slate-900">
                  {createdVoucher.donor?.fullName || donorName} ({createdVoucher.donor?.donorCode || donorCode})
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">مبلغ وقدره:</span>
                  <strong className="text-base font-black text-emerald-700">{createdVoucher.amount} ج.م</strong>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">طريقة السداد:</span>
                  <strong className="text-xs font-bold text-slate-800 uppercase">{createdVoucher.paymentMethod}</strong>
                </div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">فقط وقدره كتابة:</span>
                <strong className="font-bold text-slate-800 text-xs">
                  {createdVoucher.amountInWords || 'فقط المبلغ المذكور لا غير'}
                </strong>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">وذلك تبرعاً ومساهمة في:</span>
                <strong className="font-bold text-slate-900 text-xs">
                  {createdVoucher.campaign?.title || 'حملة الصدقة الدورية'}
                </strong>
              </div>

              {createdVoucher.notes && (
                <div className="p-2 rounded-lg bg-slate-50 text-[11px] text-slate-600 border">
                  ملاحظات: {createdVoucher.notes}
                </div>
              )}
            </div>

            {/* Footer Signatures */}
            <div className="pt-6 border-t-2 border-slate-800 grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <span className="text-slate-500 block text-[11px]">المحصل / المندوب</span>
                <strong className="mt-1 block">{createdVoucher.collectorName || '—'}</strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">أمين الصندوق المستلم</span>
                <strong className="mt-1 block">{createdVoucher.receivedBy}</strong>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">ختم الجمعية</span>
                <div className="w-16 h-8 border border-dashed border-slate-400 rounded mx-auto mt-1 flex items-center justify-center text-[10px] text-slate-400">
                  ختم معتمد
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons (Excluded from Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 no-print">
            <button
              onClick={handlePrint}
              className="py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-900/20"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>طباعة سند القبض (Print)</span>
            </button>

            {createdVoucher.thankYouWhatsAppUrl && (
              <a
                href={createdVoucher.thankYouWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <MessageCircle className="w-4 h-4" />
                <span>إرسال إشعار وشكر عبر واتساب</span>
              </a>
            )}
          </div>
        </div>
      ) : (
        /* Voucher Entry Form */
        <form onSubmit={handleCreateVoucher} className="space-y-4 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-bold">
              {errorMsg}
            </div>
          )}

          {/* Donor Selection */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">المتبرع المسجل *</label>
            {donorId ? (
              <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                <div>
                  <strong className="text-slate-900 block text-xs">{donorName}</strong>
                  <span className="font-mono text-[11px] text-slate-500">{donorCode} | {donorPhone}</span>
                </div>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-mono font-bold text-[10px]">
                  محدد
                </span>
              </div>
            ) : (
              <select
                required
                value={selectedDonorId}
                onChange={(e) => setSelectedDonorId(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl bg-white font-medium text-xs"
              >
                <option value="">-- اختر المتبرع من الدليل --</option>
                {donors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.fullName} ({d.donorCode}) - {d.phone}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Campaign Selection & Amount */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">الحملة / المشروع الخيري *</label>
              <select
                required
                value={selectedCampaignId}
                onChange={(e) => setSelectedCampaignId(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl bg-white font-medium text-xs"
              >
                {campaigns.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} ({c.donationType === 'recurring' ? 'شهري' : 'مرة واحدة'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">المبلغ المحصل (ج.م) *</label>
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2.5 border rounded-xl font-bold text-emerald-700 text-base"
              />
            </div>
          </div>

          {/* Payment Method & Collector Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">طريقة التحصيل *</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2.5 border rounded-xl bg-white font-bold text-xs"
              >
                <option value="cash">نقدي بالمقر (Cash Office)</option>
                <option value="collector">تحصيل مندوب ميداني (Collector)</option>
                <option value="instapay">تحويل إنستاباي يدوي (Instapay)</option>
                <option value="vodafone_cash">فودافون كاش (Vodafone Cash)</option>
                <option value="bank_transfer">إيداع / تحويل بنكي</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">اسم المندوب أو المحصل</label>
              <input
                type="text"
                value={collectorName}
                onChange={(e) => setCollectorName(e.target.value)}
                placeholder="أ / مصطفى حسن..."
                className="w-full px-3 py-2.5 border rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">ملاحظات التحصيل (اختياري)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="سداد قسط شهر أغسطس كفالة أيتام..."
              className="w-full px-3 py-2 border rounded-xl text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 mt-4"
          >
            <FileText className="w-4 h-4" />
            <span>{submitting ? 'جاري الإصدار...' : `تأكيد التحصيل وإصدار سند قبض بمبلغ ${amount} ج.م`}</span>
          </button>
        </form>
      )}
    </Modal>
  );
}
