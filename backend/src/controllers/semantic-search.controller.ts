import { Request, Response } from 'express';

import { HTTPSTATUS } from '../config/http.config';
import { EmbeddingProviderError } from '../embeddings/embedding.provider';
import { asyncHandler } from '../middlewares/asyncHandler.middleware';
import { semanticSearchService } from '../services/semantic-search.service';
import { semanticSearchSchema } from '../validators/semantic-search.validator';
import { AppError, ErrorCodes } from '../utils/app-error';

export const semanticSearchController = asyncHandler(
  async (req: Request, res: Response) => {
    const input = semanticSearchSchema.parse(req.query);

    try {
      const result = await semanticSearchService.search(input);

      res.status(HTTPSTATUS.OK).json({
        message: 'Semantic search completed successfully',
        ...result,
      });
    } catch (error) {
      if (error instanceof EmbeddingProviderError) {
        const statusCode =
          error.code === 'MISSING_API_KEY'
            ? HTTPSTATUS.SERVICE_UNAVAILABLE
            : error.code === 'RATE_LIMIT' || error.code === 'TIMEOUT'
              ? HTTPSTATUS.SERVICE_UNAVAILABLE
              : HTTPSTATUS.INTERNAL_SERVER_ERROR;

        throw new AppError(
          'Semantic search service is temporarily unavailable',
          statusCode,
          ErrorCodes.ERR_AI_UNAVAILABLE,
        );
      }

      throw error;
    }
  },
);
