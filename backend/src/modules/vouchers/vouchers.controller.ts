import { Request, Response } from 'express';
import { VouchersService } from './vouchers.service';
import { sendSuccess, sendError } from '../../shared/utils/response';

export class VouchersController {
  /**
   * POST /api/v1/vouchers
   * Issue a new receipt voucher for donation
   */
  static async create(req: Request, res: Response) {
    try {
      const { donorId, campaignId, amount, paymentMethod, collectorName, receivedBy, cycleId, notes, receiptDate } = req.body;

      if (!donorId || !campaignId || !amount) {
        return sendError(res, 'يرجى تحديد المتبرع والحملة والمبلغ', 400);
      }

      const voucher = await VouchersService.createVoucher({
        donorId,
        campaignId,
        amount: parseFloat(amount),
        paymentMethod,
        collectorName,
        receivedBy,
        cycleId,
        notes,
        receiptDate,
      });

      return sendSuccess(res, voucher, 'تم إصدار سند القبض وتسجيل التحصيل بنجاح', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل إصدار سند القبض', 400);
    }
  }

  /**
   * GET /api/v1/vouchers
   */
  static async getAll(req: Request, res: Response) {
    try {
      const { search, paymentMethod, campaignId } = req.query;
      const vouchers = await VouchersService.getAll(
        search ? String(search) : undefined,
        paymentMethod ? String(paymentMethod) : undefined,
        campaignId ? String(campaignId) : undefined
      );

      return sendSuccess(res, vouchers, 'تم استرجاع سندات القبض');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع سندات القبض', 400);
    }
  }

  /**
   * GET /api/v1/vouchers/:id
   */
  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const voucher = await VouchersService.getById(id);
      return sendSuccess(res, voucher, 'تم استرجاع تفاصيل سند القبض');
    } catch (error: any) {
      return sendError(res, error.message || 'سند القبض غير موجود', 404);
    }
  }
}
