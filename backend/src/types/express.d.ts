import type { InferSelectModel } from 'drizzle-orm';
import type { users } from '../db/schema';

export type AuthUser = Omit<InferSelectModel<typeof users>, 'password'>;

declare global {
  namespace Express {
    // Required for Express's declaration merging; the lint rule incorrectly flags this interface as empty.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends AuthUser {}

    interface Request {
      guestCartId?: string | null;
    }
  }
}
