import prisma from '../../config/database';
import { DONATION_TYPE } from '../../shared/constants';

export interface CreateCampaignDto {
  title: string;
  slug?: string;
  description?: string;
  campaignTotalTarget: number;
  donationType?: 'recurring' | 'one_time';
  whatsappTemplate?: string;
  isActive?: boolean;
}

export class CampaignsService {
  static async getAll(onlyActive: boolean = false) {
    const where = onlyActive ? { isActive: true } : {};
    return await prisma.campaign.findMany({
      where,
      include: {
        _count: {
          select: { cycles: true, vouchers: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: string) {
    return await prisma.campaign.findUnique({
      where: { id },
      include: {
        cycles: {
          include: { donor: true },
          orderBy: { createdAt: 'desc' },
        },
        vouchers: {
          include: { donor: true },
          orderBy: { receiptDate: 'desc' },
        },
      },
    });
  }

  static async getBySlug(slug: string) {
    return await prisma.campaign.findUnique({
      where: { slug },
      include: {
        cycles: { include: { donor: true } },
      },
    });
  }

  static async create(dto: CreateCampaignDto) {
    const slug =
      dto.slug ||
      dto.title
        .toLowerCase()
        .replace(/[\s\W-]+/g, '-')
        .replace(/^-+|-+$/g, '') ||
      `campaign-${Date.now()}`;

    return await prisma.campaign.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        campaignTotalTarget: dto.campaignTotalTarget || 0,
        donationType: dto.donationType || DONATION_TYPE.RECURRING,
        whatsappTemplate: dto.whatsappTemplate,
        isActive: dto.isActive !== undefined ? dto.isActive : true,
      },
    });
  }

  static async update(id: string, dto: Partial<CreateCampaignDto>) {
    return await prisma.campaign.update({
      where: { id },
      data: dto,
    });
  }

  static async delete(id: string) {
    return await prisma.campaign.delete({
      where: { id },
    });
  }
}
