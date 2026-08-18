'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  FolderHeart,
  Plus,
  Edit2,
  Trash2,
  CheckCircle,
  MessageCircle,
  TrendingUp,
  Coins,
  Repeat,
} from 'lucide-react';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { apiGet, apiPost, apiPatch, apiDelete } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';
import { Campaign } from '../../../../lib/types';
import { Modal } from '../../../../components/ui/modal';

export default function AdminCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    campaignTotalTarget: 50000,
    donationType: 'recurring' as 'recurring' | 'one_time',
    whatsappTemplate: '',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const res = await apiGet<Campaign[]>(ENDPOINTS.CAMPAIGNS_LIST);
    setLoading(false);
    if (res.success && res.data) {
      setCampaigns(res.data);
    }
  };

  const handleOpenCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      description: '',
      campaignTotalTarget: 50000,
      donationType: 'recurring',
      whatsappTemplate: 'مساهمتكم الكريمة تصنع فارقاً في حياة المحتاجين 🤍',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Campaign) => {
    setEditingId(c.id);
    setForm({
      title: c.title,
      description: c.description || '',
      campaignTotalTarget: c.campaignTotalTarget,
      donationType: c.donationType,
      whatsappTemplate: c.whatsappTemplate || '',
      isActive: c.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (editingId) {
      await apiPatch(ENDPOINTS.CAMPAIGN_BY_ID(editingId), form);
    } else {
      await apiPost(ENDPOINTS.CAMPAIGNS_LIST, form);
    }

    setSubmitting(false);
    setIsModalOpen(false);
    fetchCampaigns();
  };

  const handleDelete = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الحملة؟')) {
      await apiDelete(ENDPOINTS.CAMPAIGN_BY_ID(id));
      fetchCampaigns();
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
              <h1 className="text-2xl font-black text-slate-900">إدارة الحملات الخيرية (v2)</h1>
              <p className="text-xs text-slate-500 mt-1">
                تحديد المستهدفات الكلية (campaign_total_target)، تصنيف الحملات (دورية أو لمرة واحدة)، وقوالب التذكير
              </p>
            </div>

            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-1.5 self-start"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة حملة جديدة</span>
            </button>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {loading ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                جاري تحميل الحملات...
              </div>
            ) : campaigns.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-400 text-xs">
                لا توجد حملات مسجلة
              </div>
            ) : (
              campaigns.map((camp) => {
                const progress =
                  camp.campaignTotalTarget > 0
                    ? Math.min(100, Math.round((camp.currentAmount / camp.campaignTotalTarget) * 100))
                    : 0;

                return (
                  <div
                    key={camp.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-[11px] text-slate-400">/{camp.slug}</span>
                        <div className="flex items-center gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              camp.donationType === 'recurring'
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {camp.donationType === 'recurring' ? 'دورية شهرية' : 'لمرة واحدة'}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              camp.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {camp.isActive ? 'نشطة' : 'متوقفة'}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-base mb-2">{camp.title}</h3>
                      <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                        {camp.description || 'لا يوجد وصف مخصص'}
                      </p>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden mb-2">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${progress}%` }}
                        />
                      </div>

                      <div className="flex justify-between text-xs text-slate-600 mb-3">
                        <span>المحصل: <strong className="text-slate-900">{camp.currentAmount.toLocaleString()} ج.م</strong></span>
                        <span>المستهدف: <strong className="text-slate-900">{camp.campaignTotalTarget.toLocaleString()} ج.م</strong></span>
                      </div>

                      {camp.whatsappTemplate && (
                        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-start gap-1.5 mb-4">
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{camp.whatsappTemplate}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                      <button
                        onClick={() => handleOpenEdit(camp)}
                        className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>تعديل</span>
                      </button>

                      <button
                        onClick={() => handleDelete(camp.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="حذف الحملة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Create/Edit Modal */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingId ? 'تعديل بيانات الحملة' : 'إنشاء حملة خيرية جديدة'}
          >
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم الحملة *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="كفالة أيتام التعليم"
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">نوع الحملة *</label>
                  <select
                    value={form.donationType}
                    onChange={(e) => setForm({ ...form, donationType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl font-bold bg-white"
                  >
                    <option value="recurring">دورية شهرية (Recurring)</option>
                    <option value="one_time">تبرع لمرة واحدة (One-Time)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المستهدف الكلي للحملة (ج.م) *</label>
                  <input
                    type="number"
                    required
                    value={form.campaignTotalTarget}
                    onChange={(e) =>
                      setForm({ ...form, campaignTotalTarget: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الوصف المختصر</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="وصف هدف الحملة والفئات المستفيدة..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  قالب نص رسالة الواتساب وتجديد النية
                </label>
                <textarea
                  rows={3}
                  value={form.whatsappTemplate}
                  onChange={(e) => setForm({ ...form, whatsappTemplate: e.target.value })}
                  placeholder="اكتب عبارات التذكير بفضل الحملة وتجديد النية..."
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <label htmlFor="isActive" className="font-bold text-slate-700 cursor-pointer">
                  الحملة نشطة وتستقبل التبرعات الآن
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-all mt-4"
              >
                {submitting ? 'جاري الحفظ...' : editingId ? 'تحديث الحملة' : 'إنشاء الحملة'}
              </button>
            </form>
          </Modal>
        </main>
      </div>
    </div>
  );
}
