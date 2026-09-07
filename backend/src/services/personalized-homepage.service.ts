import {
  getDealsService,
  getProductsService,
} from './product.service';
import { recommendationService } from './recommendation.service';
import type { RecommendationResultItem } from './recommendation.service';

const DEFAULT_SECTION_LIMIT = 6;
const RECOMMENDATION_LIMIT = 12;

export type PersonalizedHomepageProduct = Omit<
  RecommendationResultItem,
  'recommendationScore'
>;

export type PersonalizedHomepageSection = {
  type: 'for-you' | 'based-on-history' | 'popular' | 'deals';
  title: string;
  products: PersonalizedHomepageProduct[];
};

export type PersonalizedHomepageResponse = {
  sections: PersonalizedHomepageSection[];
  personalized: boolean;
};

const withoutRecommendationScore = (
  product: RecommendationResultItem,
): PersonalizedHomepageProduct => {
  const { recommendationScore: _recommendationScore, ...result } = product;
  return result;
};

export class PersonalizedHomepageService {
  async getPersonalizedHomepage(
    userId: string,
  ): Promise<PersonalizedHomepageResponse> {
    const [recommendationResult, popularResult, dealsResult] = await Promise.all([
      recommendationService
        .getRecommendations(userId, RECOMMENDATION_LIMIT)
        .catch(() => null),
      getProductsService({
        page: 1,
        limit: DEFAULT_SECTION_LIMIT,
        sort: 'highest-rating',
        inStock: true,
      }),
      getDealsService({ limit: DEFAULT_SECTION_LIMIT }),
    ]);

    const recommendedProducts =
      recommendationResult?.items.map(withoutRecommendationScore) ?? [];
    const fallbackProducts = popularResult.products;
    const personalized = recommendationResult?.personalized ?? false;

    return {
      sections: [
        {
          type: 'for-you',
          title: 'Recommended for You',
          products: (
            personalized ? recommendedProducts : fallbackProducts
          ).slice(0, DEFAULT_SECTION_LIMIT),
        },
        {
          type: 'based-on-history',
          title: 'Based on Your Activity',
          products: (
            personalized
              ? recommendedProducts.slice(DEFAULT_SECTION_LIMIT)
              : fallbackProducts
          ).slice(0, DEFAULT_SECTION_LIMIT),
        },
        {
          type: 'popular',
          title: 'Popular Products',
          products: fallbackProducts,
        },
        {
          type: 'deals',
          title: 'Deals for You',
          products: dealsResult.products,
        },
      ],
      personalized,
    };
  }
}

export const personalizedHomepageService =
  new PersonalizedHomepageService();
