import { Request, Response } from 'express';

import { HTTPSTATUS } from '../config/http.config';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { semanticSearchService } from '../services/semantic-search.service';
import { semanticSearchSchema } from '../validators/semantic-search.validator';

export const semanticSearchController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = semanticSearchSchema.parse(req.query);
    const result = await semanticSearchService.search(input);

    res.status(HTTPSTATUS.OK).json({
      message: 'Semantic search completed successfully',
      ...result,
    });
  },
);
