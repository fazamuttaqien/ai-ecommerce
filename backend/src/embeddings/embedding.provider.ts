export type EmbeddingTaskType =
  | 'RETRIEVAL_DOCUMENT'
  | 'RETRIEVAL_QUERY';

export interface EmbeddingProvider {
  readonly name: string;
  readonly model: string;
  readonly dimension: number;

  embedDocument(text: string): Promise<number[]>;
  embedQuery(text: string): Promise<number[]>;
}

export class EmbeddingProviderError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'MISSING_API_KEY'
      | 'API_ERROR'
      | 'TIMEOUT'
      | 'RATE_LIMIT'
      | 'INVALID_RESPONSE'
      | 'EMPTY_EMBEDDING',
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = 'EmbeddingProviderError';
  }
}
