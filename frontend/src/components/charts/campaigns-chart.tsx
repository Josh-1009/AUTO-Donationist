'use client';

import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface CampaignsChartProps {
  data: { name: string; target: number; collected: number; percentage: number }[];
}

export function CampaignsChart({ data }: CampaignsChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">لا توجد بيانات متاحة</div>;
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#64748b', fontSize: 11 }}
            interval={0}
          />
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
              name === 'collected' ? 'المحصل' : 'المستهدف',
            ]}
          />
          <Bar dataKey="target" fill="#cbd5e1" radius={[6, 6, 0, 0]} name="target" />
          <Bar dataKey="collected" fill="#059669" radius={[6, 6, 0, 0]} name="collected" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
