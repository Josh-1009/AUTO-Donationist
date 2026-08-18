import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { appConfig } from '../../config/app.config';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: 'ADMIN' | 'DONOR';
    permissions?: string; // full, approvals_only, reports_only
    donorCode?: string;
    googleId?: string;
  };
}

export const authenticateAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'غير مصرح: يجب تسجيل الدخول كمسؤول أولاً', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, appConfig.jwtSecret) as any;

    if (decoded.role !== 'ADMIN' && decoded.role !== 'SUPERADMIN') {
      return sendError(res, 'غير مصرح: صلاحيات المسؤول مطلوبة', 403);
    }

    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'جلسة غير صالحة أو منتهية الصلاحية', 401);
  }
};

export const authenticateDonor = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'غير مصرح: يجب تسجيل الدخول كمتبرع أولاً', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, appConfig.jwtSecret) as any;

    req.user = decoded;
    next();
  } catch (error: any) {
    return sendError(res, 'جلسة غير صالحة أو منتهية الصلاحية', 401);
  }
};

export const authenticateOptional = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, appConfig.jwtSecret) as any;
      req.user = decoded;
    }
  } catch (error) {
    // Ignore optional auth failure
  }
  next();
};
