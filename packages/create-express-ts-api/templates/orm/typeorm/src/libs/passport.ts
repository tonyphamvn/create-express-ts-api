import passportJWT from 'passport-jwt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PassportStatic } from 'passport';
import config from '@config';
import { UserAttributes } from '@/types/user.types';
import { AppDataSource } from '@/libs/typeorm';
import { User } from '@/entities/user.entity';

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

export function configurePassport(passport: PassportStatic) {
  const opts: passportJWT.StrategyOptions = {
    secretOrKey: config.jwtSecret as string,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, cb) => {
      const user = await AppDataSource.getRepository(User).findOneBy({
        id: jwtPayload.id,
      });

      if (user) {
        cb(null, user);
      } else {
        cb(new Error('Something wrong in token'), false);
      }
    }),
  );
}

export function generateToken(user: UserAttributes): string {
  const options: SignOptions = {
    expiresIn: (config.jwtExpiresIn ?? '1d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ id: user.id, email: user.email }, config.jwtSecret as string, options);
}
