declare module 'cookie-parser' {
  import { RequestHandler } from 'express';

  const cookieParser: () => RequestHandler;
  export default cookieParser;
}
