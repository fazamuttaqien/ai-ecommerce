import type { AuthResponse, LoginType, RegisterType, CreateAddressInput, AddressResponse, GetAddressesResponse } from '@/types/auth.type'
import type { CreateOrderInput, CreateOrderResponse, GetOrdersResponse, GetOrderByIdResponse, AdminOrdersResponse, AdminAnalyticsResponse, UpdateOrderStatusInput, UpdateOrderStatusResponse } from '@/types/order.type'
import API from './axios-client'
import type { CategoryResponseType } from '@/types/categories.type'
import type { DealsResponseType, ProductParams, ProductResponseType, ProductDetailResponseType, ReviewsResponseType, ReviewableOrdersResponseType, CreateReviewResponseType, AdminProductsResponseType, CreateProductInputType, CreateProductResponseType, UserReviewsResponseType } from '@/types/products.type'
import type { CartResponseType } from '@/types/cart.type'
import type { AIChatRequest, AIChatResponse } from '@/types/ai.type'

export const loginMutationFn = async (data: LoginType): Promise<AuthResponse> => (await API.post<AuthResponse>('/auth/login', data)).data
export const registerMutationFn = async (data: RegisterType): Promise<AuthResponse> => (await API.post<AuthResponse>('/auth/register', data)).data
export const logoutMutationFn = async (): Promise<{ message: string }> => (await API.post<{ message: string }>('/auth/logout')).data
export const getCurrentUser = async (): Promise<AuthResponse> => (await API.get<AuthResponse>('/auth/status')).data
export const getAllCategoriesQueryFn = async (): Promise<CategoryResponseType> => (await API.get<CategoryResponseType>('/categories')).data
export const getProductDealsQueryFn = async (limit: number = 6): Promise<DealsResponseType> => (await API.get<DealsResponseType>('/products/deals', { params: { limit } })).data

export const getProductsQueryFn = async (params?: ProductParams): Promise<ProductResponseType> => {
  const queryParams: ProductParams = {}
  if (params) {
    if (params.categoryId !== undefined) queryParams.categoryId = params.categoryId
    if (params.hasDiscount !== undefined) queryParams.hasDiscount = params.hasDiscount
    if (params.inStock !== undefined) queryParams.inStock = params.inStock
    if (params.minPrice !== undefined) queryParams.minPrice = params.minPrice
    if (params.maxPrice !== undefined) queryParams.maxPrice = params.maxPrice
    if (params.sort !== undefined) queryParams.sort = params.sort
    if (params.keyword !== undefined) queryParams.keyword = params.keyword
    if (params.page !== undefined) queryParams.page = params.page
    if (params.limit !== undefined) queryParams.limit = params.limit
    if (params.skip !== undefined) queryParams.skip = params.skip
  }
  return (await API.get<ProductResponseType>('/products', { params: queryParams })).data
}

export const getProductBySlugQueryFn = async (slug: string): Promise<ProductDetailResponseType> => (await API.get<ProductDetailResponseType>(`/products/${slug}`)).data
export const getProductReviewsQueryFn = async (slug: string, params?: { page?: number; limit?: number }): Promise<ReviewsResponseType> => (await API.get<ReviewsResponseType>(`/products/${slug}/reviews`, { params })).data
export const postAIChat = async (data: AIChatRequest): Promise<AIChatResponse> => (await API.post<AIChatResponse>('/ai/chat', data)).data
export const getCartQueryFn = async (): Promise<CartResponseType> => (await API.get<CartResponseType>('/cart')).data
export const updateCartMutationFn = async (items: { productId: string; quantity: number }[]): Promise<CartResponseType> => (await API.post<CartResponseType>('/cart', { items })).data
export const getAddressesQueryFn = async (): Promise<GetAddressesResponse> => (await API.get<GetAddressesResponse>('/addresses')).data
export const createAddressMutationFn = async (data: CreateAddressInput): Promise<AddressResponse> => (await API.post<AddressResponse>('/addresses', data)).data
export const createOrderMutationFn = async (data: CreateOrderInput): Promise<CreateOrderResponse> => (await API.post<CreateOrderResponse>('/orders', data)).data
export const getOrdersQueryFn = async (): Promise<GetOrdersResponse> => (await API.get<GetOrdersResponse>('/orders')).data
export const getOrderByIdQueryFn = async (orderId: string): Promise<GetOrderByIdResponse> => (await API.get<GetOrderByIdResponse>(`/orders/${orderId}`)).data
export const getReviewableOrderItemsQueryFn = async (): Promise<ReviewableOrdersResponseType> => (await API.get<ReviewableOrdersResponseType>('/reviews/reviewable')).data
export const getUserReviewsQueryFn = async (): Promise<UserReviewsResponseType> => (await API.get<UserReviewsResponseType>('/reviews')).data
export const createReviewMutationFn = async (data: { orderId: string; orderItemId: string; rating: number; comment: string }): Promise<CreateReviewResponseType> => (await API.post<CreateReviewResponseType>('/reviews', data)).data
export const getAdminAnalyticsQueryFn = async (): Promise<AdminAnalyticsResponse> => (await API.get<AdminAnalyticsResponse>('/admin/analytics')).data
export const getAdminOrdersQueryFn = async ({ page, limit }: { page: number; limit: number }): Promise<AdminOrdersResponse> => (await API.get<AdminOrdersResponse>('/admin/orders', { params: { page, limit } })).data
export const updateOrderStatusMutationFn = async (data: UpdateOrderStatusInput): Promise<UpdateOrderStatusResponse> => {
  const { orderId, status, note } = data
  return (await API.put<UpdateOrderStatusResponse>(`/admin/orders/${orderId}/status`, { status, note })).data
}
export const getAdminProductsQueryFn = async ({ page, limit }: { page: number; limit: number }): Promise<AdminProductsResponseType> => (await API.get<AdminProductsResponseType>('/admin/products', { params: { page, limit } })).data
export const createProductMutationFn = async (data: CreateProductInputType): Promise<CreateProductResponseType> => (await API.post<CreateProductResponseType>('/admin/products', data)).data
export const uploadProductImagesMutationFn = async (files: File[]): Promise<{ images: string[] }> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return (await API.post<{ images: string[] }>('/admin/products/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })).data
}
