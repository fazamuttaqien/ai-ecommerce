import { Request, Response } from 'express';

import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { recommendationService } from '../services/recommendation.service';
import { recommendationSchema } from '../validators/recommendation.validator';

export const getRecommendationsController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = recommendationSchema.parse(req.query);
    const userId = req.user!._id.toString();
    const result = await recommendationService.getRecommendations(
      userId,
      input.limit,
    );

    res.status(HTTPSTATUS.OK).json({
      message: 'Recommendations generated successfully',
      ...result,
    });
  },
);
