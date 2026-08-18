import cron from 'node-cron';
import { CyclesService } from '../cycles.service';

export function startDailyEscalationCron() {
  // Run every day at 09:00 AM ('0 9 * * *')
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron Job] تشغيل فحص التأجيلات والتصعيد اليومي (09:00 AM)...');
    try {
      const result = await CyclesService.runDailyEscalationJob();
      console.log(`[Cron Job] تم انتهاء الفحص بنجاح: تم تصعيد ${result.escalatedCount} متبرع.`);
    } catch (error) {
      console.error('[Cron Job Error] فشل فحص التأجيلات اليومي:', error);
    }
  });

  console.log('⏰ تم تفعيل جدولة فحص التأجيلات اليومية (Daily Cron Job at 09:00 AM)');
}
