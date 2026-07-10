import httpStatus from 'http-status';
import HttpError from '@/commons/http-errors/HttpError';
import messages from '@/commons/messages';

export default class ForbiddenError extends HttpError {
  constructor(message = messages.httpMessage[403]) {
    super(message);

    Object.setPrototypeOf(this, ForbiddenError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.FORBIDDEN;
  }
}
