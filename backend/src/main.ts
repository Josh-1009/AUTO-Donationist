import { createApp } from './app';
import { appConfig } from './config/app.config';
import { startDailyEscalationCron } from './modules/cycles/cron/daily-escalation.job';

const app = createApp();

app.listen(appConfig.port, () => {
  console.log(`🚀 Donation ERP & Web Portal Backend is running on port ${appConfig.port}`);
  console.log(`🌐 Base URL: ${appConfig.appUrl}/api/v1`);

  // Start Cron Jobs
  startDailyEscalationCron();
});
