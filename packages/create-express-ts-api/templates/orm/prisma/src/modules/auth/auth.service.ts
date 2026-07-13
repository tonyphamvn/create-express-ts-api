import { AuthResponse, UserAttributes } from '@/types/user.types';
import { generateToken } from '@/libs/passport';
import prisma from '@/libs/prisma';
import Bcrypt from '@/libs/bcrypt';
import { ConflictError, EntityNotFoundError } from '@/shared/errors';
import messages from '@/shared/messages';

class AuthService {
  public async register(email: string, password: string): Promise<AuthResponse> {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      throw new ConflictError(messages.auth.userExists);
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await Bcrypt.generateHashPassword(password),
      },
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

  private async checkAuthenticated(
    email: string,
    password: string,
  ): Promise<UserAttributes | null> {
    const user = await prisma.user.findUnique({ where: { email } });

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
