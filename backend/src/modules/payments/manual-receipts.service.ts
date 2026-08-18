import prisma from '../../config/database';
import { CYCLE_STATUS, APPROVAL_STATUS, VERIFICATION_SOURCE, ALERT_TYPE } from '../../shared/constants';

export interface UploadReceiptDto {
  donorId: string;
  cycleId?: string;
  amount: number;
  paymentMethod?: 'instapay' | 'cash';
  receiptImageUrl: string;
  notes?: string;
}

export class ManualReceiptsService {
  /**
   * Upload and register manual payment receipt (Instapay / Cash)
   * Remains in 'pending' status for manual review
   */
  static async uploadReceipt(dto: UploadReceiptDto) {
    const donor = await prisma.donor.findUnique({
      where: { id: dto.donorId },
    });

    if (!donor) {
      throw new Error('المتبرع غير موجود');
    }

    // Create transaction with PENDING status & manual_review source
    const transaction = await prisma.transaction.create({
      data: {
        donorId: donor.id,
        cycleId: dto.cycleId,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod || 'instapay',
        receiptImageUrl: dto.receiptImageUrl,
        approvalStatus: APPROVAL_STATUS.PENDING,
        verificationSource: VERIFICATION_SOURCE.MANUAL_REVIEW,
        notes: dto.notes || 'تم رفع الإيصال وبانتظار مراجعة المسؤول',
      },
      include: {
        donor: true,
        cycle: { include: { campaign: true } },
      },
    });

    // Create Admin Alert for pending receipt review
    await prisma.adminAlert.create({
      data: {
        donorId: donor.id,
        cycleId: dto.cycleId,
        alertType: ALERT_TYPE.MANUAL_RECEIPT_PENDING,
        notes: `إيصال دفع يدوي جديد للمتبرع ${donor.fullName} بقيمة ${dto.amount} ج.م بانتظار الاعتماد اليدوي`,
      },
    });

    return transaction;
  }

  /**
   * Admin reviews manual receipt (Approve or Reject)
   * Only applies to manual_review verification source
   */
  static async reviewReceipt(
    transactionId: string,
    status: 'approved' | 'rejected',
    adminEmailOrName: string,
    notes?: string
  ) {
    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
      include: {
        donor: true,
        cycle: { include: { campaign: true } },
      },
    });

    if (!transaction) {
      throw new Error('سجل المعاملة غير موجود');
    }

    if (transaction.verificationSource !== VERIFICATION_SOURCE.MANUAL_REVIEW) {
      throw new Error('لا يمكن تعديل معاملات البوابة الإلكترونية يدوياً');
    }

    if (transaction.approvalStatus !== APPROVAL_STATUS.PENDING) {
      throw new Error(`تمت مراجعة هذا الإيصال مسبقاً (الحالة الحالية: ${transaction.approvalStatus})`);
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        approvalStatus: status,
        reviewedAt: new Date(),
        reviewedBy: adminEmailOrName,
        notes: notes || (status === 'approved' ? 'تم اعتماد الإيصال من المسؤول' : 'تم رفض الإيصال'),
      },
      include: {
        donor: true,
        cycle: { include: { campaign: true } },
      },
    });

    if (status === 'approved' && transaction.cycleId && transaction.cycle) {
      const currentPaid = transaction.cycle.paidAmount || 0;
      const newPaidAmount = currentPaid + transaction.amount;
      const expectedAmount = transaction.cycle.cycleExpectedAmount || 0;

      const isFullyPaid = newPaidAmount >= expectedAmount;
      const newCycleStatus = isFullyPaid ? CYCLE_STATUS.PAID : CYCLE_STATUS.PARTIALLY_PAID;

      // Update cycle paidAmount and status
      await prisma.donationCycle.update({
        where: { id: transaction.cycleId },
        data: {
          paidAmount: newPaidAmount,
          status: newCycleStatus,
          notes: isFullyPaid
            ? `تم السداد بالكامل باعتماد الإيصال من المسؤول: ${adminEmailOrName}`
            : `سداد جزئي (${newPaidAmount}/${expectedAmount} ج.م) باعتماد المسؤول: ${adminEmailOrName}`,
        },
      });

      // Update campaign currentAmount
      if (transaction.cycle.campaignId) {
        await prisma.campaign.update({
          where: { id: transaction.cycle.campaignId },
          data: {
            currentAmount: { increment: transaction.amount },
          },
        });
      }

      // Mark manual receipt alerts as resolved
      await prisma.adminAlert.updateMany({
        where: {
          cycleId: transaction.cycleId,
          alertType: ALERT_TYPE.MANUAL_RECEIPT_PENDING,
          isResolved: false,
        },
        data: {
          isResolved: true,
          resolvedAt: new Date(),
        },
      });

      if (isFullyPaid) {
        await prisma.adminAlert.updateMany({
          where: {
            cycleId: transaction.cycleId,
            isResolved: false,
          },
          data: {
            isResolved: true,
            resolvedAt: new Date(),
          },
        });
      }
    }

    return updatedTransaction;
  }

  /**
   * Get pending manual receipts for admin review queue
   */
  static async getPendingReceipts() {
    return await prisma.transaction.findMany({
      where: {
        approvalStatus: APPROVAL_STATUS.PENDING,
        verificationSource: VERIFICATION_SOURCE.MANUAL_REVIEW,
      },
      include: {
        donor: true,
        cycle: {
          include: { campaign: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get all transactions with filters
   */
  static async getAllTransactions(status?: string, method?: string, source?: string) {
    const where: any = {};
    if (status) where.approvalStatus = status;
    if (method) where.paymentMethod = method;
    if (source) where.verificationSource = source;

    return await prisma.transaction.findMany({
      where,
      include: {
        donor: true,
        cycle: {
          include: { campaign: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
