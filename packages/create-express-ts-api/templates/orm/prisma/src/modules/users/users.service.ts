import prisma from '@/libs/prisma';
import { EntityNotFoundError } from '@/shared/errors';

class UsersService {
  public async listUsers() {
    return prisma.user.findMany({
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  public async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new EntityNotFoundError();
    }

    return user;
  }
}

export default UsersService;
