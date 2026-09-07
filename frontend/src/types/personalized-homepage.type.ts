import type { ProductType } from './products.type'

export type PersonalizedHomepageSectionType =
  | 'for-you'
  | 'based-on-history'
  | 'popular'
  | 'deals'

export type PersonalizedHomepageSection = {
  type: PersonalizedHomepageSectionType
  title: string
  products: ProductType[]
}

export type PersonalizedHomepageResponse = {
  message: string
  sections: PersonalizedHomepageSection[]
  personalized: boolean
}
