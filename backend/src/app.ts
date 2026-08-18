import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { DonorsController } from './modules/donors/donors.controller';
import { CampaignsController } from './modules/campaigns/campaigns.controller';
import { CyclesController } from './modules/cycles/cycles.controller';
import { VouchersController } from './modules/vouchers/vouchers.controller';
import { FollowupsController } from './modules/followups/followups.controller';
import { AnalyticsController } from './modules/analytics/analytics.controller';
import { sendSuccess } from './shared/utils/response';

export function createApp(): Express {
  const app = express();

  // Middleware
  app.use(cors({ origin: '*' }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Static uploads directory for images/logos if needed
  app.use('/uploads', express.static('uploads'));

  const router = express.Router();

  // Health Check
  router.get('/health', (req: Request, res: Response) => {
    return sendSuccess(res, { status: 'healthy', version: 'Offline-Charity-ERP-v2' }, 'المنظومة الداخلية للجمعية تعمل بنجاح');
  });

  // --- Donors Endpoints ---
  router.post('/donors', DonorsController.register);
  router.get('/donors', DonorsController.getAll);
  router.get('/donors/:id', DonorsController.getById);
  router.patch('/donors/:id', DonorsController.update);
  router.delete('/donors/:id', DonorsController.delete);

  // --- Campaigns Endpoints ---
  router.get('/campaigns', CampaignsController.getAll);
  router.get('/campaigns/:id', CampaignsController.getById);
  router.post('/campaigns', CampaignsController.create);
  router.patch('/campaigns/:id', CampaignsController.update);
  router.delete('/campaigns/:id', CampaignsController.delete);

  // --- Cycles Endpoints ---
  router.post('/cycles/postpone', CyclesController.postpone);
  router.post('/cycles/skip', CyclesController.skip);
  router.post('/cycles/generate-monthly', CyclesController.generateMonthly);
  router.get('/cycles/overdue', CyclesController.getOverdue);
  router.get('/cycles/:id', CyclesController.getById);

  // --- Receipt Vouchers Endpoints ---
  router.post('/vouchers', VouchersController.create);
  router.get('/vouchers', VouchersController.getAll);
  router.get('/vouchers/:id', VouchersController.getById);

  // --- Followups Endpoints ---
  router.post('/followups', FollowupsController.log);
  router.get('/followups', FollowupsController.getAll);

  // --- Analytics & ERP Dashboard ---
  router.get('/admin/dashboard', AnalyticsController.getDashboard);
  router.get('/admin/export', AnalyticsController.exportReport);
  router.get('/admin/escalations', CyclesController.getOverdue);

  // Mount API Router
  app.use('/api/v1', router);

  // 404 Handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({ success: false, message: 'المسار غير موجود في المنظومة' });
  });

  // Global Error Handler
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('App Error:', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'حدث خطأ داخلي في الخادم',
    });
  });

  return app;
}
