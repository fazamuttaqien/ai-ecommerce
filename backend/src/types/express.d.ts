import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '../db/schema';

export type AuthUser = Omit<InferSelectModel<typeof users>, 'password'>;

declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}

    interface Request {
      guestCartId?: string | null;
    }
  }
}
