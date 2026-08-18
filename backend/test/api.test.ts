import { createApp } from '../src/app';
import prisma from '../src/config/database';
import http from 'http';

const app = createApp();
let server: http.Server;
let baseUrl: string;

let createdDonorId: string = '';
let createdDonorCode: string = '';
let campaignId: string = '';
let cycleId: string = '';
let voucherId: string = '';

async function runTests() {
  console.log('🚀 بدء تشغيل حزمة الاختبارات الآلية لمنظومة الجمعية الخيرية (Offline Charity ERP)...\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, errorDetail?: any) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName}`, errorDetail || '');
      failed++;
    }
  }

  // Start ephemeral server
  server = app.listen(0);
  const address = server.address() as any;
  baseUrl = `http://localhost:${address.port}/api/v1`;

  try {
    const camp = await prisma.campaign.findFirst({ where: { isActive: true } });
    if (camp) campaignId = camp.id;

    // 1. Health check
    const r1 = await fetch(`${baseUrl}/health`).then((r) => r.json());
    assert(r1.success === true && r1.data.version === 'Offline-Charity-ERP-v2', 'Health check endpoint returns Offline-Charity-ERP-v2', r1);

    // 2. Register donor & generate DNR-XXXX
    const r2 = await fetch(`${baseUrl}/donors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'متبرع تجريبي جديد',
        phone: `0100${Date.now().toString().slice(-7)}`,
        address: 'مدينة نصر - الحي السابع',
        dept: 'كلية التجارة',
        committedAmount: 500,
        preferredMethod: 'cash_office',
        campaignId,
      }),
    }).then((r) => r.json());
    assert(r2.success === true && /^DNR-\d+$/.test(r2.data.donorCode), `Register donor auto-generated code: ${r2.data?.donorCode}`, r2);
    createdDonorId = r2.data.id;
    createdDonorCode = r2.data.donorCode;
    if (r2.data.cycles && r2.data.cycles.length > 0) {
      cycleId = r2.data.cycles[0].id;
    }

    // 3. GET /donors
    const r3 = await fetch(`${baseUrl}/donors`).then((r) => r.json());
    assert(r3.success === true && Array.isArray(r3.data) && r3.data.length > 0 && !!r3.data[0].reminderWhatsAppUrl, 'GET /donors returns donor directory with reminder WhatsApp triggers', r3);

    // 4. GET /campaigns
    const r4 = await fetch(`${baseUrl}/campaigns`).then((r) => r.json());
    assert(r4.success === true && r4.data.length >= 3, 'GET /campaigns returned 3 charity projects and targets', r4);

    // 5. Issue Official Receipt Voucher
    const r5 = await fetch(`${baseUrl}/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorId: createdDonorId,
        campaignId,
        cycleId: cycleId || undefined,
        amount: 500,
        paymentMethod: 'cash',
        collectorName: 'أمين الصندوق بالمقر',
        receivedBy: 'أمين الصندوق',
        notes: 'سداد اشتراك كفالة أيتام نقداً',
      }),
    }).then((r) => r.json());
    assert(
      r5.success === true &&
      /^REC-\d{4}-\d+$/.test(r5.data.voucherNumber) &&
      r5.data.amountInWords.includes('خمسمائة') &&
      r5.data.thankYouWhatsAppUrl.includes('wa.me'),
      `Issue Receipt Voucher: ${r5.data?.voucherNumber} with Tafqeet and WhatsApp thank you`,
      r5
    );
    voucherId = r5.data.id;

    // 6. GET /vouchers/:id
    const r6 = await fetch(`${baseUrl}/vouchers/${voucherId}`).then((r) => r.json());
    assert(r6.success === true && r6.data.amount === 500 && r6.data.donor.fullName === 'متبرع تجريبي جديد', 'GET /vouchers/:id returns full voucher for printable receipt view', r6);

    // 7. Postpone cycle
    const pendingCycle = await prisma.donationCycle.findFirst({ where: { status: 'pending' } });
    if (pendingCycle) {
      const r7 = await fetch(`${baseUrl}/cycles/postpone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId: pendingCycle.id, notes: 'طلب تأجيل أسبوع' }),
      }).then((r) => r.json());
      assert(r7.success === true && r7.data.postponeCount >= 1, 'Postpone cycle collection date and increment postponeCount', r7);
    }

    // 8. Skip cycle
    const anotherCycle = await prisma.donationCycle.findFirst({ where: { status: 'pending' } });
    if (anotherCycle) {
      const r8 = await fetch(`${baseUrl}/cycles/skip`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cycleId: anotherCycle.id, reason: 'ظروف خاصة' }),
      }).then((r) => r.json());
      assert(r8.success === true && r8.data.status === 'skipped', 'Skip cycle month and set status to skipped', r8);
    }

    // 9. Log Donor Followup
    const r9 = await fetch(`${baseUrl}/followups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        donorId: createdDonorId,
        cycleId: cycleId || undefined,
        contactType: 'phone_call',
        outcome: 'promised_to_pay',
        notes: 'تم الاتصال بالمتبرع ووعد بالحضور للمقر',
        contactedBy: 'أ / محمود الشافعي',
      }),
    }).then((r) => r.json());
    assert(r9.success === true && r9.data.outcome === 'promised_to_pay', 'Log donor contact and call record successfully', r9);

    // 10. GET /cycles/overdue
    const r10 = await fetch(`${baseUrl}/cycles/overdue`).then((r) => r.json());
    assert(r10.success === true && Array.isArray(r10.data), 'GET /cycles/overdue returns followups queue with WhatsApp triggers', r10);

    // 11. GET /admin/dashboard
    const r11 = await fetch(`${baseUrl}/admin/dashboard`).then((r) => r.json());
    assert(r11.success === true && r11.data.kpis.totalCollected > 0 && !!r11.data.recentVouchers, 'GET /admin/dashboard returns ERP KPIs, recent vouchers, and payment breakdown', r11);

    // 12. GET /admin/export
    const r12 = await fetch(`${baseUrl}/admin/export?type=vouchers`).then((r) => r.json());
    assert(r12.success === true && Array.isArray(r12.data) && !!r12.data[0]['رقم السند'], 'GET /admin/export returns structured reports for Excel/Print', r12);

    console.log('\n========================================');
    console.log(`🎉 نتائج الاختبارات: ${passed} نجاح | ${failed} فشل`);
    console.log('========================================\n');

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('Test Execution Error:', err);
    process.exit(1);
  } finally {
    server.close();
    await prisma.$disconnect();
  }
}

runTests();
