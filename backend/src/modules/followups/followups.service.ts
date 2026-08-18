import prisma from '../../config/database';

export interface LogFollowupDto {
  donorId: string;
  cycleId?: string;
  contactType?: string; // whatsapp, phone_call, field_visit, sms
  outcome?: string; // promised_to_pay, postponed, skipped, unreachable, contacted_ok
  notes?: string;
  contactedBy?: string;
}

export class FollowupsService {
  /**
   * Log communication or field follow-up with donor
   */
  static async logFollowup(dto: LogFollowupDto) {
    const donor = await prisma.donor.findUnique({
      where: { id: dto.donorId },
    });

    if (!donor) {
      throw new Error('المتبرع غير موجود');
    }

    const log = await prisma.followupLog.create({
      data: {
        donorId: donor.id,
        cycleId: dto.cycleId || undefined,
        contactType: dto.contactType || 'whatsapp',
        outcome: dto.outcome || 'contacted_ok',
        notes: dto.notes || null,
        contactedBy: dto.contactedBy || 'مسؤول المتابعة',
      },
      include: {
        donor: true,
        cycle: true,
      },
    });

    // Update cycle notes if cycleId present
    if (dto.cycleId && dto.notes) {
      const cycle = await prisma.donationCycle.findUnique({ where: { id: dto.cycleId } });
      if (cycle) {
        await prisma.donationCycle.update({
          where: { id: cycle.id },
          data: {
            notes: cycle.notes ? `${cycle.notes} | متابعة: ${dto.notes}` : `متابعة: ${dto.notes}`,
          },
        });
      }
    }

    return log;
  }

  /**
   * Get all followup logs
   */
  static async getAll(donorId?: string) {
    const where = donorId ? { donorId } : {};
    return await prisma.followupLog.findMany({
      where,
      include: {
        donor: true,
        cycle: { include: { campaign: true } },
      },
      orderBy: { contactedAt: 'desc' },
    });
  }
}
