import { Request, Response } from 'express';

import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { getDealsService, getProductsService } from '../services/product.service';
import { personalizedHomepageService } from '../services/personalized-homepage.service';

const FALLBACK_LIMIT = 6;

export const getPersonalizedHomepageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();

    try {
      const result = await personalizedHomepageService.getPersonalizedHomepage(userId);

      res.status(HTTPSTATUS.OK).json({
        message: 'Personalized homepage retrieved successfully',
        ...result,
      });
    } catch (error) {
      const [popularResult, dealsResult] = await Promise.all([
        getProductsService({
          page: 1,
          limit: FALLBACK_LIMIT,
          sort: 'highest-rating',
          inStock: true,
        }),
        getDealsService({ limit: FALLBACK_LIMIT }),
      ]);

      res.status(HTTPSTATUS.OK).json({
        message: 'Homepage retrieved with fallback recommendations',
        personalized: false,
        sections: [
          {
            type: 'for-you',
            title: 'Recommended for You',
            products: popularResult.products,
          },
          {
            type: 'based-on-history',
            title: 'Based on Your Activity',
            products: popularResult.products,
          },
          {
            type: 'popular',
            title: 'Popular Products',
            products: popularResult.products,
          },
          {
            type: 'deals',
            title: 'Deals for You',
            products: dealsResult.products,
          },
        ],
      });
    }
  },
);
