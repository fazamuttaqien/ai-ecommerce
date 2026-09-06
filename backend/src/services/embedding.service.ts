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
    try {
      return await this.embedDocumentOrThrow(text);
    } catch (error) {
      this.logError(error);
      return null;
    }
  }

  async embedQuery(text: string): Promise<number[] | null> {
    try {
      return await this.embedQueryOrThrow(text);
    } catch (error) {
      this.logError(error);
      return null;
    }
  }

  async embedDocumentOrThrow(text: string): Promise<number[]> {
    if (!this.provider) {
      throw new EmbeddingProviderError(
        'Embedding provider is not configured',
        'MISSING_API_KEY',
      );
    }

    return this.provider.embedDocument(text);
  }

  async embedQueryOrThrow(text: string): Promise<number[]> {
    if (!this.provider) {
      throw new EmbeddingProviderError(
        'Embedding provider is not configured',
        'MISSING_API_KEY',
      );
    }

    return this.provider.embedQuery(text);
  }

  private logError(error: unknown): void {
    if (error instanceof EmbeddingProviderError) {
      console.error(
        `Embedding provider error [${error.code}]: ${error.message}`,
      );
      return;
    }

    console.error('Unexpected embedding service error', error);
  }
}

export const embeddingService = new EmbeddingService(createEmbeddingProvider());
