import { Router } from 'express';

import { passportAuthenticateJwt } from '../config/passport.config';
import { getPersonalizedHomepageController } from '../controllers/personalized-homepage.controller';

const personalizedHomepageRoute: Router = Router();

personalizedHomepageRoute.get(
  '/personalized',
  passportAuthenticateJwt,
  getPersonalizedHomepageController,
);

export default personalizedHomepageRoute;
