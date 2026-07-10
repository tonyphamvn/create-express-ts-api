import httpStatus from 'http-status';
import HttpError from '@/commons/http-errors/HttpError';
import messages from '@/commons/messages';

export default class BadGatewayError extends HttpError {
  constructor(message = messages.httpMessage[502]) {
    super(message);

    Object.setPrototypeOf(this, BadGatewayError.prototype);
    this.name = this.constructor.name;
    this.statusCode = httpStatus.BAD_GATEWAY;
  }
}
