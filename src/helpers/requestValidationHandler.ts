import { NextFunction, Request, Response } from 'express';
import { ValidationError } from 'express-validation';
import { logger } from '@/helpers/logger';
import { responseError } from '@/helpers/response';

export default (error: ValidationError, _req: Request, res: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    logger.error(error);
    return responseError(res, error.details.body[0].message.replace(/(\")/g, ''));
  }

  return next(error);
};
