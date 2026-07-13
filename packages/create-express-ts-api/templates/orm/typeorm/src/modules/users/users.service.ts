import { AppDataSource } from '@/libs/typeorm';
import { User } from '@/entities/user.entity';
import { EntityNotFoundError } from '@/shared/errors';

class UsersService {
  public async listUsers() {
    return AppDataSource.getRepository(User).find({
      select: ['id', 'email', 'createdAt', 'updatedAt'],
    });
  }

  public async getMe(userId: number) {
    const user = await AppDataSource.getRepository(User).findOne({
      where: { id: userId },
      select: ['id', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new EntityNotFoundError();
    }

    return user;
  }
}

export default UsersService;
