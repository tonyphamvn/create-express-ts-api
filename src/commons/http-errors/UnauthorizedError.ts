import httpStatus from 'http-status';
import HttpError from '@/commons/http-errors/HttpError';
import messages from '@/commons/messages';

export default class UnauthorizedError extends HttpError {
  constructor(message = messages.httpMessage[401]) {
    super(message);

    Object.setPrototypeOf(this, UnauthorizedError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.UNAUTHORIZED;
  }
}
