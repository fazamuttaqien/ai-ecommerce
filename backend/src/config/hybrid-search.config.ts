const parseWeight = (name: string, fallback: number): number => {
  const value = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error(`${name} must be a non-negative number`);
  }
  return value;
};

const keywordWeight = parseWeight('HYBRID_SEARCH_KEYWORD_WEIGHT', 0.5);
const semanticWeight = parseWeight('HYBRID_SEARCH_SEMANTIC_WEIGHT', 0.5);
const totalWeight = keywordWeight + semanticWeight;

if (totalWeight <= 0) {
  throw new Error('At least one hybrid search weight must be greater than zero');
}

export const hybridSearchConfig = {
  keywordWeight: keywordWeight / totalWeight,
  semanticWeight: semanticWeight / totalWeight,
  candidateLimit: Math.min(
    Math.max(Number(process.env.HYBRID_SEARCH_CANDIDATE_LIMIT ?? 50), 1),
    100,
  ),
};
