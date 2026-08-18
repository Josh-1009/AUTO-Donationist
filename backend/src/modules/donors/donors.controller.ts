import { Request, Response } from 'express';
import { DonorsService } from './donors.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class DonorsController {
  static async register(req: Request, res: Response) {
    try {
      const { fullName, phone, phoneSecondary, address, dept, academicYear, committedAmount, preferredMethod, campaignId, notes } = req.body;

      if (!fullName || !phone) {
        return sendError(res, 'الاسم ورقم الهاتف حقول مطلوبة', 400);
      }

      const donor = await DonorsService.register({
        fullName,
        phone,
        phoneSecondary,
        address,
        dept,
        academicYear,
        committedAmount: committedAmount ? parseFloat(committedAmount) : 500,
        preferredMethod,
        campaignId,
        notes,
      });

      return sendSuccess(res, donor, 'تم تسجيل المتبرع وتوليد الكود بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تسجيل المتبرع', 400);
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { search, status, preferredMethod } = req.query;
      const donors = await DonorsService.getAll(
        search ? String(search) : undefined,
        status ? String(status) : undefined,
        preferredMethod ? String(preferredMethod) : undefined
      );

      return sendSuccess(res, donors, 'تم استرجاع قائمة المتبرعين');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع المتبرعين', 400);
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const donor = await DonorsService.getById(id);
      return sendSuccess(res, donor, 'تم استرجاع ملف المتبرع');
    } catch (error: any) {
      return sendError(res, error.message || 'المتبرع غير موجود', 404);
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const updated = await DonorsService.update(id, req.body);
      return sendSuccess(res, updated, 'تم تحديث بيانات المتبرع بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تحديث بيانات المتبرع', 400);
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await DonorsService.delete(id);
      return sendSuccess(res, null, 'تم حذف المتبرع بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل حذف المتبرع', 400);
    }
  }
}
