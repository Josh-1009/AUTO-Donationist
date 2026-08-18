'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface WhatsAppButtonProps {
  phone: string;
  donorName?: string;
  donorCode?: string;
  campaignTitle?: string;
  targetAmount?: number;
  customText?: string;
  directUrl?: string;
  variant?: 'primary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export function WhatsAppButton({
  phone,
  donorName,
  donorCode,
  campaignTitle,
  targetAmount,
  customText,
  directUrl,
  variant = 'primary',
  size = 'md',
  className = '',
  label = 'فتح محادثة واتساب لتجديد النية',
}: WhatsAppButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    let targetUrl = directUrl;

    if (!targetUrl) {
      let cleanedPhone = phone.replace(/\D/g, '');
      if (cleanedPhone.startsWith('01') && cleanedPhone.length === 11) {
        cleanedPhone = '20' + cleanedPhone.substring(1);
      } else if (cleanedPhone.startsWith('1') && cleanedPhone.length === 10) {
        cleanedPhone = '20' + cleanedPhone;
      }

      let message = customText;
      if (!message) {
        message =
          `السلام عليكم ورحمة الله وبركاته، الأخ/الأخت ${donorName || ''} 🌸\n` +
          `نود تذكيركم بمساهمتكم الكريمة في حملة: *${campaignTitle || 'الحملة الخيرية'}* بمبلغ *${targetAmount || 0} ج.م*.\n` +
          `«وما تنفقوا من شيء فإن الله يخلفه وهو خير الرازقين» 🤍\n` +
          `كود المتبرع: *${donorCode || ''}*\n` +
          `نسأل الله أن يبارك فيكم وفي أهليكم ويتقبل منكم صالح الأعمال 🤲`;
      }

      targetUrl = `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(message)}`;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-6 py-3 gap-2.5 font-semibold',
  }[size];

  const variantClasses = {
    primary: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20',
    outline: 'border border-emerald-600 text-emerald-700 hover:bg-emerald-50',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
  }[variant];

  return (
    <button
      onClick={handleClick}
      type="button"
      className={`inline-flex items-center justify-center font-medium rounded-xl transition-all active:scale-95 ${sizeClasses} ${variantClasses} ${className}`}
    >
      <MessageCircle className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
