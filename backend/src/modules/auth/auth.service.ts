import prisma from '../../config/database';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../config/app.config';
import { generateDonorCode } from '../../shared/utils/code-generator';

export interface GoogleAuthDto {
  credential?: string;
  googleId?: string;
  email?: string;
  name?: string;
  picture?: string;
  phone?: string;
  academicYear?: string;
  dept?: string;
}

export class AuthService {
  /**
   * Google Sign-In & Onboarding
   * Stateless authentication via Google OAuth.
   * If user doesn't exist, automatically provisions a donor account with DNR-XXX.
   * Checks if user is an Admin (via admins table).
   */
  static async authenticateWithGoogle(dto: GoogleAuthDto) {
    let googleId = dto.googleId;
    let email = dto.email;
    let name = dto.name;
    let picture = dto.picture;

    // Decode Google ID token if passed as credential
    if (dto.credential && (!googleId || !email)) {
      try {
        const decoded = jwt.decode(dto.credential) as any;
        if (decoded) {
          googleId = googleId || decoded.sub || decoded.user_id;
          email = email || decoded.email;
          name = name || decoded.name;
          picture = picture || decoded.picture;
        }
      } catch (err) {
        console.warn('Failed to parse Google credential token, using fallback fields');
      }
    }

    if (!email && !googleId) {
      throw new Error('بيانات Google Sign-In غير صالحة: يجب توفر البريد أو Google ID');
    }

    const cleanEmail = email ? email.trim().toLowerCase() : undefined;
    const cleanGoogleId = googleId ? googleId.trim() : undefined;

    // 1. Check if user is an Admin
    let admin = null;
    if (cleanEmail || cleanGoogleId) {
      admin = await prisma.admin.findFirst({
        where: {
          OR: [
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
            ...(cleanGoogleId ? [{ googleId: cleanGoogleId }] : []),
          ],
        },
      });

      // Update admin googleId if matched by email
      if (admin && cleanGoogleId && admin.googleId !== cleanGoogleId) {
        admin = await prisma.admin.update({
          where: { id: admin.id },
          data: { googleId: cleanGoogleId, fullName: name || admin.fullName },
        });
      }
    }

    // 2. Check if Donor exists
    let donor = null;
    let isNewDonor = false;

    if (cleanGoogleId || cleanEmail) {
      donor = await prisma.donor.findFirst({
        where: {
          OR: [
            ...(cleanGoogleId ? [{ googleId: cleanGoogleId }] : []),
            ...(cleanEmail ? [{ email: cleanEmail }] : []),
          ],
        },
        include: {
          cycles: {
            include: { campaign: true },
            orderBy: { createdAt: 'desc' },
            take: 5,
          },
        },
      });
    }

    // 3. If Donor does not exist, provision a new one
    if (!donor) {
      const donorCode = await generateDonorCode();
      donor = await prisma.donor.create({
        data: {
          googleId: cleanGoogleId,
          email: cleanEmail,
          donorCode,
          fullName: name?.trim() || `متبرع ${donorCode}`,
          phone: dto.phone?.trim() || null,
          academicYear: dto.academicYear || null,
          dept: dto.dept || null,
          status: 'active',
          committedAmount: 500,
        },
        include: {
          cycles: {
            include: { campaign: true },
          },
        },
      });
      isNewDonor = true;
    } else {
      // Update Google ID or Email if missing
      if ((cleanGoogleId && !donor.googleId) || (cleanEmail && !donor.email)) {
        donor = await prisma.donor.update({
          where: { id: donor.id },
          data: {
            googleId: cleanGoogleId || donor.googleId,
            email: cleanEmail || donor.email,
            fullName: donor.fullName === 'متبرع جديد' && name ? name : donor.fullName,
          },
          include: {
            cycles: {
              include: { campaign: true },
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
          },
        });
      }
    }

    // 4. Issue stateless JWT
    const role = admin ? 'ADMIN' : 'DONOR';
    const token = jwt.sign(
      {
        id: donor ? donor.id : (admin ? admin.id : 'unknown'),
        donorId: donor?.id,
        adminId: admin?.id,
        email: cleanEmail,
        googleId: cleanGoogleId,
        donorCode: donor?.donorCode,
        fullName: donor?.fullName || admin?.fullName || name,
        role,
        permissions: admin?.permissions || 'none',
      },
      appConfig.jwtSecret,
      { expiresIn: appConfig.jwtExpiresIn }
    );

    return {
      token,
      role,
      permissions: admin?.permissions || null,
      donor: {
        id: donor.id,
        donorCode: donor.donorCode,
        fullName: donor.fullName,
        email: donor.email,
        phone: donor.phone,
        status: donor.status,
        academicYear: donor.academicYear,
        dept: donor.dept,
        committedAmount: donor.committedAmount,
      },
      admin: admin
        ? {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName,
            permissions: admin.permissions,
          }
        : null,
      isNewDonor,
    };
  }

  /**
   * Get Me (Donor or Admin) from Token ID
   */
  static async getMe(userId: string, role?: string) {
    if (role === 'ADMIN') {
      const admin = await prisma.admin.findUnique({
        where: { id: userId },
      });
      if (admin) {
        return { type: 'admin', admin };
      }
    }

    const donor = await prisma.donor.findUnique({
      where: { id: userId },
      include: {
        cycles: {
          include: { campaign: true, transactions: true },
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        oneTimeDonations: {
          include: { campaign: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return { type: 'donor', donor };
  }
}
