'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, User, Heart } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('admin');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('donation_admin_user', JSON.stringify({ username, role: 'admin' }));
    router.push('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl text-slate-100 relative">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 fill-emerald-500/30" />
          </div>
          <h1 className="text-2xl font-extrabold text-white">دخول موظفي الجمعية</h1>
          <p className="text-xs text-slate-400 mt-1">
            نظام التحصيل المكتبي والميداني وسندات القبض (Offline Charity ERP)
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              اسم المستخدم أو الكادر الوظيفي
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                className="w-full pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-emerald-500"
              />
              <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm mt-4 flex items-center justify-center gap-2"
          >
            دخول لوحة التحكم
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 space-y-2">
          <p className="text-xs text-slate-400 text-center mb-2">تسجيل الدخول السريع:</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                localStorage.setItem('donation_admin_user', JSON.stringify({ username: 'treasurer', role: 'treasurer' }));
                router.push('/admin/dashboard');
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 text-center font-bold border border-slate-700"
            >
              أمين الصندوق
            </button>
            <button
              onClick={() => {
                localStorage.setItem('donation_admin_user', JSON.stringify({ username: 'collector', role: 'collector' }));
                router.push('/admin/dashboard');
              }}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs text-slate-300 text-center font-bold border border-slate-700"
            >
              المندوب الميداني
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
