export const recommendationConfig = {
  defaultLimit: 12,
  maxLimit: 24,
  candidateLimit: 300,
  preferenceSeedLimit: 50,
  weights: {
    purchase: 5,
    interaction: 2,
    cart: 3,
    review: 2,
    category: 2.5,
    brand: 2,
    semantic: 3,
    popularity: 0.75,
    rating: 0.75,
    discount: 0.35,
    price: 0.5,
  },
  interactionWeights: {
    view: 1,
    homepage_click: 2,
  },
  diversity: {
    categoryPenalty: 0.18,
    brandPenalty: 0.12,
    similarityPenalty: 0.2,
  },
};
