import { eq } from 'drizzle-orm';
import { db } from '../db';
import { productInteractions, products } from '../db/schema';
import { ProductInteractionInput } from '../validators/product-interaction.validator';
import { BadRequestException, NotFoundException } from '../utils/app-error';
import { isValidId } from '../utils/id.util';

export const createProductInteractionService = async (
  userId: string,
  data: ProductInteractionInput,
) => {
  if (!isValidId(data.productId)) {
    throw new BadRequestException('Invalid product ID');
  }

  const [product] = await db
    .select({ id: products._id })
    .from(products)
    .where(eq(products._id, data.productId))
    .limit(1);

  if (!product) throw new NotFoundException('Product not found');

  const [interaction] = await db
    .insert(productInteractions)
    .values({
      userId,
      productId: data.productId,
      type: data.type,
    })
    .returning();

  if (!interaction) {
    throw new BadRequestException('Failed to record product interaction');
  }

  return { interaction };
};
