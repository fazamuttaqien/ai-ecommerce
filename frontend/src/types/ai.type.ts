export type AIChatRole = 'user' | 'assistant'

export type AIChatMessage = {
  role: AIChatRole
  content: string
  products?: AIRecommendedProduct[]
}

export type AIRecommendedProduct = {
  _id?: string
  name?: string
  slug?: string
  image?: string | null
  salePrice?: number
  originalPrice?: number
  discountPercent?: number
  stockCount?: number
  ratingAverage?: number
  reviewCount?: number
}

export type AIChatRequest = {
  messages: AIChatMessage[]
}

export type AIChatResponse = {
  message: string
  data: {
    content: string
    products: AIRecommendedProduct[]
  }
}
