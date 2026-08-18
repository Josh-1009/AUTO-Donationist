import { Request, Response } from 'express';
import { CampaignsService } from './campaigns.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class CampaignsController {
  static async getAll(req: Request, res: Response) {
    try {
      const onlyActive = req.query.active === 'true';
      const campaigns = await CampaignsService.getAll(onlyActive);
      return sendSuccess(res, campaigns, 'تم استرجاع قائمة الحملات والمشاريع');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع الحملات', 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaign = await CampaignsService.getById(id);
      if (!campaign) return sendError(res, 'الحملة غير موجودة', 404);
      return sendSuccess(res, campaign, 'تم استرجاع بيانات الحملة');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع الحملة', 400);
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const campaign = await CampaignsService.create(req.body);
      return sendSuccess(res, campaign, 'تم إنشاء الحملة بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إنشاء الحملة', 400);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const campaign = await CampaignsService.update(id, req.body);
      return sendSuccess(res, campaign, 'تم تحديث بيانات الحملة');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تحديث الحملة', 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await CampaignsService.delete(id);
      return sendSuccess(res, null, 'تم حذف الحملة بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف الحملة', 400);
    }
  }
}
