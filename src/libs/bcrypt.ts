import bcrypt from 'bcrypt';
import config from '@config';

class Bcrypt {
  private salt: string;

  constructor(salt: string) {
    this.salt = salt;
  }

  /**
   * @param  {string} password
   * @returns string
   */
  public async generateHashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(parseInt(this.salt)));
  }

  /**
   * @param  {string} newPass
   * @param  {string} currentPass
   * @returns boolean
   */
  public async comparePassword(newPass: string, currentPass: string): Promise<boolean> {
    return bcrypt.compareSync(newPass, currentPass);
  }
}

export default new Bcrypt(config.salt);
