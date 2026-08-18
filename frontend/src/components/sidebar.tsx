'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FileText,
  PhoneCall,
  FolderHeart,
  FileSpreadsheet,
  Building,
  HeartHandshake,
} from 'lucide-react';
import { apiGet } from '../lib/api-client';
import { ENDPOINTS } from '../lib/endpoints';
import { DashboardStats } from '../lib/types';

export function Sidebar() {
  const pathname = usePathname();
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const res = await apiGet<DashboardStats>(ENDPOINTS.ADMIN_DASHBOARD);
    if (res.success && res.data) {
      setStats(res.data);
    }
  };

  const navItems = [
    {
      name: 'لوحة المؤشرات والتحصيل',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'دليل وسجل المتبرعين',
      href: '/admin/donors',
      icon: Users,
      badge: stats?.kpis?.totalDonors,
    },
    {
      name: 'سندات القبض المعتمدة',
      href: '/admin/approvals',
      icon: FileText,
      badge: stats?.kpis?.totalVouchers,
    },
    {
      name: 'طابور المتابعة والمتأخرين',
      href: '/admin/overdue',
      icon: PhoneCall,
      badge: stats?.kpis?.overdueCount,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      name: 'المشاريع والكفالات',
      href: '/admin/campaigns',
      icon: FolderHeart,
      badge: stats?.kpis?.activeCampaigns,
    },
    {
      name: 'التقارير وكشوفات المندوبين',
      href: '/admin/export',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <aside className="w-full md:w-64 bg-white border-l border-slate-200 p-4 shrink-0 flex flex-col justify-between no-print">
      <div className="space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          إدارة الجمعية والتحصيل
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>{item.name}</span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      item.badgeColor || 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 mt-6">
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
            جمعية
          </div>
          <div>
            <strong className="text-xs text-slate-800 block">نظام أوفلاين داخلي</strong>
            <span className="text-[10px] text-slate-400 block">تحصيل وسندات بدون بوابات دفع</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
