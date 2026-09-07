import { z } from 'zod';

export const recommendationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(24).optional(),
});

export type RecommendationInput = z.infer<typeof recommendationSchema>;
