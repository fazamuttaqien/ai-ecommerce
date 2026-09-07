import { Router } from 'express';
import { passportAuthenticateJwt } from '../config/passport.config';
import { createProductInteractionController } from '../controllers/product-interaction.controller';

const productInteractionRoutes: Router = Router();

productInteractionRoutes.use(passportAuthenticateJwt);
productInteractionRoutes.post('/', createProductInteractionController);

export default productInteractionRoutes;
