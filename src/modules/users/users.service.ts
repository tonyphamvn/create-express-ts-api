import { getEM } from '@/libs/mikro-orm';
import { User } from '@/entities/User';

class UsersService {
  public async listUsers() {
    return getEM().find(
      User,
      {},
      {
        fields: ['id', 'email', 'createdAt', 'updatedAt'],
      },
    );
  }
}

export default UsersService;
