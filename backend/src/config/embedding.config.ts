import { envConfig } from './env.config';

export const EMBEDDING_PROVIDER = 'gemini' as const;
export const EMBEDDING_MODEL = 'gemini-embedding-001' as const;
export const EMBEDDING_DIMENSION = 1536 as const;
export const EMBEDDING_TIMEOUT_MS = 10_000 as const;

export const EMBEDDING_TASK_TYPES = {
  document: 'RETRIEVAL_DOCUMENT',
  query: 'RETRIEVAL_QUERY',
} as const;

export const embeddingConfig = {
  provider: EMBEDDING_PROVIDER,
  model: EMBEDDING_MODEL,
  dimension: EMBEDDING_DIMENSION,
  timeoutMs: EMBEDDING_TIMEOUT_MS,
  taskTypes: EMBEDDING_TASK_TYPES,
  apiKey: envConfig.GEMINI_API_KEY,
};
