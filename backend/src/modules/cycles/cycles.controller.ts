import { Request, Response } from 'express';
import { CyclesService } from './cycles.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class CyclesController {
  static async postpone(req: Request, res: Response) {
    try {
      const { cycleId, notes, customDate } = req.body;
      if (!cycleId) return sendError(res, 'معرف الدورة مطلوب', 400);

      const cycle = await CyclesService.postpone(cycleId, notes, customDate);
      return sendSuccess(res, cycle, 'تم تأجيل موعد التحصيل بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تأجيل الدورة', 400);
    }
  }

  static async skip(req: Request, res: Response) {
    try {
      const { cycleId, reason } = req.body;
      if (!cycleId) return sendError(res, 'معرف الدورة مطلوب', 400);

      const cycle = await CyclesService.skip(cycleId, reason);
      return sendSuccess(res, cycle, 'تم تخطي دورة الشهر الحالي بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تخطي الدورة', 400);
    }
  }

  static async generateMonthly(req: Request, res: Response) {
    try {
      const { month } = req.body;
      const result = await CyclesService.generateMonthlyCycles(month);
      return sendSuccess(res, result, 'تم توليد الالتزامات الشهرية للمتبرعين بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل توليد الدورات', 400);
    }
  }

  static async getOverdue(req: Request, res: Response) {
    try {
      const list = await CyclesService.getOverdueAndFollowups();
      return sendSuccess(res, list, 'تم استرجاع قائمة المتابعة والمتأخرين');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع القائمة', 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const cycle = await CyclesService.getById(id);
      if (!cycle) return sendError(res, 'الدورة غير موجودة', 404);
      return sendSuccess(res, cycle, 'تم استرجاع تفاصيل الدورة');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع الدورة', 400);
    }
  }
}
