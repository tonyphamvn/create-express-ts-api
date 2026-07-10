import { NextFunction, Request, Response } from 'express';
import { responseSuccess } from '@/helpers/response';
import AuthService from '@/modules/auth/auth.service';
import { BadRequestError } from '@/commons/http-errors';
class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public login = async (req: Request, res: Response, _next: NextFunction) => {
    const { email, password } = req.body;

    const data = await this.authService.login(email, password);
    if (!data) {
      throw new BadRequestError();
    }
    return responseSuccess(res, data);
  };
}
export default AuthController;
