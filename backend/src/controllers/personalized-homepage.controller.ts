import { Request, Response } from 'express';

import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { personalizedHomepageService } from '../services/personalized-homepage.service';

export const getPersonalizedHomepageController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const result =
      await personalizedHomepageService.getPersonalizedHomepage(userId);

    res.status(HTTPSTATUS.OK).json({
      message: 'Personalized homepage retrieved successfully',
      ...result,
    });
  },
);
