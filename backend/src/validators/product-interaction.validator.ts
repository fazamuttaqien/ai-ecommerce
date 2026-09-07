import { z } from 'zod';

export const productInteractionSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  type: z.enum(['view', 'homepage_click']),
});

export type ProductInteractionInput = z.infer<typeof productInteractionSchema>;
