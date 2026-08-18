import prisma from '../../config/database';

export class ExportService {
  /**
   * Export transactions data report
   */
  static async exportTransactionsReport() {
    const transactions = await prisma.transaction.findMany({
      include: {
        donor: true,
        cycle: { include: { campaign: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return transactions.map((t) => ({
      transactionId: t.id,
      date: t.createdAt.toISOString().slice(0, 10),
      donorCode: t.donor.donorCode,
      donorName: t.donor.fullName,
      phone: t.donor.phone,
      campaign: t.cycle?.campaign?.title || 'عام',
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      approvalStatus: t.approvalStatus,
      reviewedBy: t.reviewedBy || '-',
      notes: t.notes || '-',
    }));
  }

  /**
   * Export donors directory report
   */
  static async exportDonorsReport() {
    const donors = await prisma.donor.findMany({
      include: {
        cycles: { include: { campaign: true } },
        _count: { select: { transactions: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return donors.map((d) => ({
      donorCode: d.donorCode,
      fullName: d.fullName,
      phone: d.phone,
      academicYear: d.academicYear || '-',
      dept: d.dept || '-',
      status: d.status,
      activeCampaigns: d.cycles.map((c) => c.campaign.title).join(', ') || '-',
      transactionsCount: d._count.transactions,
      registeredAt: d.createdAt.toISOString().slice(0, 10),
    }));
  }

  /**
   * Export 5-day overdue / escalated list report
   */
  static async exportOverdueReport() {
    const overdue = await prisma.donationCycle.findMany({
      where: {
        OR: [
          { status: 'ESCALATED_ADMIN' },
          { postponeCount: { gte: 5 } },
        ],
      },
      include: {
        donor: true,
        campaign: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    return overdue.map((c) => ({
      donorCode: c.donor.donorCode,
      donorName: c.donor.fullName,
      phone: c.donor.phone,
      dept: c.donor.dept || '-',
      academicYear: c.donor.academicYear || '-',
      campaign: c.campaign.title,
      targetAmount: c.targetAmount,
      cycleMonth: c.cycleMonth,
      postponeCount: c.postponeCount,
      status: c.status,
      lastPostponedDate: c.postponedUntil ? c.postponedUntil.toISOString().slice(0, 10) : '-',
    }));
  }
}
