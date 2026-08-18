import prisma from '../../config/database';
import { paymobConfig } from '../../config/paymob.config';
import { CYCLE_STATUS, APPROVAL_STATUS, VERIFICATION_SOURCE } from '../../shared/constants';

export interface InitiatePaymobDto {
  donorId: string;
  cycleId?: string;
  amount: number;
  currency?: string;
  campaignId?: string;
}

export class PaymobService {
  /**
   * Initiate Paymob Payment Order & Payment Key
   */
  static async initiatePayment(dto: InitiatePaymobDto) {
    const donor = await prisma.donor.findUnique({
      where: { id: dto.donorId },
    });

    if (!donor) {
      throw new Error('المتبرع غير موجود');
    }

    const orderId = `PM-ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const paymentToken = `pk_test_${Math.random().toString(36).substring(2)}${Date.now()}`;

    // Create a pending transaction record
    const transaction = await prisma.transaction.create({
      data: {
        donorId: donor.id,
        cycleId: dto.cycleId,
        amount: dto.amount,
        paymentMethod: 'paymob',
        paymobOrderId: orderId,
        approvalStatus: APPROVAL_STATUS.PENDING,
        verificationSource: VERIFICATION_SOURCE.PAYMOB_AUTO,
        notes: 'في انتظار اكتمال الدفع عبر بوابة Paymob',
      },
    });

    const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${paymobConfig.iframeId}?payment_token=${paymentToken}`;

    return {
      transactionId: transaction.id,
      paymobOrderId: orderId,
      paymentToken,
      iframeUrl,
      amount: dto.amount,
      donor: {
        id: donor.id,
        name: donor.fullName,
        code: donor.donorCode,
        phone: donor.phone,
      },
    };
  }

  /**
   * Process Paymob Webhook notification (Auto-Approved)
   */
  static async processWebhook(payload: any) {
    const obj = payload.obj || payload;
    const orderId = obj.order?.id?.toString() || obj.order_id || obj.merchant_order_id;
    const success = obj.success === true || obj.success === 'true' || obj.txn_response_code === 'APPROVED';
    const amount = (obj.amount_cents ? obj.amount_cents / 100 : obj.amount) || 0;

    if (!orderId) {
      throw new Error('معرف الطلب غير موجود في إشعار الـ Webhook');
    }

    // Find transaction by paymobOrderId
    const transaction = await prisma.transaction.findFirst({
      where: {
        OR: [
          { paymobOrderId: orderId.toString() },
          { notes: { contains: orderId.toString() } },
        ],
      },
      include: {
        cycle: { include: { campaign: true } },
      },
    });

    if (!transaction) {
      console.warn(`[Paymob Webhook] لم يتم العثور على معاملة مطابقة للطلب: ${orderId}`);
      return { received: true, matched: false };
    }

    if (success) {
      // 1. Update transaction status to APPROVED automatically (paymob_auto)
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          approvalStatus: APPROVAL_STATUS.APPROVED,
          verificationSource: VERIFICATION_SOURCE.PAYMOB_AUTO,
          reviewedAt: new Date(),
          reviewedBy: 'PAYMOB_WEBHOOK_AUTO',
          notes: `تم الدفع الإلكتروني بنجاح (معرف المعاملة: ${obj.id || 'N/A'})`,
        },
      });

      // 2. If attached to a cycle, update cycle paidAmount and status (PAID or PARTIALLY_PAID)
      if (transaction.cycleId && transaction.cycle) {
        const currentPaid = transaction.cycle.paidAmount || 0;
        const newPaidAmount = currentPaid + transaction.amount;
        const expectedAmount = transaction.cycle.cycleExpectedAmount || 0;

        const isFullyPaid = newPaidAmount >= expectedAmount;
        const newCycleStatus = isFullyPaid ? CYCLE_STATUS.PAID : CYCLE_STATUS.PARTIALLY_PAID;

        await prisma.donationCycle.update({
          where: { id: transaction.cycleId },
          data: {
            paidAmount: newPaidAmount,
            status: newCycleStatus,
            notes: isFullyPaid
              ? 'تم السداد بالكامل آلياً عبر بوابة Paymob'
              : `تم سداد دفعة جزئية (${newPaidAmount}/${expectedAmount} ج.م) آلياً عبر Paymob`,
          },
        });

        // 3. Update campaign currentAmount
        if (transaction.cycle.campaignId) {
          await prisma.campaign.update({
            where: { id: transaction.cycle.campaignId },
            data: {
              currentAmount: { increment: transaction.amount },
            },
          });
        }

        // 4. Resolve any active alerts for this cycle if fully paid
        if (isFullyPaid) {
          await prisma.adminAlert.updateMany({
            where: { cycleId: transaction.cycleId, isResolved: false },
            data: { isResolved: true, resolvedAt: new Date() },
          });
        }
      }
    } else {
      // Mark transaction as REJECTED
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          approvalStatus: APPROVAL_STATUS.REJECTED,
          notes: 'فشلت عملية الدفع عبر بوابة Paymob',
        },
      });
    }

    return { received: true, success, transactionId: transaction.id };
  }
}
