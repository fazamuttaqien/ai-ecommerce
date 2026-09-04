import type { LanguageModel } from 'ai';

import { aiConfig, createAIProvider } from '../config/ai.config';

export class AIServiceError extends Error {
  constructor(message = 'AI service is unavailable') {
    super(message);
    this.name = 'AIServiceError';
  }
}

/**
 * Provider-agnostic entry point for AI model access.
 * Business features should depend on this service rather than importing a
 * concrete provider such as @ai-sdk/groq directly.
 */
export const getAIModel = (): LanguageModel | null => {
  if (!aiConfig.enabled) {
    return null;
  }

  try {
    const provider = createAIProvider();

    if (!provider) {
      return null;
    }

    return provider.getModel(aiConfig.model);
  } catch (_error) {
    throw new AIServiceError();
  }
};
