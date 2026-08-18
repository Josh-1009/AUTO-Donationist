export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export const ENDPOINTS = {
  // Health
  HEALTH: '/health',

  // Donors
  DONORS_LIST: '/donors',
  DONOR_BY_ID: (id: string) => `/donors/${id}`,

  // Campaigns
  CAMPAIGNS_LIST: '/campaigns',
  CAMPAIGN_BY_ID: (id: string) => `/campaigns/${id}`,

  // Cycles
  CYCLES_POSTPONE: '/cycles/postpone',
  CYCLES_SKIP: '/cycles/skip',
  CYCLES_GENERATE_MONTHLY: '/cycles/generate-monthly',
  CYCLES_OVERDUE: '/cycles/overdue',
  CYCLE_BY_ID: (id: string) => `/cycles/${id}`,

  // Receipt Vouchers
  VOUCHERS_LIST: '/vouchers',
  VOUCHER_BY_ID: (id: string) => `/vouchers/${id}`,

  // Followups
  FOLLOWUPS_LIST: '/followups',

  // Analytics & Export
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_EXPORT: '/admin/export',
  ADMIN_ESCALATIONS: '/cycles/overdue',
};
