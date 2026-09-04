export type AIChatRole = 'user' | 'assistant'

export type AIChatMessage = {
  role: AIChatRole
  content: string
}

export type AIRecommendedProduct = {
  _id?: string
  name?: string
  slug?: string
  image?: string | null
  salePrice?: number
  originalPrice?: number
  stockCount?: number
  ratingAverage?: number
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
