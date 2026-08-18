'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  CheckCircle,
  Users,
  Printer,
  FileCheck,
  PhoneCall,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Navbar } from '../../../../components/navbar';
import { Sidebar } from '../../../../components/sidebar';
import { apiGet } from '../../../../lib/api-client';
import { ENDPOINTS } from '../../../../lib/endpoints';

export default function AdminExportPage() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  const handleExport = async (type: 'vouchers' | 'donors' | 'overdue', format: 'excel' | 'csv' | 'print') => {
    setDownloading(`${type}-${format}`);
    setExportSuccess(null);

    try {
      const res = await apiGet<any>(`${ENDPOINTS.ADMIN_EXPORT}?type=${type}`);
      if (res.success && res.data) {
        const rows = Array.isArray(res.data) ? res.data : (res.data.rows || []);

        if (rows.length === 0) {
          alert('لا توجد بيانات متاحة للتصدير حالياً');
          return;
        }

        if (format === 'print') {
          // Open printable view in new window
          const printWindow = window.open('', '_blank');
          if (printWindow) {
            const tableHeaders = Object.keys(rows[0] || {}).map((k) => `<th>${k}</th>`).join('');
            const tableRows = rows
              .map(
                (r: any) =>
                  `<tr>${Object.values(r)
                    .map((v) => `<td>${v}</td>`)
                    .join('')}</tr>`
              )
              .join('');

            printWindow.document.write(`
              <html dir="rtl">
                <head>
                  <title>تقرير ${type}</title>
                  <style>
                    body { font-family: sans-serif; padding: 20px; direction: rtl; }
                    h2 { text-align: center; color: #0f172a; }
                    p { text-align: center; color: #64748b; font-size: 12px; }
                    table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                    th, td { border: 1px solid #cbd5e1; padding: 8px 12px; font-size: 12px; text-align: right; }
                    th { background-color: #f1f5f9; font-weight: bold; }
                    tr:nth-child(even) { background-color: #f8fafc; }
                  </style>
                </head>
                <body>
                  <h2>الجمعية الخيرية لرعاية الأيتام - كشف ${type.toUpperCase()}</h2>
                  <p>تاريخ الاستخراج: ${new Date().toLocaleString('ar-EG')}</p>
                  <table>
                    <thead><tr>${tableHeaders}</tr></thead>
                    <tbody>${tableRows}</tbody>
                  </table>
                  <script>window.print();</script>
                </body>
              </html>
            `);
            printWindow.document.close();
          }
        } else {
          // Generate Excel / CSV with XLSX
          const worksheet = XLSX.utils.json_to_sheet(rows);
          const workbook = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

          const fileName = `Charity_Report_${type}_${new Date().toISOString().slice(0, 10)}.${
            format === 'excel' ? 'xlsx' : 'csv'
          }`;

          XLSX.writeFile(workbook, fileName);
          setExportSuccess(`تم استخراج ملف ${fileName} بنجاح!`);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDownloading(null);
    }
  };

  const reportCards = [
    {
      id: 'vouchers' as const,
      title: 'كشف سندات القبض والتحصيلات المالية',
      description: 'سجل كامل بكافة إيصالات التحصيل النقدية والميدانية مع أرقام السندات والمبالغ تفقيطاً وأسماء المستلمين.',
      icon: FileCheck,
      iconColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'donors' as const,
      title: 'دليل وسجل المتبرعين وعناوين المندوبين',
      description: 'كشف بجميع المتبرعين المسجلين مع الأكواد (DNR-XXX)، أرقام الهواتف، العناوين التفصيلية، والالتزامات.',
      icon: Users,
      iconColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'overdue' as const,
      title: 'كشف المتأخرين والمطلوب تحصيلهم هذا الشهر',
      description: 'قائمة بالمبالغ المتبقية وحالات التأجيل للتواصل معهم أو توجيه مندوب الجمعية لزيارتهم.',
      icon: PhoneCall,
      iconColor: 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Navbar />

      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar />

        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900">تصدير الكشوفات والتقارير المالية للجمعية</h1>
            <p className="text-xs text-slate-500 mt-1">
              استخراج التقارير بصيغ Excel (.xlsx) و CSV وكشوفات قابلة للطباعة المباشرة والأرشفة الورقية
            </p>
          </div>

          {exportSuccess && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>{exportSuccess}</span>
              </div>
              <button onClick={() => setExportSuccess(null)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reportCards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className={`w-12 h-12 rounded-2xl ${card.iconColor} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>

                    <h3 className="font-bold text-slate-900 text-base mb-2">{card.title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6">{card.description}</p>
                  </div>

                  <div className="space-y-2 pt-4 border-t border-slate-100">
                    <button
                      onClick={() => handleExport(card.id, 'excel')}
                      disabled={downloading === `${card.id}-excel`}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-sm"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloading === `${card.id}-excel` ? 'جاري التوليد...' : 'تصدير إكسيل (Excel .xlsx)'}</span>
                    </button>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleExport(card.id, 'csv')}
                        disabled={downloading === `${card.id}-csv`}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>ملف CSV</span>
                      </button>

                      <button
                        onClick={() => handleExport(card.id, 'print')}
                        disabled={downloading === `${card.id}-print`}
                        className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>طباعة مباشرة</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
