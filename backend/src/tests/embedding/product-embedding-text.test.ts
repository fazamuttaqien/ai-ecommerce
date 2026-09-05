import assert from 'node:assert/strict';

import { buildProductEmbeddingText } from '../../services/product-embedding-text.service';

const product = {
  name: 'Wireless Headphones',
  description: 'Noise cancelling headphones for travel and work.',
  unit: 'pc',
  category: { name: 'Audio' },
};

const text = buildProductEmbeddingText(product);

assert.equal(
  text,
  'Product: Wireless Headphones\nDescription: Noise cancelling headphones for travel and work.\nCategory: Audio\nUnit: pc',
);

assert.equal(
  buildProductEmbeddingText({
    ...product,
    description: null,
    category: null,
  }),
  'Product: Wireless Headphones\nUnit: pc',
);

console.log('Product embedding text tests passed.');
