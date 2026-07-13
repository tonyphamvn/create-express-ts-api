import userModel from '@/models/user.model';
import { UserStatic } from '@/types/user.types';
import { EntityNotFoundError } from '@/shared/errors';

class UsersService {
  private userModel: UserStatic;

  constructor() {
    this.userModel = userModel;
  }

  public async listUsers() {
    return this.userModel.findAll({
      attributes: ['id', 'email', 'createdAt', 'updatedAt'],
    });
  }

  public async getMe(userId: number) {
    const user = await this.userModel.findByPk(userId, {
      attributes: ['id', 'email', 'createdAt', 'updatedAt'],
    });

    if (!user) {
      throw new EntityNotFoundError();
    }

    return user;
  }
}

export default UsersService;
