import { defineRelations } from 'drizzle-orm';
import * as schema from './schema';

export const relations = defineRelations(schema, (r) => ({
  users: {
    addresses: r.many.addresses(),
    products: r.many.products(),
    carts: r.many.carts(),
    orders: r.many.orders(),
    reviews: r.many.reviews(),
  },
  addresses: {
    user: r.one.users({
      from: r.addresses.userId,
      to: r.users._id,
    }),
  },
  categories: {
    products: r.many.products(),
  },
  products: {
    user: r.one.users({
      from: r.products.userId,
      to: r.users._id,
    }),
    category: r.one.categories({
      from: r.products.categoryId,
      to: r.categories._id,
    }),
    cartItems: r.many.cartItems(),
    orderItems: r.many.orderItems(),
    reviews: r.many.reviews(),
  },
  carts: {
    user: r.one.users({
      from: r.carts.userId,
      to: r.users._id,
    }),
    items: r.many.cartItems(),
  },
  cartItems: {
    cart: r.one.carts({
      from: r.cartItems.cartId,
      to: r.carts._id,
    }),
    product: r.one.products({
      from: r.cartItems.productId,
      to: r.products._id,
    }),
  },
  orders: {
    user: r.one.users({
      from: r.orders.userId,
      to: r.users._id,
    }),
    items: r.many.orderItems(),
    reviews: r.many.reviews(),
  },
  orderItems: {
    order: r.one.orders({
      from: r.orderItems.orderId,
      to: r.orders._id,
    }),
    product: r.one.products({
      from: r.orderItems.productId,
      to: r.products._id,
    }),
    review: r.one.reviews(),
  },
  reviews: {
    user: r.one.users({
      from: r.reviews.userId,
      to: r.users._id,
    }),
    order: r.one.orders({
      from: r.reviews.orderId,
      to: r.orders._id,
    }),
    orderItem: r.one.orderItems({
      from: r.reviews.orderItemId,
      to: r.orderItems._id,
    }),
    product: r.one.products({
      from: r.reviews.productId,
      to: r.products._id,
    }),
  },
}));
