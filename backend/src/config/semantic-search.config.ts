const parseThreshold = (value: string | undefined): number => {
  const threshold = Number(value ?? 0.35);

  if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
    throw new Error(
      'SEMANTIC_SEARCH_SIMILARITY_THRESHOLD must be a number between 0 and 1',
    );
  }

  return threshold;
};

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number(value ?? fallback);

  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(
      'Semantic search pagination configuration must be positive integers',
    );
  }

  return parsed;
};

export const semanticSearchConfig = {
  similarityThreshold: parseThreshold(
    process.env.SEMANTIC_SEARCH_SIMILARITY_THRESHOLD,
  ),
  defaultPage: 1,
  defaultPageSize: parsePositiveInteger(
    process.env.SEMANTIC_SEARCH_DEFAULT_PAGE_SIZE,
    20,
  ),
  maxPageSize: parsePositiveInteger(
    process.env.SEMANTIC_SEARCH_MAX_PAGE_SIZE,
    100,
  ),
};
