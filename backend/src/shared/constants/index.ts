export const DONOR_STATUS = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  CANCELLED: 'cancelled',
} as const;

export const CYCLE_STATUS = {
  PENDING: 'pending',
  PARTIALLY_PAID: 'partially_paid',
  PAID: 'paid',
  POSTPONED: 'postponed',
  SKIPPED: 'skipped',
  NEEDS_FOLLOWUP: 'needs_followup',
} as const;

export const DONATION_TYPE = {
  RECURRING: 'recurring',
  ONE_TIME: 'one_time',
} as const;

export const PAYMENT_METHOD = {
  CASH: 'cash',
  COLLECTOR: 'collector',
  INSTAPAY: 'instapay',
  VODAFONE_CASH: 'vodafone_cash',
  BANK_TRANSFER: 'bank_transfer',
} as const;

export const CONTACT_TYPE = {
  WHATSAPP: 'whatsapp',
  PHONE_CALL: 'phone_call',
  FIELD_VISIT: 'field_visit',
  SMS: 'sms',
} as const;

export const CONTACT_OUTCOME = {
  PROMISED_TO_PAY: 'promised_to_pay',
  POSTPONED: 'postponed',
  SKIPPED: 'skipped',
  UNREACHABLE: 'unreachable',
  CONTACTED_OK: 'contacted_ok',
} as const;

export const STAFF_ROLE = {
  ADMIN: 'admin',
  TREASURER: 'treasurer',
  COLLECTOR: 'collector',
  STAFF: 'staff',
} as const;

export const MAX_POSTPONE_DAYS = 5;
export const MAX_SKIP_MONTHS = 6;
