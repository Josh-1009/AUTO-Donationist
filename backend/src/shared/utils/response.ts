import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = 'تمت العملية بنجاح',
  statusCode: number = 200
) => {
  return res.status(statusCode).json({
    success: true,
    data,
    message,
  });
};

export const sendError = (
  res: Response,
  message: string = 'حدث خطأ أثناء معالجة الطلب',
  statusCode: number = 400,
  error?: any
) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(error ? { error } : {}),
  });
};
