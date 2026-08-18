import { Request, Response } from 'express';
import { PaymobService } from './paymob.service';
import { ManualReceiptsService } from './manual-receipts.service';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class PaymentsController {
  /**
   * POST /api/v1/payments/paymob/initiate
   */
  static async initiatePaymob(req: AuthRequest, res: Response) {
    try {
      const donorId = req.user?.donorId || req.user?.id || req.body.donorId;
      if (!donorId) {
        return sendError(res, 'يجب تحديد المتبرع لبدء عملية الدفع', 400);
      }

      const { cycleId, amount, currency, campaignId } = req.body;
      if (!amount || amount <= 0) {
        return sendError(res, 'يرجى إدخال مبلغ صالح', 400);
      }

      const result = await PaymobService.initiatePayment({
        donorId,
        cycleId,
        amount: parseFloat(amount),
        currency,
        campaignId,
      });

      return sendSuccess(res, result, 'تم تجهيز رابط الدفع الإلكتروني بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل بدء الدفع الإلكتروني', 400);
    }
  }

  /**
   * POST /api/v1/webhooks/paymob
   */
  static async handlePaymobWebhook(req: Request, res: Response) {
    try {
      const result = await PaymobService.processWebhook(req.body);
      return sendSuccess(res, result, 'تمت معالجة إشعار الدفع بنجاح');
    } catch (error: any) {
      console.error('[Paymob Webhook Error]:', error);
      return sendError(res, error.message || 'فشل معالجة الويب هوك', 400);
    }
  }

  /**
   * POST /api/v1/payments/manual/upload
   */
  static async uploadManualReceipt(req: AuthRequest, res: Response) {
    try {
      const donorId = req.user?.donorId || req.user?.id || req.body.donorId;
      if (!donorId) {
        return sendError(res, 'يجب تحديد المتبرع', 400);
      }

      const { cycleId, amount, paymentMethod, notes } = req.body;
      if (!amount || amount <= 0) {
        return sendError(res, 'المبلغ مطلوب وصالح', 400);
      }

      const file = req.file;
      let receiptImageUrl = req.body.receiptImageUrl;
      if (file) {
        receiptImageUrl = `/uploads/receipts/${file.filename}`;
      }

      if (!receiptImageUrl) {
        return sendError(res, 'يرجى إرفاق صورة إيصال التحويل', 400);
      }

      const transaction = await ManualReceiptsService.uploadReceipt({
        donorId,
        cycleId: cycleId || undefined,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'instapay',
        receiptImageUrl,
        notes,
      });

      return sendSuccess(res, transaction, 'تم رفع الإيصال بنجاح وجاري مراجعته', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'فشل رفع الإيصال', 400);
    }
  }

  /**
   * GET /api/v1/payments/transactions
   * Admin: List all transactions
   */
  static async getAllTransactions(req: Request, res: Response) {
    try {
      const { status, method, source } = req.query;
      const transactions = await ManualReceiptsService.getAllTransactions(
        status ? String(status) : undefined,
        method ? String(method) : undefined,
        source ? String(source) : undefined
      );
      return sendSuccess(res, transactions, 'تم استرجاع المعاملات');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع المعاملات', 400);
    }
  }

  /**
   * GET /api/v1/admin/approvals
   * Admin: Get pending manual receipts
   */
  static async getPendingReceipts(req: Request, res: Response) {
    try {
      const pending = await ManualReceiptsService.getPendingReceipts();
      return sendSuccess(res, pending, 'تم استرجاع الإيصالات المعلقة');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل استرجاع الإيصالات', 400);
    }
  }

  /**
   * PATCH /api/v1/admin/approvals/:id
   * Admin: Approve or Reject manual receipt
   */
  static async reviewReceipt(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const adminIdentifier = req.user?.email || req.user?.fullName || 'الأدمن';

      if (!status || !['approved', 'rejected'].includes(status.toLowerCase())) {
        return sendError(res, 'يجب تحديد الحالة (approved أو rejected)', 400);
      }

      const updated = await ManualReceiptsService.reviewReceipt(
        id,
        status.toLowerCase() as any,
        adminIdentifier,
        notes
      );

      return sendSuccess(res, updated, 'تم تحديث حالة الإيصال بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل مراجعة الإيصال', 400);
    }
  }
}
