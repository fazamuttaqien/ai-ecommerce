import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { NextFunction, Request, Response } from 'express';
import { envConfig } from './env.config';
import passport from 'passport';
import { findUserById } from '../services/user.service';
import { generateGuestCartId } from '../utils/helper';
import { setGuestCartCookie } from '../utils/cookie.util';

const cookieExtractor = (req: Request) => {
  return req?.cookies?.instant_access_token ?? null;
};

const options = {
  jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
  secretOrKey: envConfig.JWT_SECRET,
  audience: ['user'],
};

passport.use(
  new JwtStrategy(options, async (payload: { userId: string }, done) => {
    try {
      const user = await findUserById(payload.userId);
      if (!user) {
        return done(null, false);
      }
      return done(null, user);
    } catch (error) {
      return done(error, false);
    }
  }),
);

export default passport;

export const passportAuthenticateJwt = passport.authenticate('jwt', {
  session: false,
});

const setGuestCartContext = (req: Request, res: Response) => {
  const guestCartId =
    req.cookies?.instant_guest_cart_id ?? generateGuestCartId();

  req.user = undefined;
  req.guestCartId = guestCartId;

  if (!req.cookies?.instant_guest_cart_id) {
    setGuestCartCookie(res, guestCartId);
  }
};

const isJwtAuthenticationError = (error: unknown) => {
  if (!error || typeof error !== 'object') return false;

  const name = (error as { name?: string }).name;
  return (
    name === 'JsonWebTokenError' ||
    name === 'TokenExpiredError' ||
    name === 'NotBeforeError'
  );
};

export const optionalCartAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req?.cookies?.instant_access_token;

  if (!token) {
    setGuestCartContext(req, res);
    return next();
  }

  passport.authenticate(
    'jwt',
    { session: false },
    (err: unknown, user: Express.User | false | null) => {
      if (err) {
        // An expired/malformed JWT means the customer is simply unauthenticated.
        // It must fall back to the guest cart instead of becoming a 500 response.
        if (isJwtAuthenticationError(err)) {
          setGuestCartContext(req, res);
          return next();
        }

        // Preserve real infrastructure/database errors from the JWT strategy.
        return next(err);
      }

      if (user) {
        req.user = user;
        req.guestCartId = null;
        return next();
      }

      setGuestCartContext(req, res);
      return next();
    },
  )(req, res, next);
};
