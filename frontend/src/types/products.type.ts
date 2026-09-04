export type ProductType = {
  _id: string
  name: string
  images: string[]
  originalPrice: number
  discountPercent: number
  discountLabel?: string | null
  unit: string
  stockCount: number
  ratingAverage: number
  reviewCount: number
  slug: string
  salePrice: number
}

export type DealsResponseType = {
  message: string
  products: ProductType[]
}

export type PaginationType = {
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

export type ProductResponseType = {
  message: string
  products: ProductType[]
  pagination: PaginationType
}

export type ProductParams = {
  categoryId?: string
  hasDiscount?: boolean
  inStock?: boolean
  minPrice?: number
  maxPrice?: number
  sort?: string
  keyword?: string
  page?: number
  limit?: number
  skip?: number
}

export type ProductDetailResponseType = {
  message: string
  product: ProductType & {
    description?: string
    categoryId: {
      _id: string
      name: string
      slug: string
    }
  }
  relatedProducts: ProductType[]
}

export type ReviewType = {
  _id: string
  userId: {
    _id: string
    name: string
    avatar?: string
  }
  rating: number
  comment: string
  createdAt: string
}

export type RatingBreakdownItem = {
  rating: number
  count: number
}

export type ReviewsResponseType = {
  message: string
  reviews: ReviewType[]
  ratingBreakdown: RatingBreakdownItem[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ReviewableOrderItemType = {
  _id: string
  productId: string
  name: string
  image: string
  originalPrice: number
  discountPercent: number
  salePrice: number
  quantity: number
  isReviewed: boolean
}

export type ReviewableOrderType = {
  _id: string
  orderNo: string
  createdAt: string
  items: ReviewableOrderItemType[]
}

export type ReviewableOrdersResponseType = {
  message: string
  orders: ReviewableOrderType[]
}

export type CreateReviewResponseType = {
  message: string
  review: {
    _id: string
    userId: string
    orderId: string
    orderItemId: string
    productId: string
    rating: number
    comment?: string
    createdAt: string
    updatedAt: string
  }
}

export type AdminProductType = ProductType & {
  description?: string
  categoryId: {
    _id: string
    name: string
    slug: string
  }
  isActive: boolean
}

export type AdminProductsResponseType = {
  message: string
  products: AdminProductType[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

export type CreateProductInputType = {
  categoryId: string
  name: string
  description?: string
  images: string[]
  originalPrice: number
  discountPercent?: number
  discountLabel?: string | null
  unit: string
  stockCount?: number
  isActive?: boolean
}

export type CreateProductResponseType = {
  message: string
  product: AdminProductType
}
