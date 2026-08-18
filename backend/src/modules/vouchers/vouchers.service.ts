import prisma from '../../config/database';
import { tafqeet } from '../../shared/utils/tafqeet';
import { WhatsAppService } from '../notifications/whatsapp.service';
import { CYCLE_STATUS } from '../../shared/constants';

export interface CreateVoucherDto {
  donorId: string;
  campaignId: string;
  amount: number;
  paymentMethod?: string;
  collectorName?: string;
  receivedBy?: string;
  cycleId?: string;
  notes?: string;
  receiptDate?: string;
}

export class VouchersService {
  /**
   * Create & Issue Official Cash Receipt Voucher
   */
  static async createVoucher(dto: CreateVoucherDto) {
    const donor = await prisma.donor.findUnique({
      where: { id: dto.donorId },
    });

    if (!donor) {
      throw new Error('المتبرع غير موجود');
    }

    const campaign = await prisma.campaign.findUnique({
      where: { id: dto.campaignId },
    });

    if (!campaign) {
      throw new Error('الحملة غير موجودة');
    }

    if (dto.amount <= 0) {
      throw new Error('يرجى إدخال مبلغ تحصيل صحيح');
    }

    // 1. Generate sequential Voucher Number (REC-2026-XXXX)
    const currentYear = new Date().getFullYear();
    const count = await prisma.receiptVoucher.count();
    const voucherNumber = `REC-${currentYear}-${(count + 1001).toString()}`;

    // 2. Create ReceiptVoucher record
    const voucher = await prisma.receiptVoucher.create({
      data: {
        voucherNumber,
        donorId: donor.id,
        campaignId: campaign.id,
        cycleId: dto.cycleId || undefined,
        amount: dto.amount,
        paymentMethod: dto.paymentMethod || 'cash',
        collectorName: dto.collectorName || null,
        receivedBy: dto.receivedBy || 'أمين الصندوق',
        receiptDate: dto.receiptDate ? new Date(dto.receiptDate) : new Date(),
        notes: dto.notes || null,
      },
      include: {
        donor: true,
        campaign: true,
        cycle: true,
      },
    });

    // 3. Update Cycle paidAmount if cycleId attached
    if (dto.cycleId) {
      const cycle = await prisma.donationCycle.findUnique({
        where: { id: dto.cycleId },
      });

      if (cycle) {
        const newPaidAmount = cycle.paidAmount + dto.amount;
        const isFullyPaid = newPaidAmount >= cycle.cycleExpectedAmount;
        const newStatus = isFullyPaid ? CYCLE_STATUS.PAID : CYCLE_STATUS.PARTIALLY_PAID;

        await prisma.donationCycle.update({
          where: { id: cycle.id },
          data: {
            paidAmount: newPaidAmount,
            status: newStatus,
            notes: isFullyPaid
              ? `تم التحصيل بالكامل بموجب سند قبض رقم ${voucherNumber}`
              : `تحصيل جزئي (${newPaidAmount}/${cycle.cycleExpectedAmount} ج.م) بموجب سند ${voucherNumber}`,
          },
        });
      }
    }

    // 4. Increment campaign currentAmount
    await prisma.campaign.update({
      where: { id: campaign.id },
      data: { currentAmount: { increment: dto.amount } },
    });

    // 5. Generate formatted Tafqeet & WhatsApp thank you URL
    const amountInWords = tafqeet(dto.amount);
    const thankYouWhatsAppUrl = WhatsAppService.getReceiptThankYouUrl(
      donor.phone,
      donor.fullName,
      donor.donorCode,
      dto.amount,
      voucherNumber,
      campaign.title
    );

    return {
      ...voucher,
      amountInWords,
      thankYouWhatsAppUrl,
    };
  }

  /**
   * Get all vouchers with filters
   */
  static async getAll(search?: string, paymentMethod?: string, campaignId?: string) {
    const where: any = {};

    if (paymentMethod) where.paymentMethod = paymentMethod;
    if (campaignId) where.campaignId = campaignId;

    if (search) {
      where.OR = [
        { voucherNumber: { contains: search } },
        { donor: { fullName: { contains: search } } },
        { donor: { donorCode: { contains: search } } },
        { donor: { phone: { contains: search } } },
        { collectorName: { contains: search } },
      ];
    }

    const vouchers = await prisma.receiptVoucher.findMany({
      where,
      include: {
        donor: true,
        campaign: true,
        cycle: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return vouchers.map((v) => ({
      ...v,
      amountInWords: tafqeet(v.amount),
      thankYouWhatsAppUrl: WhatsAppService.getReceiptThankYouUrl(
        v.donor.phone,
        v.donor.fullName,
        v.donor.donorCode,
        v.amount,
        v.voucherNumber,
        v.campaign.title
      ),
    }));
  }

  /**
   * Get single voucher by ID or VoucherNumber for printing
   */
  static async getById(idOrNumber: string) {
    const voucher = await prisma.receiptVoucher.findFirst({
      where: {
        OR: [{ id: idOrNumber }, { voucherNumber: idOrNumber }],
      },
      include: {
        donor: true,
        campaign: true,
        cycle: true,
      },
    });

    if (!voucher) {
      throw new Error('سند القبض غير موجود');
    }

    return {
      ...voucher,
      amountInWords: tafqeet(voucher.amount),
      thankYouWhatsAppUrl: WhatsAppService.getReceiptThankYouUrl(
        voucher.donor.phone,
        voucher.donor.fullName,
        voucher.donor.donorCode,
        voucher.amount,
        voucher.voucherNumber,
        voucher.campaign.title
      ),
    };
  }
}
