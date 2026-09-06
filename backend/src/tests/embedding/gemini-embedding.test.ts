import assert from 'node:assert/strict';

import {
  EMBEDDING_DIMENSION,
  EMBEDDING_MODEL,
  EMBEDDING_PROVIDER,
  EMBEDDING_TASK_TYPES,
} from '../../config/embedding.config';
import {
  EmbeddingProviderError,
  type EmbeddingProvider,
} from '../../embeddings/embedding.provider';
import { EmbeddingService } from '../../services/embedding.service';

const successfulProvider: EmbeddingProvider = {
  name: EMBEDDING_PROVIDER,
  model: EMBEDDING_MODEL,
  dimension: EMBEDDING_DIMENSION,
  embedDocument: async () => [0.1, 0.2, 0.3],
  embedQuery: async () => [0.4, 0.5, 0.6],
};

const failingProvider: EmbeddingProvider = {
  ...successfulProvider,
  embedDocument: async () => {
    throw new EmbeddingProviderError(
      'Gemini embedding rate limit exceeded',
      'RATE_LIMIT',
    );
  },
};

const tests = [
  {
    name: 'uses the configured Gemini retrieval model and task types',
    run: () => {
      assert.equal(EMBEDDING_PROVIDER, 'gemini');
      assert.equal(EMBEDDING_MODEL, 'gemini-embedding-001');
      assert.equal(EMBEDDING_DIMENSION, 1536);
      assert.equal(EMBEDDING_TASK_TYPES.document, 'RETRIEVAL_DOCUMENT');
      assert.equal(EMBEDDING_TASK_TYPES.query, 'RETRIEVAL_QUERY');
    },
  },
  {
    name: 'returns embeddings from a configured provider',
    run: async () => {
      const service = new EmbeddingService(successfulProvider);
      assert.deepEqual(
        await service.embedDocument('wireless headphones'),
        [0.1, 0.2, 0.3],
      );
      assert.deepEqual(
        await service.embedQuery('headphones for travel'),
        [0.4, 0.5, 0.6],
      );
    },
  },
  {
    name: 'does not throw when provider is unavailable',
    run: async () => {
      const service = new EmbeddingService(null);
      assert.equal(await service.embedDocument('product'), null);
      assert.equal(await service.embedQuery('search'), null);
    },
  },
  {
    name: 'does not throw when Gemini provider fails',
    run: async () => {
      const service = new EmbeddingService(failingProvider);
      assert.equal(await service.embedDocument('product'), null);
    },
  },
];

(async () => {
  for (const test of tests) {
    await test.run();
  }

  console.log(`${tests.length} Gemini embedding tests passed.`);
})().catch((error) => {
  console.error('Gemini embedding tests failed:', error);
  process.exitCode = 1;
});
