import prisma from '../../config/database';
import { CYCLE_STATUS, MAX_POSTPONE_DAYS, MAX_SKIP_MONTHS } from '../../shared/constants';
import { WhatsAppService } from '../notifications/whatsapp.service';

export class CyclesService {
  /**
   * Postpone cycle collection date
   */
  static async postpone(cycleId: string, notes?: string, customDate?: string) {
    const cycle = await prisma.donationCycle.findUnique({
      where: { id: cycleId },
      include: { donor: true, campaign: true },
    });

    if (!cycle) {
      throw new Error('دورة التبرع غير موجودة');
    }

    if (cycle.status === CYCLE_STATUS.PAID) {
      throw new Error('تم تحصيل هذه الدورة بالكامل مسبقاً');
    }

    const newPostponeCount = cycle.postponeCount + 1;
    const postponedUntil = customDate ? new Date(customDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);

    const newStatus = newPostponeCount >= MAX_POSTPONE_DAYS ? CYCLE_STATUS.NEEDS_FOLLOWUP : CYCLE_STATUS.POSTPONED;

    const updated = await prisma.donationCycle.update({
      where: { id: cycleId },
      data: {
        postponeCount: newPostponeCount,
        postponedUntil,
        status: newStatus,
        notes: notes ? (cycle.notes ? `${cycle.notes} | تأجيل: ${notes}` : `تأجيل: ${notes}`) : cycle.notes,
      },
      include: { donor: true, campaign: true },
    });

    return updated;
  }

  /**
   * Skip current month cycle
   */
  static async skip(cycleId: string, reason?: string) {
    const cycle = await prisma.donationCycle.findUnique({
      where: { id: cycleId },
      include: { donor: true, campaign: true },
    });

    if (!cycle) {
      throw new Error('دورة التبرع غير موجودة');
    }

    const newSkipCount = cycle.skipCount + 1;
    const newStatus = newSkipCount >= MAX_SKIP_MONTHS ? CYCLE_STATUS.NEEDS_FOLLOWUP : CYCLE_STATUS.SKIPPED;

    const updated = await prisma.donationCycle.update({
      where: { id: cycleId },
      data: {
        skipCount: newSkipCount,
        status: newStatus,
        notes: reason ? (cycle.notes ? `${cycle.notes} | تخطي: ${reason}` : `تخطي: ${reason}`) : 'تم تخطي الدورة للشهر الحالي',
      },
      include: { donor: true, campaign: true },
    });

    return updated;
  }

  /**
   * Generate monthly commitments for all active donors (1st of month)
   */
  static async generateMonthlyCycles(targetMonth?: string) {
    const currentMonth = targetMonth || new Date().toISOString().slice(0, 7);

    const activeDonors = await prisma.donor.findMany({
      where: { status: 'active' },
    });

    const defaultCampaign = await prisma.campaign.findFirst({
      where: { isActive: true, donationType: 'recurring' },
    });

    if (!defaultCampaign) {
      return { success: true, message: 'لا توجد حملة دورية نشطة حالياً', createdCount: 0 };
    }

    let createdCount = 0;
    for (const donor of activeDonors) {
      const existing = await prisma.donationCycle.findFirst({
        where: {
          donorId: donor.id,
          campaignId: defaultCampaign.id,
          cycleMonth: currentMonth,
        },
      });

      if (!existing) {
        await prisma.donationCycle.create({
          data: {
            donorId: donor.id,
            campaignId: defaultCampaign.id,
            cycleMonth: currentMonth,
            cycleExpectedAmount: donor.committedAmount,
            paidAmount: 0,
            status: CYCLE_STATUS.PENDING,
          },
        });
        createdCount++;
      }
    }

    return {
      success: true,
      currentMonth,
      activeDonorsCount: activeDonors.length,
      createdCount,
    };
  }

  /**
   * Get Overdue & Follow-up list for charity collectors / follow-up team
   */
  static async getOverdueAndFollowups() {
    const overdueCycles = await prisma.donationCycle.findMany({
      where: {
        OR: [
          { status: CYCLE_STATUS.NEEDS_FOLLOWUP },
          { status: CYCLE_STATUS.POSTPONED },
          { status: CYCLE_STATUS.PENDING },
        ],
        paidAmount: { lt: prisma.donationCycle.fields.cycleExpectedAmount },
      },
      include: {
        donor: true,
        campaign: true,
        followups: {
          orderBy: { contactedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return overdueCycles.map((cycle) => {
      const followupWhatsAppUrl = WhatsAppService.getFollowupWhatsAppUrl(
        cycle.donor.phone,
        cycle.donor.fullName,
        cycle.donor.donorCode,
        cycle.campaign.title,
        cycle.cycleExpectedAmount - cycle.paidAmount
      );

      const latestFollowup = cycle.followups[0] || null;

      return {
        id: cycle.id,
        donorId: cycle.donorId,
        donorCode: cycle.donor.donorCode,
        donorName: cycle.donor.fullName,
        phone: cycle.donor.phone,
        phoneSecondary: cycle.donor.phoneSecondary,
        address: cycle.donor.address || 'العنوان غير مسجل',
        dept: cycle.donor.dept || 'عام',
        preferredMethod: cycle.donor.preferredMethod,
        campaignId: cycle.campaignId,
        campaignTitle: cycle.campaign.title,
        cycleMonth: cycle.cycleMonth,
        cycleExpectedAmount: cycle.cycleExpectedAmount,
        paidAmount: cycle.paidAmount,
        remainingAmount: Math.max(0, cycle.cycleExpectedAmount - cycle.paidAmount),
        status: cycle.status,
        postponeCount: cycle.postponeCount,
        skipCount: cycle.skipCount,
        postponedUntil: cycle.postponedUntil,
        notes: cycle.notes,
        latestFollowup,
        followupWhatsAppUrl,
      };
    });
  }

  /**
   * Get cycle by ID
   */
  static async getById(id: string) {
    return await prisma.donationCycle.findUnique({
      where: { id },
      include: {
        donor: true,
        campaign: true,
        vouchers: true,
        followups: true,
      },
    });
  }
}
