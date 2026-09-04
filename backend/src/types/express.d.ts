import { IUser } from '../models/user.model';

declare global {
  namespace Express {
    interface User extends IUser {
      comparePassword: IUser['comparePassword'];
    }

    interface Request {
      guestCartId?: string | null;
    }
  }
}
