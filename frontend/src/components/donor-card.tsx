'use client';

import React from 'react';
import { User, Phone, GraduationCap, Building, Calendar, CheckCircle, Clock } from 'lucide-react';
import { Donor } from '../lib/types';
import { StatusBadge } from './ui/badge';
import { WhatsAppButton } from './whatsapp-btn';

interface DonorCardProps {
  donor: Donor;
  onSelect?: (donor: Donor) => void;
  showActions?: boolean;
}

export function DonorCard({ donor, onSelect, showActions = true }: DonorCardProps) {
  const activeCycle = donor.cycles && donor.cycles.length > 0 ? donor.cycles[0] : null;

  return (
    <div
      onClick={() => onSelect && onSelect(donor)}
      className={`glass-panel rounded-2xl p-6 transition-all duration-200 hover:shadow-lg hover:border-emerald-300 ${
        onSelect ? 'cursor-pointer hover:bg-emerald-50/20' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 border border-emerald-200 flex items-center justify-center text-emerald-700 font-bold text-lg shadow-sm">
            {donor.fullName.slice(0, 1)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-base">{donor.fullName}</h4>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200">
                {donor.donorCode}
              </span>
              <StatusBadge status={donor.status} />
            </div>
          </div>
        </div>

        {activeCycle && (
          <div className="text-left">
            <span className="text-xs text-slate-500 block">التزام الشهر الحالي</span>
            <span className="text-base font-extrabold text-emerald-600">
              {activeCycle.paidAmount}/{activeCycle.cycleExpectedAmount} ج.م
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span dir="ltr">{donor.phone || 'غير مسجل'}</span>
        </div>
        {donor.dept && (
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{donor.dept}</span>
          </div>
        )}
        {donor.academicYear && (
          <div className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{donor.academicYear}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>تاريخ التسجيل: {new Date(donor.createdAt).toLocaleDateString('ar-EG')}</span>
        </div>
      </div>

      {activeCycle && (
        <div className="mt-3 bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            {activeCycle.status === 'paid' ? (
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            ) : (
              <Clock className="w-4 h-4 text-amber-500" />
            )}
            <span className="font-medium text-slate-700">
              الحملة: {activeCycle.campaign?.title || 'عام'}
            </span>
          </div>
          <StatusBadge status={activeCycle.status} />
        </div>
      )}

      {showActions && donor.phone && (
        <div className="mt-4 flex items-center gap-2 pt-2">
          <WhatsAppButton
            phone={donor.phone}
            donorName={donor.fullName}
            donorCode={donor.donorCode}
            campaignTitle={activeCycle?.campaign?.title}
            targetAmount={activeCycle?.cycleExpectedAmount}
            size="sm"
            className="w-full"
          />
        </div>
      )}
    </div>
  );
}
