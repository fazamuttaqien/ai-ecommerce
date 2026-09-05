import {
  EmbeddingProviderError,
  type EmbeddingProvider,
} from '../embeddings/embedding.provider';
import { GeminiEmbeddingProvider } from '../embeddings/gemini.embedding.provider';

export const createEmbeddingProvider = (): EmbeddingProvider | null => {
  try {
    return new GeminiEmbeddingProvider();
  } catch (error) {
    if (
      error instanceof EmbeddingProviderError &&
      error.code === 'MISSING_API_KEY'
    ) {
      return null;
    }

    console.error('Failed to initialize embedding provider', error);
    return null;
  }
};

export class EmbeddingService {
  constructor(private readonly provider: EmbeddingProvider | null) {}

  async embedDocument(text: string): Promise<number[] | null> {
    return this.run(() => this.provider?.embedDocument(text));
  }

  async embedQuery(text: string): Promise<number[] | null> {
    return this.run(() => this.provider?.embedQuery(text));
  }

  private async run(
    operation: () => Promise<number[]> | undefined,
  ): Promise<number[] | null> {
    if (!this.provider) {
      return null;
    }

    try {
      const embedding = await operation();

      if (!embedding || embedding.length === 0) {
        return null;
      }

      return embedding;
    } catch (error) {
      if (error instanceof EmbeddingProviderError) {
        console.error(
          `Embedding provider error [${error.code}]: ${error.message}`,
        );
        return null;
      }

      console.error('Unexpected embedding service error', error);
      return null;
    }
  }
}

export const embeddingService = new EmbeddingService(
  createEmbeddingProvider(),
);
