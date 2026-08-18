'use client';

import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from 'recharts';

interface PaymentMethodsChartProps {
  data: { name: string; count: number; total: number }[];
}

const COLORS = ['#10b981', '#6366f1', '#f59e0b', '#06b6d4'];

export function PaymentMethodsChart({ data }: PaymentMethodsChartProps) {
  if (!data || data.length === 0) {
    return <div className="h-64 flex items-center justify-center text-slate-400">لا توجد بيانات متاحة</div>;
  }

  const formattedData = data.map((item) => ({
    name: item.name,
    value: item.total,
    count: item.count,
  }));

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formattedData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
          >
            {formattedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              borderRadius: '12px',
              border: 'none',
              color: '#fff',
              direction: 'rtl',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${Number(value).toLocaleString()} ج.م`, 'إجمالي التحصيل']}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => <span className="text-xs text-slate-600 font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
