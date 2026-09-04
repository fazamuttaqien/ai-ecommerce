import type {
  AuthResponse,
  LoginType,
  RegisterType,
  CreateAddressInput,
  AddressResponse,
  GetAddressesResponse,
} from '@/types/auth.type'
import type {
  CreateOrderInput,
  CreateOrderResponse,
  GetOrdersResponse,
  GetOrderByIdResponse,
  AdminOrdersResponse,
  AdminAnalyticsResponse,
  UpdateOrderStatusInput,
  UpdateOrderStatusResponse,
} from '@/types/order.type'
import API from './axios-client'
import type { CategoryResponseType } from '@/types/categories.type'
import type {
  DealsResponseType,
  ProductParams,
  ProductResponseType,
  ProductDetailResponseType,
  ReviewsResponseType,
  ReviewableOrdersResponseType,
  CreateReviewResponseType,
  AdminProductsResponseType,
  CreateProductInputType,
  CreateProductResponseType,
} from '@/types/products.type'
import type { CartResponseType } from '@/types/cart.type'
import type { AIChatRequest, AIChatResponse } from '@/types/ai.type'

export const loginMutationFn = async (
  data: LoginType,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/auth/login', data)
  return response.data
}

export const registerMutationFn = async (
  data: RegisterType,
): Promise<AuthResponse> => {
  const response = await API.post<AuthResponse>('/auth/register', data)
  return response.data
}

export const logoutMutationFn = async (): Promise<{ message: string }> => {
  const response = await API.post<{ message: string }>('/auth/logout')
  return response.data
}

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await API.get<AuthResponse>('/auth/status')
  return response.data
}

export const getAllCategoriesQueryFn =
  async (): Promise<CategoryResponseType> => {
    const response = await API.get<CategoryResponseType>('/categories')
    return response.data
  }

export const getProductDealsQueryFn = async (
  limit: number = 6,
): Promise<DealsResponseType> => {
  const response = await API.get<DealsResponseType>('/products/deals', {
    params: { limit },
  })
  return response.data
}

export const getProductsQueryFn = async (
  params?: ProductParams,
): Promise<ProductResponseType> => {
  const queryParams: ProductParams = {}
  if (params) {
    if (params.categoryId !== undefined)
      queryParams.categoryId = params.categoryId
    if (params.hasDiscount !== undefined)
      queryParams.hasDiscount = params.hasDiscount
    if (params.inStock !== undefined) queryParams.inStock = params.inStock
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice
    if (params.sort !== undefined) queryParams.sort = params.sort
    if (params.keyword !== undefined) queryParams.keyword = params.keyword
    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.skip !== undefined) queryParams.skip = params.skip
  }
  const response = await API.get<ProductResponseType>('/products', {
    params: queryParams,
  })
  return response.data
}

export const getProductBySlugQueryFn = async (
  slug: string,
): Promise<ProductDetailResponseType> => {
  const response = await API.get<ProductDetailResponseType>(`/products/${slug}`)
  return response.data
}

export const getProductReviewsQueryFn = async (
  slug: string,
  params?: { page?: number; limit?: number },
): Promise<ReviewsResponseType> => {
  const response = await API.get<ReviewsResponseType>(
    `/products/${slug}/reviews`,
    { params },
  )
  return response.data
}

export const postAIChat = async (
  data: AIChatRequest,
): Promise<AIChatResponse> => {
  const response = await API.post<AIChatResponse>('/ai/chat', data)
  return response.data
}

export const getCartQueryFn = async (): Promise<CartResponseType> => {
  const response = await API.get<CartResponseType>('/cart')
  return response.data
}

export const updateCartMutationFn = async (
  items: { productId: string; quantity: number }[],
): Promise<CartResponseType> => {
  const response = await API.post<CartResponseType>('/cart', { items })
  return response.data
}

export const getAddressesQueryFn = async (): Promise<GetAddressesResponse> => {
  const response = await API.get<GetAddressesResponse>('/addresses')
  return response.data
}

export const createAddressMutationFn = async (
  data: CreateAddressInput,
): Promise<AddressResponse> => {
  const response = await API.post<AddressResponse>('/addresses', data)
  return response.data
}

export const createOrderMutationFn = async (
  data: CreateOrderInput,
): Promise<CreateOrderResponse> => {
  const response = await API.post<CreateOrderResponse>('/orders', data)
  return response.data
}

export const getOrdersQueryFn = async (): Promise<GetOrdersResponse> => {
  const response = await API.get<GetOrdersResponse>('/orders')
  return response.data
}

export const getOrderByIdQueryFn = async (
  orderId: string,
): Promise<GetOrderByIdResponse> => {
  const response = await API.get<GetOrderByIdResponse>(`/orders/${orderId}`)
  return response.data
}

export const getReviewableOrderItemsQueryFn = async (): Promise<ReviewableOrdersResponseType> => {
  const response = await API.get<ReviewableOrdersResponseType>(
    '/reviews/reviewable',
  )
  return response.data
}

export const getUserReviewsQueryFn = async (): Promise<ReviewsResponseType> => {
  const response = await API.get<ReviewsResponseType>('/reviews')
  return response.data
}

export const createReviewMutationFn = async (data: {
  orderId: string
  orderItemId: string
  rating: number
  comment: string
}): Promise<CreateReviewResponseType> => {
  const response = await API.post<CreateReviewResponseType>('/reviews', data)
  return response.data
}

export const getAdminAnalyticsQueryFn = async (): Promise<AdminAnalyticsResponse> => {
  const response = await API.get<AdminAnalyticsResponse>('/admin/analytics')
  return response.data
}

export const getAdminOrdersQueryFn = async ({
  page,
  limit,
}: {
  page: number
  limit: number
}): Promise<AdminOrdersResponse> => {
  const response = await API.get<AdminOrdersResponse>('/admin/orders', {
    params: { page, limit },
  })
  return response.data
}

export const updateOrderStatusMutationFn = async (
  data: UpdateOrderStatusInput,
): Promise<UpdateOrderStatusResponse> => {
  const { orderId, status, note } = data
  const response = await API.put<UpdateOrderStatusResponse>(
    `/admin/orders/${orderId}/status`,
    { status, note },
  )
  return response.data
}

export const getAdminProductsQueryFn = async ({
  page,
  limit,
}: {
  page: number
  limit: number
}): Promise<AdminProductsResponseType> => {
  const response = await API.get<AdminProductsResponseType>('/admin/products', {
    params: { page, limit },
  })
  return response.data
}

export const createProductMutationFn = async (
  data: CreateProductInputType,
): Promise<CreateProductResponseType> => {
  const response = await API.post<CreateProductResponseType>(
    '/admin/products',
    data,
  )
  return response.data
}

export const uploadProductImagesMutationFn = async (
  files: File[],
): Promise<{ images: string[] }> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  const response = await API.post<{ images: string[] }>(
    '/admin/products/upload',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  )
  return response.data
}
