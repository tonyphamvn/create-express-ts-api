import passportJWT from 'passport-jwt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { PassportStatic } from 'passport';
import env from '@config';
import { UserAttributes } from '@/interfaces/user.d';
import UserModel from '@/models/user.model';

const { ExtractJwt } = passportJWT;
const JwtStrategy = passportJWT.Strategy;

export function passportConfiguration(passport: PassportStatic) {
  const opts: passportJWT.StrategyOptions = {
    secretOrKey: env.jwtSecret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
  };

  passport.use(
    new JwtStrategy(opts, async (jwtPayload, cb) => {
      const user = await UserModel.findOne({
        where: { id: jwtPayload.id },
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
    expiresIn: (env.jwtExpiresIn ?? '1d') as SignOptions['expiresIn'],
  };

  return jwt.sign({ id: user.id, email: user.email }, env.jwtSecret as string, options);
}
