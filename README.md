<div align="center">

# 🌟 منظومة إدارة الجمعية الخيرية والتحصيل وسندات القبض
### **Auto-Donationist | Offline Charity ERP & Donors CRM Platform**

نظام برمجي متكامل لإدارة اشتراكات المتبرعين، توجيه مندوبي التحصيل الميداني، إصدار وطباعة سندات القبض الرسمية والتواصل الذكي عبر واتساب.

---

[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![Flutter](https://img.shields.io/badge/Flutter-Mobile-02569B?style=for-the-badge&logo=flutter&logoColor=white)](https://flutter.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

<br>

<div dir="rtl">

## 📖 عن المنظومة

منظومة **Auto-Donationist** مصممة خصيصاً لتلبية متطلبات العمل الداخلي للجمعيات الخيرية ومؤسسات الإغاثة دون الحاجة لبوابات دفع إلكتروني معقدة، بالاعتماد على:
1. **التحصيل المكتبي والميداني عبر المندوبين**.
2. **إصدار وطباعة سندات القبض الفورية مع التفقيط المالي باللغة العربية**.
3. **أتمتة المتابعات والتواصل المباشر مع المتبرعين عبر الواتساب والمكالمات**.

---

## 🌟 المميزات والوظائف الرئيسية

### 1. 🧾 إصدار وطباعة سندات القبض الرسمية (Printable Official Receipts)
* **ترقيم تسلسلي تلقائي:** توليد أكواد موحدة لكل سند (مثل `REC-2026-1001`).
* **تفقيد المبالغ المالية بالعربية (Tafqeet):** كتابة المبلغ نصياً بدقة (مثال: *"فقط خمسمائة جنيهاً مصرياً لا غير"*).
* **تعدد طرق التحصيل:** نقدي بالمقر، تحصيل مندوب، إنستاباي، فودافون كاش، أو تحويل بنكي.
* **إيصال قابل للطباعة الفورية (1-Click Print):** يتضمن خانات توقيع المندوب، أمين الصندوق، وختم الجمعية.

### 2. 📲 التواصل الفوري والذكي مع المتبرعين (1-Click WhatsApp)
* **رسالة الشكر وسند القبض:** إرسال إشعار فوري بعد التحصيل مع رقم السند والمبلغ والدعاء للمتبرع.
* **رسالة التذكير الشهري:** تذكير بفضل الصدقة وكفالات الأيتام وموعد التحصيل القادم.
* **رسالة المتابعة والاستفسار:** للمتأخرين لتحديد موعد زيارة المندوب أو التحصيل بالمقر.
* **اتصال هاتفي مباشر (`tel:`):** إجراء مكالمة سريعة للمتبرع بضغطة زر وتوثيق نتيجة المكالمة فوراً.

### 3. 👥 دليل وسجل المتبرعين (Donors CRM)
* توليد كود فريد لكل متبرع (`DNR-XXXX`).
* حفظ بيانات الاتصال، العناوين التفصيلية، وأوقات الزيارة المفضلة لتوجيه المندوبين.
* متابعة الالتزامات الشهرية وحالات التخطي أو التأجيل مع تدوين الملاحظات.

### 4. 📊 لوحة تحكم ERP والكشوفات المالية
* **مؤشرات أداء حية (KPIs):** إجمالي المحصل الفعلي، المبالغ المتأخرة، عدد السندات المصدرة ونسبة الإنجاز.
* **رسوم بيانية تفاعلية:** توزيع التبرعات حسب المشاريع وطرق الدفع.
* **تصدير كشوفات وتقارير:** تصدير كشوفات المندوبين وقوائم المتبرعين بصيغ **Excel (.xlsx)** و **CSV** و **طباعة تقارير ورقية**.

---

## 🛠️ البنية التقنية (Tech Stack)

| الطبقة (Layer) | التقنيات المستخدمة |
| :--- | :--- |
| **Backend API** | Node.js, Express.js, TypeScript, Prisma ORM, SQLite / PostgreSQL |
| **Frontend Web** | Next.js 14 (App Router), React 18, Tailwind CSS, Lucide Icons, Recharts, jsPDF, XLSX |
| **Mobile App** | Flutter, Dart, Secure Storage, URL Launcher, Provider |
| **DevOps & Infra** | Docker, Docker Compose, Nginx Reverse Proxy |

---

## 📂 هيكل مجلدات المشروع

```text
AUTO-Donationist/
├── backend/                  # خادم الواجهات البرمجية (REST API)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── donors/       # إدارة وسجل المتبرعين (CRM)
│   │   │   ├── vouchers/     # إصدار وأرشيف سندات القبض والتفقيط
│   │   │   ├── cycles/       # الدورات الشهرية والالتزامات
│   │   │   ├── followups/    # توثيق المكالمات والمتابعات
│   │   │   ├── campaigns/    # المشاريع، الكفالات، والإطعام
│   │   │   ├── notifications/# قوالب رسائل الواتساب الذكية
│   │   │   └── analytics/    # مؤشرات الأداء وتصدير التقارير
│   │   ├── shared/           # دوال التفقيط والمولدات والميدلوير
│   │   └── database/         # إعدادات Prisma وقواعد البيانات
│   └── test/                 # اختبارات التكامل الآلية (Integration Tests)
│
├── frontend/                 # واجهة الويب ولوحة التحكم (Next.js)
│   ├── src/
│   │   ├── app/
│   │   │   ├── (admin)/      # لوحات المؤشرات، السندات، المتبرعين، والتقارير
│   │   │   └── (public)/     # البوابة العامة
│   │   └── components/       # عناصر الواجهة، النوافذ المنبثقة، والرسوم البيانية
│
├── mobile_app_flutter/       # تطبيق الهاتف لمندوبي التحصيل (Flutter)
│   └── lib/                  # شاشات التحصيل، نماذج البيانات، والاتصال بالخادم
│
├── docker-compose.yml        # تشغيل المنظومة بالكامل عبر الحاويات
├── nginx.conf                # إعدادات خادم Nginx
└── README.md
```

---

## 🚀 التشغيل السريع (Quick Start)

### المتطلبات الأساسية
* [Node.js](https://nodejs.org/) الإصدار 18 أو أحدث
* [Git](https://git-scm.com/)

### 1. إعداد وتشغيل الخادم (Backend)
```bash
cd backend
npm install

# إعداد قاعدة البيانات وزراعة البيانات التجريبية
npx prisma db push
npm run db:seed

# بدء تشغيل الخادم
npm run dev
# الخادم متاح على: http://localhost:5000
```

### 2. إعداد وتشغيل واجهة الويب (Frontend)
```bash
cd frontend
npm install

# بدء تشغيل الواجهة
npm run dev
# الواجهة متاحة على: http://localhost:3000
```

### 3. تشغيل الاختبارات الآلية (Automated Tests)
```bash
cd backend
npm test
```

---

## 🐳 التشغيل عبر Docker Compose

لتشغيل المنظومة كاملة (قاعدة بيانات PostgreSQL + الخادم الخلفي + الواجهة الأمامية + خادم Nginx):

```bash
docker-compose up -d --build
```

</div>

---

<div align="center">
  <sub>تم التطوير بكل ❤️ لدعم وتيسير أعمال الخير والجمعيات الإنسانية</sub>
</div>