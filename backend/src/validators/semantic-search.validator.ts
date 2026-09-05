import { z } from 'zod';

const MAX_QUERY_LENGTH = 500;

export const semanticSearchSchema = z
  .object({
    q: z.string().trim().min(1, 'Query is required').max(MAX_QUERY_LENGTH, `Query must not exceed ${MAX_QUERY_LENGTH} characters`),
    page: z.coerce.number().int().min(1).default(1),
    pageSize: z.coerce.number().int().min(1).max(100).default(20),
    categoryId: z.string().min(1).optional(),
    brand: z.string().trim().min(1).optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
  })
  .refine((value) => value.minPrice === undefined || value.maxPrice === undefined || value.minPrice <= value.maxPrice, {
    message: 'minPrice must be less than or equal to maxPrice', path: ['minPrice'],
  })
  .transform(({ q, ...filters }) => ({ query: q, ...filters }));

export type SemanticSearchInput = z.infer<typeof semanticSearchSchema>;
