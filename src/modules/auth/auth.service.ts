import { AuthResponse, UserModel, UserStatic } from '@/interfaces/user';
import { generateToken } from '@/libs/passports';
import userModel from '@/models/user.model';
import Bcrypt from '@/libs/bcrypt';
import { EntityNotFoundError } from '@/commons/http-errors';

class AuthService {
  private userModel: UserStatic;

  constructor() {
    this.userModel = userModel;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.checkAuthenticated(email, password);
    if (!user) {
      throw new EntityNotFoundError();
    }
    const token = generateToken(user);

    return { token };
  }

  private async checkAuthenticated(email: string, password: string): Promise<UserModel> {
    const user = await this.userModel.findOne({ where: { email } });
    if (!user) {
      return undefined;
    }
    const compare = await Bcrypt.comparePassword(password, user.password);
    if (!compare) {
      return undefined;
    }

    return user;
  }
}

export default AuthService;
