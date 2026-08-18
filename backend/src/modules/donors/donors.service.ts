import prisma from '../../config/database';
import { generateDonorCode } from '../../shared/utils/code-generator';
import { WhatsAppService } from '../notifications/whatsapp.service';

export interface RegisterDonorDto {
  fullName: string;
  phone: string;
  phoneSecondary?: string;
  address?: string;
  dept?: string;
  academicYear?: string;
  committedAmount?: number;
  preferredMethod?: string;
  campaignId?: string;
  notes?: string;
}

export class DonorsService {
  /**
   * Register new donor
   */
  static async register(dto: RegisterDonorDto) {
    const cleanPhone = dto.phone.trim();

    // Check if phone already registered
    const existing = await prisma.donor.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      throw new Error(`رقم الهاتف مسجل مسبقاً للمتبرع (${existing.fullName}) بالكود ${existing.donorCode}`);
    }

    const donorCode = await generateDonorCode();

    const donor = await prisma.donor.create({
      data: {
        donorCode,
        fullName: dto.fullName.trim(),
        phone: cleanPhone,
        phoneSecondary: dto.phoneSecondary?.trim() || null,
        address: dto.address?.trim() || null,
        dept: dto.dept?.trim() || null,
        academicYear: dto.academicYear || null,
        committedAmount: dto.committedAmount || 500,
        preferredMethod: dto.preferredMethod || 'cash_office',
        notes: dto.notes || null,
        status: 'active',
      },
    });

    // Create initial monthly cycle if campaign specified
    if (dto.campaignId) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      await prisma.donationCycle.create({
        data: {
          donorId: donor.id,
          campaignId: dto.campaignId,
          cycleMonth: currentMonth,
          cycleExpectedAmount: donor.committedAmount,
          paidAmount: 0,
          status: 'pending',
          postponeCount: 0,
          skipCount: 0,
        },
      });
    }

    return await this.getById(donor.id);
  }

  /**
   * Get all donors with search & filters
   */
  static async getAll(search?: string, status?: string, preferredMethod?: string) {
    const where: any = {};

    if (status) where.status = status;
    if (preferredMethod) where.preferredMethod = preferredMethod;

    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { phone: { contains: search } },
        { phoneSecondary: { contains: search } },
        { donorCode: { contains: search } },
        { address: { contains: search } },
        { dept: { contains: search } },
      ];
    }

    const donors = await prisma.donor.findMany({
      where,
      include: {
        cycles: {
          include: { campaign: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { vouchers: true, cycles: true, followups: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return donors.map((d) => {
      const latestCycle = d.cycles[0];
      const reminderWhatsAppUrl = latestCycle
        ? WhatsAppService.getReminderWhatsAppUrl(
            d.phone,
            d.fullName,
            d.donorCode,
            latestCycle.campaign?.title || 'الحملة الشهرية',
            latestCycle.cycleExpectedAmount,
            latestCycle.cycleMonth
          )
        : WhatsAppService.generateDirectWhatsAppUrl(d.phone, `السلام عليكم أستاذ ${d.fullName}، نتشرف بالتواصل معكم من الجمعية الخيرية 🤍`);

      return {
        ...d,
        reminderWhatsAppUrl,
      };
    });
  }

  /**
   * Get donor by ID with full history (cycles, vouchers, followups)
   */
  static async getById(id: string) {
    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        cycles: {
          include: { campaign: true, vouchers: true },
          orderBy: { createdAt: 'desc' },
        },
        vouchers: {
          include: { campaign: true },
          orderBy: { receiptDate: 'desc' },
        },
        followups: {
          orderBy: { contactedAt: 'desc' },
        },
      },
    });

    if (!donor) {
      throw new Error('المتبرع غير موجود');
    }

    const latestCycle = donor.cycles[0];
    const reminderWhatsAppUrl = latestCycle
      ? WhatsAppService.getReminderWhatsAppUrl(
          donor.phone,
          donor.fullName,
          donor.donorCode,
          latestCycle.campaign?.title || 'الحملة الشهرية',
          latestCycle.cycleExpectedAmount,
          latestCycle.cycleMonth
        )
      : WhatsAppService.generateDirectWhatsAppUrl(donor.phone, `السلام عليكم أستاذ ${donor.fullName}، نتشرف بالتواصل معكم من الجمعية الخيرية 🤍`);

    return {
      ...donor,
      reminderWhatsAppUrl,
    };
  }

  /**
   * Update donor profile
   */
  static async update(id: string, data: Partial<RegisterDonorDto> & { status?: string }) {
    return await prisma.donor.update({
      where: { id },
      data,
    });
  }

  /**
   * Delete donor
   */
  static async delete(id: string) {
    return await prisma.donor.delete({
      where: { id },
    });
  }
}
