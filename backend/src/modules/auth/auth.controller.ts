import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { sendSuccess, sendError } from '../../shared/utils/response';
import { AuthRequest } from '../../shared/middleware/auth.middleware';

export class AuthController {
  /**
   * POST /api/v1/auth/google
   * Public Google Sign-In endpoint
   */
  static async googleLogin(req: Request, res: Response) {
    try {
      const { credential, googleId, email, name, picture, phone, academicYear, dept } = req.body;
      const result = await AuthService.authenticateWithGoogle({
        credential,
        googleId,
        email,
        name,
        picture,
        phone,
        academicYear,
        dept,
      });

      return sendSuccess(res, result, result.isNewDonor ? 'تم إنشاء حساب المتبرع وتسجيل الدخول بنجاح' : 'تم تسجيل الدخول بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل تسجيل الدخول عبر Google', 400);
    }
  }

  /**
   * GET /api/v1/auth/me
   * Retrieve current user profile (Admin or Donor)
   */
  static async getMe(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return sendError(res, 'غير مصرح', 401);
      }

      const me = await AuthService.getMe(req.user.id, req.user.role);
      return sendSuccess(res, me, 'تم جلب البيانات بنجاح');
    } catch (error: any) {
      return sendError(res, error.message || 'فشل جلب البيانات', 400);
    }
  }
}
