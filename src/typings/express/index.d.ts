/* eslint-disable */
// Twilio brought @types/express meaning that all reqs are typed with Request class
import { UserStatic } from '@/interfaces/user';
declare namespace Express {
  export interface Request {
    user?: UserStatic;
  }
}
