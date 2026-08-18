import prisma from '../../config/database';
import { CYCLE_STATUS } from '../../shared/constants';

async function main() {
  console.log('🌱 جاري زراعة البيانات الأولية لمنظومة إدارة الجمعية الخيرية (Offline Charity ERP)...');

  // 1. Clear existing data
  await prisma.followupLog.deleteMany();
  await prisma.receiptVoucher.deleteMany();
  await prisma.donationCycle.deleteMany();
  await prisma.donor.deleteMany();
  await prisma.campaign.deleteMany();
  await prisma.staffUser.deleteMany();

  // 2. Create Staff Users
  await prisma.staffUser.createMany({
    data: [
      { username: 'admin', fullName: 'أ / محمود الشافعي (مدير الجمعية)', role: 'admin', phone: '01000000001' },
      { username: 'treasurer', fullName: 'أ / إبراهيم عبد الله (أمين الصندوق)', role: 'treasurer', phone: '01000000002' },
      { username: 'collector1', fullName: 'أ / مصطفى حسن (المندوب الميداني)', role: 'collector', phone: '01000000003' },
    ],
  });
  console.log('✅ تم تسجيل موظفي الجمعية وأمين الصندوق.');

  // 3. Create Campaigns
  const campaign1 = await prisma.campaign.create({
    data: {
      slug: 'orphans-sponsorship',
      title: 'كفالة أيتام التعليم وسداد المصروفات',
      description: 'كفالة شهرية منتظمة لأيتام الأسر الأولى بالرعاية لضمان استمرار تعليمهم.',
      campaignTotalTarget: 60000,
      currentAmount: 0,
      donationType: 'recurring',
      whatsappTemplate: 'قال رسول الله ﷺ: "أنا وكافل اليتيم في الجنة هكذا". مساهمتكم تصنع مستقبلاً لأبنائنا الأيتام 🤍',
      isActive: true,
    },
  });

  const campaign2 = await prisma.campaign.create({
    data: {
      slug: 'monthly-food-box',
      title: 'الإطعام الشهري وكرتونة الخير للأسر المتعففة',
      description: 'توزيع كراتين المواد الغذائية الأساسية واللحوم على 200 أسرة شهرياً.',
      campaignTotalTarget: 40000,
      currentAmount: 0,
      donationType: 'recurring',
      whatsappTemplate: 'تجديد النية في إطعام الطعام: "ويطعمون الطعام على حبه مسكيناً ويتيماً وأسيراً". تقبل الله منكم 🤍',
      isActive: true,
    },
  });

  const campaign3 = await prisma.campaign.create({
    data: {
      slug: 'urgent-medical',
      title: 'إجراء عمليات جراحية وأدوية عاجلة',
      description: 'حملة إغاثية لتغطية تكاليف العمليات الجراحية للمرضى غير القادرين.',
      campaignTotalTarget: 30000,
      currentAmount: 0,
      donationType: 'one_time',
      whatsappTemplate: '"ومن أحياها فكأنما أحيا الناس جميعاً" 🤍',
      isActive: true,
    },
  });
  console.log('✅ تم إنشاء 3 حملات ومشاريع خيرية.');

  // 4. Create Donors
  const donor1 = await prisma.donor.create({
    data: {
      donorCode: 'DNR-1001',
      fullName: 'أحمد منصور إبراهيم',
      phone: '01011223344',
      phoneSecondary: '0223344556',
      address: 'المعادي - شارع 9 - عمارة 14 الدور 3',
      dept: 'كلية الهندسة',
      academicYear: 'دفعة 2018',
      committedAmount: 500,
      preferredMethod: 'cash_office',
      status: 'active',
      notes: 'متبرع منتظم بالحضور لمقر الجمعية شهرياً',
    },
  });

  const donor2 = await prisma.donor.create({
    data: {
      donorCode: 'DNR-1002',
      fullName: 'سارة خليل عبد الرحمن',
      phone: '01122334455',
      address: 'الدقي - ميدان المساحة - برج الأطباء',
      dept: 'كلية الصيدلة',
      academicYear: 'دفعة 2020',
      committedAmount: 400,
      preferredMethod: 'collector_visit',
      status: 'active',
      notes: 'يفضل زيارة المندوب يوم 5 من كل شهر بعد الساعة 5 مساءً',
    },
  });

  const donor3 = await prisma.donor.create({
    data: {
      donorCode: 'DNR-1003',
      fullName: 'د. عمر فاروق المصري',
      phone: '01233445566',
      address: 'سموحة - الإسكندرية - شارع فيكتور عمانويل',
      dept: 'كلية الطب',
      committedAmount: 1000,
      preferredMethod: 'instapay_manual',
      status: 'active',
      notes: 'يحول عبر إنستاباي ويرسل صورة الإشعار',
    },
  });

  const donor4 = await prisma.donor.create({
    data: {
      donorCode: 'DNR-1004',
      fullName: 'م. نور الدين مصطفى',
      phone: '01544556677',
      address: 'طنطا - شارع البحر - برج التحرير',
      dept: 'كلية الهندسة',
      committedAmount: 600,
      preferredMethod: 'cash_office',
      status: 'active',
      notes: 'يحتاج متابعة وتأكيد بالواتساب قبل الموعد',
    },
  });

  const donor5 = await prisma.donor.create({
    data: {
      donorCode: 'DNR-1005',
      fullName: 'يوسف علي سالم',
      phone: '01099887766',
      address: 'المنصورة - شارع المشاية السفلية',
      dept: 'كلية التجارة',
      committedAmount: 300,
      preferredMethod: 'vodafone_cash',
      status: 'active',
      notes: 'تحويل محفظة فودافون كاش',
    },
  });
  console.log('✅ تم تسجيل 5 متبرعين بالعناوين وأرقام الهواتف.');

  const currentMonth = '2026-08';

  // 5. Create Cycles & Receipt Vouchers
  // Donor 1: Fully Paid (500 EGP)
  const cycle1 = await prisma.donationCycle.create({
    data: {
      donorId: donor1.id,
      campaignId: campaign1.id,
      cycleMonth: currentMonth,
      cycleExpectedAmount: 500,
      paidAmount: 500,
      status: CYCLE_STATUS.PAID,
      postponeCount: 0,
      skipCount: 0,
      notes: 'تم سداد القسط بالكامل بالمقر نقداً',
    },
  });

  await prisma.receiptVoucher.create({
    data: {
      voucherNumber: 'REC-2026-1001',
      donorId: donor1.id,
      campaignId: campaign1.id,
      cycleId: cycle1.id,
      amount: 500,
      paymentMethod: 'cash',
      receivedBy: 'أمين الصندوق',
      notes: 'سداد قسط كفالة الأيتام لشهر أغسطس',
    },
  });

  // Donor 2: Partially Paid (200 of 400 EGP) via collector
  const cycle2 = await prisma.donationCycle.create({
    data: {
      donorId: donor2.id,
      campaignId: campaign1.id,
      cycleMonth: currentMonth,
      cycleExpectedAmount: 400,
      paidAmount: 200,
      status: CYCLE_STATUS.PARTIALLY_PAID,
      postponeCount: 0,
      skipCount: 0,
      notes: 'سداد دفعة أولى عبر المندوب',
    },
  });

  await prisma.receiptVoucher.create({
    data: {
      voucherNumber: 'REC-2026-1002',
      donorId: donor2.id,
      campaignId: campaign1.id,
      cycleId: cycle2.id,
      amount: 200,
      paymentMethod: 'collector',
      collectorName: 'مصطفى حسن (المندوب)',
      receivedBy: 'مصطفى حسن',
      notes: 'استلام دفعة أولى من منزل المتبرعة',
    },
  });

  // Donor 3: Fully Paid (1000 EGP) via Instapay
  const cycle3 = await prisma.donationCycle.create({
    data: {
      donorId: donor3.id,
      campaignId: campaign2.id,
      cycleMonth: currentMonth,
      cycleExpectedAmount: 1000,
      paidAmount: 1000,
      status: CYCLE_STATUS.PAID,
      postponeCount: 0,
      skipCount: 0,
    },
  });

  await prisma.receiptVoucher.create({
    data: {
      voucherNumber: 'REC-2026-1003',
      donorId: donor3.id,
      campaignId: campaign2.id,
      cycleId: cycle3.id,
      amount: 1000,
      paymentMethod: 'instapay',
      receivedBy: 'أمين الصندوق',
      notes: 'تحويل إنستاباي - كرتونة الخير',
    },
  });

  // Donor 4: Needs Follow-up (Postponed 2 times)
  const cycle4 = await prisma.donationCycle.create({
    data: {
      donorId: donor4.id,
      campaignId: campaign1.id,
      cycleMonth: currentMonth,
      cycleExpectedAmount: 600,
      paidAmount: 0,
      status: CYCLE_STATUS.POSTPONED,
      postponeCount: 2,
      postponedUntil: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      notes: 'طلب تأجيل التحصيل لموعد قبض الراتب',
    },
  });

  await prisma.followupLog.create({
    data: {
      donorId: donor4.id,
      cycleId: cycle4.id,
      contactType: 'phone_call',
      outcome: 'promised_to_pay',
      notes: 'تم الاتصال بالمتبرع ووعد بالحضور للمقر بعد غد',
      contactedBy: 'أ / محمود الشافعي',
    },
  });

  // Donor 5: Pending
  await prisma.donationCycle.create({
    data: {
      donorId: donor5.id,
      campaignId: campaign2.id,
      cycleMonth: currentMonth,
      cycleExpectedAmount: 300,
      paidAmount: 0,
      status: CYCLE_STATUS.PENDING,
      postponeCount: 0,
      skipCount: 0,
    },
  });

  // Update Campaign totals
  await prisma.campaign.update({
    where: { id: campaign1.id },
    data: { currentAmount: 700 },
  });

  await prisma.campaign.update({
    where: { id: campaign2.id },
    data: { currentAmount: 1000 },
  });

  console.log('✅ تم تسجيل سندات القبض والدورات الشهرية وسجلات المتابعة.');
  console.log('========================================================');
  console.log('🚀 المنظومة الداخلية للجمعية الخيرية جاهزة للعمل بنجاح.');
  console.log('========================================================');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
