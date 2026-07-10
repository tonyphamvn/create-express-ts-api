/**
 * Controller wrapper
 * Handle error throw from controllers
 */

import { NextFunction, Request, Response } from 'express';
import util from 'util';
import { logger } from '@/helpers/logger';

export default (callback: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    return await Promise.resolve(callback(req, res, next));
  } catch (error) {
    // If this is a promise rejection, the error would be anything that pass to reject() method.
    // most of the cases it will not be an error object.
    // However, when we call next(error) here, the API will still response 500 back
    // correctly, not sure who is in charge of the sendResponse call.
    // But if the controller rejection is not wrapped here, it throws directly to express route, express
    // was not able to pass it correctly to the global error handler.
    if (error) {
      try {
        // in case global.loggerServer itself cause exception
        logger.log({
          level: 'error',
          error: util.format(error),
          message: 'error catch by controller wrapper.',
          data: { url: req.url, method: req.method, errorType: typeof error },
        });
      } catch (_error) {
        // ignore it
      } finally {
        if (error instanceof Error) {
          next(error);
        } else {
          next(new Error(`Unhandled promise rejection: ${JSON.stringify(error)}`));
        }
      }
    } else {
      // Likely caused by Promise rejection with empty data.
      next(new Error('Unknown Error Occurred'));
    }
  }
};
