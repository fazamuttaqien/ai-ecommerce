import assert from 'node:assert/strict';

import { generateAIChat, AI_CHAT_MAX_TOOL_ROUNDS, AIServiceUnavailableError } from '../../services/ai.service';
import { aiChatSchema, AI_CHAT_LIMITS } from '../../validators/ai.validator';

const validInput = {
  messages: [{ role: 'user' as const, content: 'Show cheap products' }],
};

const tests = [
  {
    name: 'accepts valid chat messages',
    run: () => {
      const parsed = aiChatSchema.parse(validInput);
      assert.equal(parsed.messages.length, 1);
    },
  },
  {
    name: 'rejects malformed request',
    run: () => {
      assert.throws(() => aiChatSchema.parse({ messages: [] }));
      assert.throws(() => aiChatSchema.parse({ messages: [{ role: 'system', content: 'x' }] }));
    },
  },
  {
    name: 'enforces message count and input length limits',
    run: () => {
      assert.equal(AI_CHAT_LIMITS.maxMessages, 20);
      assert.equal(AI_CHAT_LIMITS.maxMessageLength, 4000);
      assert.equal(AI_CHAT_LIMITS.maxTotalInputLength, 12000);
      assert.throws(() =>
        aiChatSchema.parse({
          messages: Array.from({ length: 21 }, () => ({ role: 'user', content: 'x' })),
        }),
      );
      assert.throws(() =>
        aiChatSchema.parse({
          messages: [{ role: 'user', content: 'x'.repeat(4001) }],
        }),
      );
      assert.throws(() =>
        aiChatSchema.parse({
          messages: Array.from({ length: 3 }, () => ({ role: 'user', content: 'x'.repeat(4000) })),
        }),
      );
    },
  },
  {
    name: 'returns controlled disabled-provider error',
    run: async () => {
      await assert.rejects(
        () => generateAIChat(validInput, null),
        (error: unknown) => error instanceof AIServiceUnavailableError && error.statusCode === 503,
      );
    },
  },
  {
    name: 'limits tool rounds',
    run: () => {
      assert.equal(AI_CHAT_MAX_TOOL_ROUNDS, 5);
    },
  },
  {
    name: 'provider failures are sanitized',
    run: async () => {
      const fakeModel = {} as Parameters<typeof generateAIChat>[1];
      await assert.rejects(
        () => generateAIChat(validInput, fakeModel),
        (error: unknown) =>
          error instanceof Error &&
          error.message === 'AI service is unavailable',
      );
    },
  },
];

(async () => {
  for (const test of tests) {
    await test.run();
  }

  console.log(`${tests.length} AI chat tests passed.`);
})().catch((error) => {
  console.error('AI chat tests failed:', error);
  process.exitCode = 1;
});
