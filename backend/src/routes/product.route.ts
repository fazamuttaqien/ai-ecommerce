import { Router } from 'express';
import {
  getProductsController,
  getDealsController,
  getProductBySlugController,
  getProductReviewsController,
} from '../controllers/product.controller';
import { semanticSearchController } from '../controllers/semantic-search.controller';

const productRoutes: Router = Router();

productRoutes.get('/', getProductsController);
productRoutes.get('/deals', getDealsController);
productRoutes.get('/search/semantic', semanticSearchController);
productRoutes.get('/:slug/reviews', getProductReviewsController);
productRoutes.get('/:slug', getProductBySlugController);

export default productRoutes;
