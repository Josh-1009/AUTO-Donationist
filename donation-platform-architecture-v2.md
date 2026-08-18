# وثيقة العمارة التقنية وهيكل المشروع — نظام التبرعات (نسخة معدّلة v2)

> هذه النسخة تطبّق: تسجيل الدخول عبر Google فقط، وكل الإصلاحات المنطقية المتفق عليها على تصميم التبرع والداشبورد. النظام مصمم ليعمل **مجانًا بالكامل** باستخدام خدمات ذات Free Tier سخي.

---

## 1. نظرة عامة على العمارة (Architecture Overview)

نفس فلسفة API-First: الـ Backend مسؤول عن كل الـ Business Logic، والـ Frontend (Web + Mobile) عبارة عن Clients تستهلك الـ REST API فقط.

| الطبقة | التقنية | ملاحظات |
|---|---|---|
| Backend API | NestJS (Node.js) | Free tier على Render / Railway |
| Frontend Web | Next.js + Tailwind | مجاني بالكامل على Vercel |
| Mobile App | Flutter (Android/iOS) | نفس الـ API |
| Database | PostgreSQL (Supabase) | مجاني حتى 500MB |
| Auth | **Google OAuth فقط** (عبر Firebase Auth أو Google Identity مباشرة) | لا يوجد باسورد مخزّن نهائيًا |
| Payments | Paymob | العمولة فقط على المعاملة، لا تكلفة تشغيل |
| Notifications | Email (Gmail SMTP) | تذكيرات المتبرعين وتنبيهات الأدمن — WhatsApp API أُلغي |
| Jobs | node-cron | بديل مجاني لأي خدمة scheduling مدفوعة |

---

## 2. نظام الحسابات — Google Sign-In فقط

### 2.1 المبدأ
لا يوجد تسجيل يدوي ولا باسورد مخزّن إطلاقًا. كل دخول (متبرع أو أدمن) يمر عبر Google.

### 2.2 تدفق الدخول
1. المستخدم يضغط **"تسجيل الدخول بجوجل"**.
2. Google يرجّع: `email`, `full_name`, `google_id` (فريد), `profile_picture`.
3. الباك اند يتحقق من `google_id`:
   - **غير موجود** → إنشاء `donor` جديد تلقائيًا + توليد `donor_code` فريد.
   - **موجود** → دخول مباشر وإرجاع بيانات المتبرع.
4. الباك اند يصدر **JWT** خاص به (Stateless) يحتوي `donor_id` و `role`، ويُخزَّن في httpOnly cookie (ويب) أو secure storage (موبايل عبر `google_sign_in` package).

### 2.3 الأدوار (Roles)
- بدل حقل `role` وحيد داخل جدول `donors`، يُفضَّل جدول مستقل صغير:

```
admins
├── id
├── email (unique)
├── google_id (unique)
├── permissions        -- ENUM: full / approvals_only / reports_only
└── added_at
```

هذا أأمن: منح صلاحية أدمن = إضافة صف، وليس تعديل حقل داخل جدول المتبرعين.

### 2.4 حالة الحسابات القديمة (لو فيه بيانات مسبقة بأرقام تليفون)
- `POST /api/v1/donors/link-legacy` — endpoint اختياري لمرة واحدة: يتحقق من رقم تليفون/donor_code قديم، ويربطه بحساب Google الجديد بعد أول تسجيل دخول. غير ذلك، endpoint الـ `lookup` القديم بالتليفون **يُلغى نهائيًا**.

---

## 3. إصلاحات منطق التبرع (Business Logic Fixes)

### 3.1 توليد الدورات الشهرية تلقائيًا
المشكلة: لم يوجد أي آلية واضحة لإنشاء `donation_cycles` الشهرية.
**الحل:** Cron Job شهري (أول يوم في الشهر، 12:00 AM):
```
FOR EACH donor WHERE status = 'active':
  CREATE donation_cycle:
    cycle_month = current_month
    target_amount = donor's committed monthly amount
    status = 'pending'
```

### 3.2 التفريق بين Postpone و Skip
| | Postpone (تأجيل) | Skip (تخطي) |
|---|---|---|
| المعنى | نفس الدورة تتحرك لتاريخ لاحق | الدورة الحالية تُلغى نهائيًا هذا الشهر |
| الأثر على العداد | `postpone_count += 1` | لا يؤثر على postpone_count، لكن يُسجَّل `skip_count` منفصل |
| الحالة الناتجة | `status = 'postponed'`, `postponed_until` يُحدَّث | `status = 'skipped'` نهائيًا لهذا الشهر |
| القيد | يُمنع بعد 5 تأجيلات متتالية (escalation) | يُسمح بحد أقصى **6 أشهر متتالية**؛ بعدها الدورة تدخل تلقائيًا في `cycle_failed` |

### 3.3 الدفع الجزئي (Partial Payment)
تضاف حالة جديدة للدورة:
- `status = 'partially_paid'` عندما `SUM(transactions.amount) < cycle.target_amount`
- الدورة تبقى مفتوحة حتى اكتمال المبلغ أو نهاية الشهر (عندها تتحول لـ `overdue`)
- الداشبورد يعرض `paid_amount` بجانب `target_amount` بشكل صريح

### 3.4 approval_status — تصحيح المنطق
- معاملات **Paymob الناجحة** (عبر Webhook مؤكَّد) → `approval_status = 'approved'` تلقائيًا، **بدون** تدخل أدمن.
- **الموافقة اليدوية تقتصر فقط** على `manual_receipts` (الإيصالات المرفوعة يدويًا).
- إضافة عمود `verification_source` في `transactions`: `paymob_auto` / `manual_review` — لتوضيح مصدر الموافقة في التقارير.

### 3.5 توحيد تسمية target_amount (حل التضارب)
| الاسم القديم | الاسم الجديد | المعنى |
|---|---|---|
| `campaigns.target_amount` | `campaign_total_target` | المبلغ الإجمالي المطلوب للحملة كاملة |
| `donation_cycles.target_amount` | `cycle_expected_amount` | المبلغ المتوقع من المتبرع الواحد في الدورة الشهرية |

### 3.6 الحالة النهائية للدورات المتعثرة
بعد الوصول لـ escalation (5 تأجيلات متتالية، أو 6 أشهر skip متتالية):
```
donation_cycles.status → 'failed'   -- بدلاً من البقاء معلّقة للأبد
```
يُنشأ تلقائيًا سجل في `admin_alerts` بنوع `cycle_failed`. **الإجراء المطلوب من الأدمن هو تواصل يدوي مباشر** (رسالة/مكالمة) مع المتبرع لمعرفة السبب — وليس أي إعادة تفعيل تلقائية للنظام.

---

## 4. مخطط قاعدة البيانات المعدّل (Database Schema)

```
donors
├── id
├── google_id (unique)          -- بديل password
├── email (unique)
├── donor_code (unique)
├── full_name
├── phone
├── status                      -- active / paused / cancelled
└── academic_year

admins
├── id
├── google_id (unique)
├── email (unique)
├── permissions
└── added_at

campaigns
├── id
├── slug
├── title
├── description
├── campaign_total_target       -- (بعد التصحيح)
└── donation_type                -- recurring / one_time (جديد)

one_time_donations               -- (جديد) لتبرعات الحملات ذات المرة الواحدة
├── id
├── campaign_id
├── donor_id
├── amount
├── payment_method
├── approval_status
└── created_at

donation_cycles                  -- تُنشأ فقط لو campaigns.donation_type = 'recurring'
├── id
├── donor_id
├── campaign_id
├── cycle_month
├── cycle_expected_amount       -- (بعد التصحيح)
├── paid_amount                 -- مجموع محدَّث تلقائيًا
├── status                      -- pending / partially_paid / paid / postponed / skipped / overdue / failed
├── postpone_count
├── postponed_until
└── skip_count

transactions
├── id
├── cycle_id
├── donor_id
├── amount
├── payment_method              -- paymob / manual
├── paymob_order_id
├── receipt_image_url
├── approval_status             -- approved / pending / rejected
├── verification_source         -- paymob_auto / manual_review  (جديد)
└── created_at

admin_alerts
├── id
├── donor_id
├── cycle_id
├── alert_type                  -- overdue / escalated_admin / cycle_failed
├── is_resolved
└── created_at
```

---

## 5. Core REST API Endpoints (محدّثة)

| Endpoint | Method | الوصول | الوصف |
|---|---|---|---|
| `/api/v1/auth/google` | POST | Public | تسجيل الدخول/التسجيل عبر Google token |
| `/api/v1/donors/me` | GET | Donor | بيانات المتبرع الحالي (من الـ JWT) |
| `/api/v1/donors/link-legacy` | POST | Donor | ربط حساب قديم بحساب Google (مرة واحدة) |
| `/api/v1/cycles/postpone` | POST | Donor | تأجيل الدورة الحالية |
| `/api/v1/cycles/skip` | POST | Donor | تخطي الدورة الحالية نهائيًا هذا الشهر |
| `/api/v1/payments/paymob/initiate` | POST | Donor | بدء عملية دفع |
| `/api/v1/webhooks/paymob` | POST | Public (Webhook) | تأكيد الدفع وتحديث approval_status تلقائيًا |
| `/api/v1/payments/manual/upload` | POST | Donor | رفع إيصال يدوي (يبقى pending) |
| `/api/v1/campaigns/:id/donate-once` | POST | Donor | تبرع لمرة واحدة لحملة `one_time` |
| `/api/v1/admin/escalations` | GET | Admin | كل الحالات المتأخرة/المتعثرة (بما فيها `cycle_failed`) |
| `/api/v1/admin/approvals/:id` | PATCH | Admin | الموافقة/الرفض على إيصال يدوي فقط |
| `/api/v1/admin/alerts/:id/mark-contacted` | PATCH | Admin | تسجيل إن الأدمن تواصل يدويًا مع متبرع `cycle_failed` |
| `/api/v1/admin/export/report` | GET | Admin | تصدير تقرير Excel/PDF |

---

## 6. البنية التحتية المجانية بالكامل (Zero-Budget Stack)

- **Frontend**: Vercel (Next.js) — مجاني للمشاريع الصغيرة
- **Backend**: Render / Railway Free Tier، أو Supabase Edge Functions
- **Database**: Supabase Postgres (حتى 500MB مجانًا)
- **Auth**: Google OAuth مباشر أو عبر Firebase Auth (بلا حدود عملية للاستخدام هنا)
- **التقارير**: exceljs / pdf-lib (مكتبات مفتوحة المصدر بدون تكلفة)
- **تنبيهات الأدمن الداخلية**: بوت Telegram مجاني + Gmail SMTP (500 إيميل/يوم مجانًا) لتنبيهات الداشبورد والتذكيرات

---

## 7. القرارات المستقرة (v2)

- [x] WhatsApp API أُلغي بالكامل من النظام
- [x] الـ skip مسموح به حتى **6 أشهر متتالية**، بعدها الدورة تدخل `cycle_failed` تلقائيًا
- [x] عند `cycle_failed`: تنبيه أدمن فقط للتواصل اليدوي — لا إعادة تفعيل تلقائية
- [x] الحملات (`campaigns`) تدعم نوعين: `recurring` (دورات شهرية) و `one_time` (تبرع لمرة واحدة)
