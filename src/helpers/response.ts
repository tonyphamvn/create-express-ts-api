import { Response } from 'express';
import httpStatus from 'http-status';
import messages from '@/commons/messages';

export function responseError(res: Response, message: string = messages.generalMessage.Error) {
  res.json({ success: false, message });
}

export function responseSuccess(res: Response, data?: any, statusCode: number = httpStatus.OK) {
  if (statusCode === httpStatus.NO_CONTENT) {
    res.status(statusCode);
  } else {
    res.status(statusCode).json({ success: true, message: messages.generalMessage.success, data });
  }
}
