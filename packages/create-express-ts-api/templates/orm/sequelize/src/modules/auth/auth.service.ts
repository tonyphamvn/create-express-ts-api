import { AuthResponse, UserModel, UserStatic } from '@/types/user.types';
import { generateToken } from '@/libs/passport';
import userModel from '@/models/user.model';
import Bcrypt from '@/libs/bcrypt';
import { ConflictError, EntityNotFoundError } from '@/shared/errors';
import messages from '@/shared/messages';

class AuthService {
  private userModel: UserStatic;

  constructor() {
    this.userModel = userModel;
  }

  public async register(email: string, password: string): Promise<AuthResponse> {
    const existing = await this.userModel.findOne({ where: { email } });

    if (existing) {
      throw new ConflictError(messages.auth.userExists);
    }

    const user = await this.userModel.create({
      email,
      password: await Bcrypt.generateHashPassword(password),
    });

    return { token: generateToken(user) };
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    const user = await this.checkAuthenticated(email, password);
    if (!user) {
      throw new EntityNotFoundError();
    }
    const token = generateToken(user);

    return { token };
  }

  private async checkAuthenticated(email: string, password: string): Promise<UserModel | null> {
    const user = await this.userModel.findOne({ where: { email } });

    if (user?.password) {
      const compare = await Bcrypt.comparePassword(password, user.password);
      if (!compare) {
        return null;
      }
    }

    return user;
  }
}

export default AuthService;
