'use client';

import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface CollectionsChartProps {
  data: { month: string; target: number; collected: number }[];
}

export function CollectionsChart({ data }: CollectionsChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">لا توجد بيانات متاحة</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
            </linearGradient>
            <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#64748b" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#64748b" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              direction: 'rtl',
              fontSize: '12px',
            }}
            formatter={(value: any, name: string) => [
              `${value.toLocaleString()} ج.م`,
              name === 'collected' ? 'المحصل الفعلي' : 'المستهدف',
            ]}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#94a3b8"
            strokeWidth={2}
            strokeDasharray="4 4"
            fillOpacity={1}
            fill="url(#colorTarget)"
          />
          <Area
            type="monotone"
            dataKey="collected"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorCollected)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
