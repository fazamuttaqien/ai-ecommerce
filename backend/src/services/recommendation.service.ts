import { recommendationConfig } from '../config/recommendation.config';
import {
  recommendationRepository,
  type RecommendationProduct,
  type RecommendationRepository,
  type RecommendationRepositoryResponse,
} from '../repositories/recommendation.repository';

export type RecommendationResultItem = Omit<RecommendationProduct, 'embedding'> & {
  recommendationScore: number;
};

export type RecommendationResponse = {
  items: RecommendationResultItem[];
  personalized: boolean;
};

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const normalize = (value: number, max: number) => (max > 0 ? clamp(value / max) : 0);

const cosineSimilarity = (left: number[], right: number[]): number => {
  if (left.length !== right.length || left.length === 0) return 0;
  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let index = 0; index < left.length; index += 1) {
    dot += left[index] * right[index];
    leftNorm += left[index] ** 2;
    rightNorm += right[index] ** 2;
  }
  if (leftNorm === 0 || rightNorm === 0) return 0;
  return clamp(dot / (Math.sqrt(leftNorm) * Math.sqrt(rightNorm)), -1, 1);
};

export class RecommendationService {
  constructor(
    private readonly repository: Pick<RecommendationRepository, 'getUserRecommendationData'> = recommendationRepository,
  ) {}

  async getRecommendations(userId: string, limit = recommendationConfig.defaultLimit): Promise<RecommendationResponse> {
    const safeLimit = Math.min(Math.max(1, limit), recommendationConfig.maxLimit);
    const data = await this.repository.getUserRecommendationData(userId, recommendationConfig.candidateLimit, recommendationConfig.preferenceSeedLimit);

    const positiveSignals = new Map<string, number>();
    const addSignals = (signals: Array<{ productId: string; weight: number }>, multiplier: number) => {
      for (const signal of signals) {
        positiveSignals.set(signal.productId, (positiveSignals.get(signal.productId) ?? 0) + signal.weight * multiplier);
      }
    };
    addSignals(data.purchases, recommendationConfig.weights.purchase);
    addSignals(data.interactions, recommendationConfig.weights.interaction);
    addSignals(data.cart, recommendationConfig.weights.cart);
    addSignals(data.reviews, recommendationConfig.weights.review);

    const purchasedIds = new Set(data.purchases.map((item) => item.productId));
    const seedWeights = new Map([...positiveSignals.entries()].sort((left, right) => right[1] - left[1]).slice(0, recommendationConfig.preferenceSeedLimit));
    const categoryAffinity = new Map<string, number>();
    const brandAffinity = new Map<string, number>();

    for (const product of data.preferenceProducts) {
      const weight = seedWeights.get(product.id) ?? 0;
      if (!weight) continue;
      if (product.category?.id) categoryAffinity.set(product.category.id, (categoryAffinity.get(product.category.id) ?? 0) + weight);
      brandAffinity.set(product.brand, (brandAffinity.get(product.brand) ?? 0) + weight);
    }

    const maxCategoryAffinity = Math.max(0, ...categoryAffinity.values());
    const maxBrandAffinity = Math.max(0, ...brandAffinity.values());
    const preferenceVector = this.buildPreferenceVector(data, seedWeights);
    const priceValues = data.preferenceProducts.filter((product) => seedWeights.has(product.id)).map((product) => product.salePrice);
    const preferredPrice = priceValues.length ? priceValues.reduce((sum, price) => sum + price, 0) / priceValues.length : 0;
    const maxBehavior = Math.max(1, ...positiveSignals.values());

    const scored = data.candidates.map((product) => {
      const behavioralScore = normalize(positiveSignals.get(product.id) ?? 0, maxBehavior);
      const categoryScore = product.category?.id ? normalize(categoryAffinity.get(product.category.id) ?? 0, maxCategoryAffinity) : 0;
      const brandScore = normalize(brandAffinity.get(product.brand) ?? 0, maxBrandAffinity);
      const semanticScore = preferenceVector && product.embedding ? clamp((cosineSimilarity(preferenceVector, product.embedding) + 1) / 2) : 0;
      const popularityScore = clamp(Math.log1p(product.reviewCount) / Math.log1p(100));
      const ratingScore = clamp(product.ratingAverage / 5);
      const discountScore = clamp(product.discountPercent / 100);
      const priceScore = preferredPrice > 0 ? clamp(1 - Math.abs(product.salePrice - preferredPrice) / Math.max(preferredPrice, product.salePrice, 1)) : 0;
      const score =
        behavioralScore * recommendationConfig.weights.purchase +
        categoryScore * recommendationConfig.weights.category +
        brandScore * recommendationConfig.weights.brand +
        semanticScore * recommendationConfig.weights.semantic +
        popularityScore * recommendationConfig.weights.popularity +
        ratingScore * recommendationConfig.weights.rating +
        discountScore * recommendationConfig.weights.discount +
        priceScore * recommendationConfig.weights.price;
      return { product, score };
    });

    scored.sort((left, right) => right.score - left.score || left.product.id.localeCompare(right.product.id));
    const nonPurchased = scored.filter((item) => !purchasedIds.has(item.product.id));
    const pool = nonPurchased.length >= safeLimit ? nonPurchased : scored;
    const selected = this.applyDiversity(pool, safeLimit);

    return {
      items: selected.map(({ product, score }) => {
        const { embedding: _embedding, ...item } = product;
        return { ...item, recommendationScore: Number(score.toFixed(6)) };
      }),
      personalized: positiveSignals.size > 0,
    };
  }

  private buildPreferenceVector(data: RecommendationRepositoryResponse, seedWeights: Map<string, number>): number[] | null {
    const vectors = data.preferenceProducts.filter((product) => product.embedding && seedWeights.has(product.id));
    if (!vectors.length) return null;
    const dimensions = vectors[0].embedding?.length ?? 0;
    const result = new Array<number>(dimensions).fill(0);
    let totalWeight = 0;
    for (const product of vectors) {
      const embedding = product.embedding!;
      const weight = seedWeights.get(product.id) ?? 0;
      totalWeight += weight;
      for (let index = 0; index < dimensions; index += 1) result[index] += embedding[index] * weight;
    }
    return totalWeight ? result.map((value) => value / totalWeight) : null;
  }

  private applyDiversity(ranked: Array<{ product: RecommendationProduct; score: number }>, limit: number) {
    const selected: Array<{ product: RecommendationProduct; score: number }> = [];
    const categoryCounts = new Map<string, number>();
    const brandCounts = new Map<string, number>();
    const remaining = [...ranked];

    while (selected.length < limit && remaining.length) {
      let bestIndex = 0;
      let bestScore = Number.NEGATIVE_INFINITY;
      for (let index = 0; index < remaining.length; index += 1) {
        const item = remaining[index];
        const categoryId = item.product.category?.id;
        const categoryPenalty = categoryId ? (categoryCounts.get(categoryId) ?? 0) * recommendationConfig.diversity.categoryPenalty : 0;
        const brandPenalty = (brandCounts.get(item.product.brand) ?? 0) * recommendationConfig.diversity.brandPenalty;
        const diverseScore = item.score - categoryPenalty - brandPenalty;
        if (diverseScore > bestScore || (diverseScore === bestScore && item.product.id.localeCompare(remaining[bestIndex].product.id) < 0)) {
          bestScore = diverseScore;
          bestIndex = index;
        }
      }
      const [chosen] = remaining.splice(bestIndex, 1);
      selected.push(chosen);
      const categoryId = chosen.product.category?.id;
      if (categoryId) categoryCounts.set(categoryId, (categoryCounts.get(categoryId) ?? 0) + 1);
      brandCounts.set(chosen.product.brand, (brandCounts.get(chosen.product.brand) ?? 0) + 1);
    }
    return selected;
  }
}

export const recommendationService = new RecommendationService();
