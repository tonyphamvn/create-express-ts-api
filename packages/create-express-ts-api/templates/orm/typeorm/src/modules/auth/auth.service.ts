import { AuthResponse, UserAttributes } from '@/types/user.types';
import { generateToken } from '@/libs/passport';
import { AppDataSource } from '@/libs/typeorm';
import { User } from '@/entities/user.entity';
import Bcrypt from '@/libs/bcrypt';
import { ConflictError, EntityNotFoundError } from '@/shared/errors';
import messages from '@/shared/messages';

class AuthService {
  public async register(email: string, password: string): Promise<AuthResponse> {
    const repository = AppDataSource.getRepository(User);
    const existing = await repository.findOneBy({ email });

    if (existing) {
      throw new ConflictError(messages.auth.userExists);
    }

    const user = repository.create({
      email,
      password: await Bcrypt.generateHashPassword(password),
    });
    await repository.save(user);

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
    const user = await AppDataSource.getRepository(User).findOneBy({ email });

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
