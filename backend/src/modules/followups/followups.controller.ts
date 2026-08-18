import { Request, Response } from 'express';
import { FollowupsService } from './followups.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class FollowupsController {
  static async log(req: Request, res: Response) {
    try {
      const { donorId, cycleId, contactType, outcome, notes, contactedBy } = req.body;

      if (!donorId) {
        return sendError(res, 'معرف المتبرع مطلوب', 400);
      }

      const log = await FollowupsService.logFollowup({
        donorId,
        cycleId,
        contactType,
        outcome,
        notes,
        contactedBy,
      });

      return sendSuccess(res, log, 'تم تسجيل المتابعة والملاحظة بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تسجيل المتابعة', 400);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { donorId } = req.query;
      const logs = await FollowupsService.getAll(donorId ? String(donorId) : undefined);
      return sendSuccess(res, logs, 'تم استرجاع سجل المتابعات');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع السجل', 400);
    }
  }
}
