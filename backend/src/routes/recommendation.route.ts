import { Router } from 'express';

import { getRecommendationsController } from '../controllers/recommendation.controller';
import { passportAuthenticateJwt } from '../config/passport.config';

const recommendationRoute: Router = Router();

recommendationRoute.get('/', passportAuthenticateJwt, getRecommendationsController);

export default recommendationRoute;
