export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export interface Donor {
  id: string;
  donorCode: string;
  fullName: string;
  phone: string;
  phoneSecondary?: string | null;
  address?: string | null;
  dept?: string | null;
  academicYear?: string | null;
  status: 'active' | 'paused' | 'cancelled';
  committedAmount: number;
  preferredMethod: 'cash_office' | 'collector_visit' | 'instapay_manual' | 'vodafone_cash' | 'bank_transfer';
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  reminderWhatsAppUrl?: string;
  cycles?: DonationCycle[];
  vouchers?: ReceiptVoucher[];
  followups?: FollowupLog[];
  _count?: {
    cycles: number;
    vouchers: number;
    followups: number;
  };
}

export interface Campaign {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  campaignTotalTarget: number;
  currentAmount: number;
  donationType: 'recurring' | 'one_time';
  whatsappTemplate?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    cycles: number;
    vouchers: number;
  };
}

export interface DonationCycle {
  id: string;
  donorId: string;
  campaignId: string;
  cycleMonth: string;
  cycleExpectedAmount: number;
  paidAmount: number;
  status: 'pending' | 'partially_paid' | 'paid' | 'postponed' | 'skipped' | 'needs_followup';
  postponeCount: number;
  postponedUntil?: string | null;
  skipCount: number;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  donor?: Donor;
  campaign?: Campaign;
  vouchers?: ReceiptVoucher[];
  followups?: FollowupLog[];
}

export interface ReceiptVoucher {
  id: string;
  voucherNumber: string;
  cycleId?: string | null;
  donorId: string;
  campaignId: string;
  amount: number;
  amountInWords?: string;
  paymentMethod: string;
  collectorName?: string | null;
  receivedBy: string;
  receiptDate: string;
  notes?: string | null;
  thankYouWhatsAppUrl?: string;
  createdAt: string;
  updatedAt: string;
  donor?: Donor;
  campaign?: Campaign;
  cycle?: DonationCycle;
}

export interface FollowupLog {
  id: string;
  donorId: string;
  cycleId?: string | null;
  contactType: 'whatsapp' | 'phone_call' | 'field_visit' | 'sms';
  outcome: 'promised_to_pay' | 'postponed' | 'skipped' | 'unreachable' | 'contacted_ok';
  notes?: string | null;
  contactedBy: string;
  contactedAt: string;
  donor?: Donor;
  cycle?: DonationCycle;
}

export interface DashboardStats {
  kpis: {
    totalCollected: number;
    totalDonors: number;
    activeCampaigns: number;
    totalVouchers: number;
    overdueCount: number;
  };
  paymentMethodsBreakdown: { name: string; count: number; total: number }[];
  monthlyTrends: { month: string; target: number; collected: number }[];
  campaignsBreakdown: {
    name: string;
    type: string;
    target: number;
    collected: number;
    percentage: number;
  }[];
  recentVouchers: ReceiptVoucher[];
}

export interface OverdueFollowupItem {
  id: string;
  donorId: string;
  donorCode: string;
  donorName: string;
  phone: string;
  phoneSecondary?: string | null;
  address: string;
  dept: string;
  preferredMethod: string;
  campaignId: string;
  campaignTitle: string;
  cycleMonth: string;
  cycleExpectedAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: string;
  postponeCount: number;
  skipCount: number;
  postponedUntil?: string | null;
  notes?: string | null;
  latestFollowup?: FollowupLog | null;
  followupWhatsAppUrl: string;
}
