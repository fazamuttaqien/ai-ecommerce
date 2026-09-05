import { GoogleGenAI } from '@google/genai';

import { embeddingConfig } from '../config/embedding.config';
import {
  EmbeddingProviderError,
  type EmbeddingProvider,
  type EmbeddingTaskType,
} from './embedding.provider';

type GeminiError = {
  status?: number;
  statusCode?: number;
  message?: string;
  name?: string;
};

const isGeminiError = (error: unknown): error is GeminiError =>
  typeof error === 'object' && error !== null;

const getErrorStatus = (error: unknown): number | undefined => {
  if (!isGeminiError(error)) return undefined;
  return error.status ?? error.statusCode;
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (isGeminiError(error) && typeof error.message === 'string') {
    return error.message;
  }
  return 'Unknown Gemini embedding error';
};

const isTimeoutError = (error: unknown): boolean => {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes('timeout') ||
    message.includes('timed out') ||
    (isGeminiError(error) && error.name === 'AbortError')
  );
};

const normalize = (values: number[]): number[] => {
  const magnitude = Math.sqrt(
    values.reduce((sum, value) => sum + value * value, 0),
  );

  if (!Number.isFinite(magnitude) || magnitude === 0) {
    throw new EmbeddingProviderError(
      'Gemini returned an embedding that cannot be normalized',
      'INVALID_RESPONSE',
    );
  }

  return values.map((value) => value / magnitude);
};

export class GeminiEmbeddingProvider implements EmbeddingProvider {
  readonly name = embeddingConfig.provider;
  readonly model = embeddingConfig.model;
  readonly dimension = embeddingConfig.dimension;

  private readonly client: GoogleGenAI;

  constructor(apiKey = embeddingConfig.apiKey) {
    if (!apiKey.trim()) {
      throw new EmbeddingProviderError(
        'GEMINI_API_KEY is not configured',
        'MISSING_API_KEY',
      );
    }

    this.client = new GoogleGenAI({ apiKey });
  }

  async embedDocument(text: string): Promise<number[]> {
    return this.embed(text, embeddingConfig.taskTypes.document);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embed(text, embeddingConfig.taskTypes.query);
  }

  private async embed(text: string, taskType: EmbeddingTaskType): Promise<number[]> {
    if (!text.trim()) {
      throw new EmbeddingProviderError(
        'Embedding input must not be empty',
        'INVALID_RESPONSE',
      );
    }

    try {
      const response = await this.client.models.embedContent({
        model: this.model,
        contents: text,
        config: {
          taskType,
          outputDimensionality: this.dimension,
          httpOptions: {
            timeout: embeddingConfig.timeoutMs,
          },
        },
      });

      const values = response.embeddings?.[0]?.values;

      if (!values || values.length === 0) {
        throw new EmbeddingProviderError(
          'Gemini returned an empty embedding',
          'EMPTY_EMBEDDING',
        );
      }

      if (
        values.length !== this.dimension ||
        values.some((value) => !Number.isFinite(value))
      ) {
        throw new EmbeddingProviderError(
          `Gemini returned an invalid embedding dimension; expected ${this.dimension}`,
          'INVALID_RESPONSE',
        );
      }

      return normalize(values);
    } catch (error) {
      if (error instanceof EmbeddingProviderError) {
        throw error;
      }

      if (isTimeoutError(error)) {
        throw new EmbeddingProviderError(
          'Gemini embedding request timed out',
          'TIMEOUT',
          error,
        );
      }

      const status = getErrorStatus(error);
      if (status === 429) {
        throw new EmbeddingProviderError(
          'Gemini embedding rate limit exceeded',
          'RATE_LIMIT',
          error,
        );
      }

      throw new EmbeddingProviderError(
        'Gemini embedding API request failed',
        'API_ERROR',
        error,
      );
    }
  }
}
