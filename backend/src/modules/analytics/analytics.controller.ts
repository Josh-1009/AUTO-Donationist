import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const stats = await AnalyticsService.getDashboardStats();
      return sendSuccess(res, stats, 'تم استرجاع إحصائيات الجمعية');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع الإحصائيات', 400);
    }
  }

  static async exportReport(req: Request, res: Response) {
    try {
      const { type } = req.query;
      const report = await AnalyticsService.getReportData(type ? String(type) : 'donors');
      return sendSuccess(res, report, 'تم توليد تقرير البيانات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تصدير التقرير', 400);
    }
  }
}
