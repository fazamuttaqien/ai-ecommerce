import { getDealsService, getProductsService } from './product.service';
import { recommendationService } from './recommendation.service';
import type { RecommendationResultItem } from './recommendation.service';

const DEFAULT_SECTION_LIMIT = 6;
const RECOMMENDATION_LIMIT = 12;

type HomepageProduct = {
  _id: string;
  name: string;
  brand: string;
  slug: string;
  images: string[];
  unit?: string;
  originalPrice: number;
  salePrice: number;
  discountPercent: number;
  discountLabel?: string;
  stockCount?: number;
  ratingAverage: number;
  reviewCount: number;
};

export type PersonalizedHomepageSection = {
  type: 'for-you' | 'based-on-history' | 'popular' | 'deals';
  title: string;
  products: HomepageProduct[];
};

export type PersonalizedHomepageResponse = {
  sections: PersonalizedHomepageSection[];
  personalized: boolean;
};

const mapRecommendationProduct = (
  product: RecommendationResultItem,
): HomepageProduct => ({
  _id: product.id,
  name: product.name,
  brand: product.brand,
  slug: product.slug,
  images: product.images,
  unit: product.unit,
  originalPrice: product.originalPrice,
  salePrice: product.salePrice,
  discountPercent: product.discountPercent,
  stockCount: product.stockCount,
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
});

const mapProductListItem = (
  product: Awaited<ReturnType<typeof getProductsService>>['products'][number],
): HomepageProduct => ({
  _id: product._id,
  name: product.name,
  brand: product.brand,
  slug: product.slug,
  images: product.images,
  unit: product.unit,
  originalPrice: product.originalPrice,
  salePrice: product.salePrice,
  discountPercent: product.discountPercent,
  discountLabel: product.discountLabel,
  stockCount: product.stockCount,
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
});

const mapDealItem = (
  product: Awaited<ReturnType<typeof getDealsService>>['products'][number],
): HomepageProduct => ({
  _id: product._id,
  name: product.name,
  brand: product.brand,
  slug: product.slug,
  images: product.images,
  originalPrice: product.originalPrice,
  salePrice: product.salePrice,
  discountPercent: product.discountPercent,
  ratingAverage: product.ratingAverage,
  reviewCount: product.reviewCount,
});

export class PersonalizedHomepageService {
  async getPersonalizedHomepage(
    userId: string,
  ): Promise<PersonalizedHomepageResponse> {
    const [recommendationResult, popularResult, dealsResult] =
      await Promise.all([
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
      recommendationResult?.items.map(mapRecommendationProduct) ?? [];
    const fallbackProducts = popularResult.products.map(mapProductListItem);
    const dealProducts = dealsResult.products.map(mapDealItem);
    const personalized = recommendationResult?.personalized ?? false;

    return {
      sections: [
        {
          type: 'for-you',
          title: 'Recommended for You',
          products: (personalized
            ? recommendedProducts
            : fallbackProducts
          ).slice(0, DEFAULT_SECTION_LIMIT),
        },
        {
          type: 'based-on-history',
          title: 'Based on Your Activity',
          products: (personalized
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
          products: dealProducts,
        },
      ],
      personalized,
    };
  }
}

export const personalizedHomepageService = new PersonalizedHomepageService();
