import { Request, Response } from 'express';
import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { productInteractionSchema } from '../validators/product-interaction.validator';
import { createProductInteractionService } from '../services/product-interaction.service';

export const createProductInteractionController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = req.user!._id.toString();
    const data = productInteractionSchema.parse(req.body);
    const result = await createProductInteractionService(userId, data);

    res.status(HTTPSTATUS.CREATED).json({
      message: 'Product interaction recorded successfully',
      ...result,
    });
  },
);
