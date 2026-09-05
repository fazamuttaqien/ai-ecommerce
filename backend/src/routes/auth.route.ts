import { Router } from 'express';
import {
  registerController,
  loginController,
  logoutController,
  authStatusController,
} from '../controllers/auth.controller';
import { optionalAuthStatus } from '../config/passport.config';

const authRoutes: Router = Router();

authRoutes.post('/register', registerController);
authRoutes.post('/login', loginController);
authRoutes.post('/logout', logoutController);
authRoutes.get('/status', optionalAuthStatus, authStatusController);

export default authRoutes;
