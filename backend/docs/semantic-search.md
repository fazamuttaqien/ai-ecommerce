# AI Semantic Search

Semantic search uses Gemini embeddings and PostgreSQL pgvector. The request embedding is generated with the same Gemini model used for product document embeddings, then PostgreSQL ranks products by cosine distance.

## Architecture

```text
User query
  -> SemanticSearchService
  -> EmbeddingService.embedQueryOrThrow()
  -> Gemini Embedding API
  -> query embedding
  -> SemanticSearchRepository
  -> PostgreSQL pgvector
  -> cosine distance / similarity
  -> paginated products
```

## Endpoint

```text
GET /api/products/semantic-search
```

Query parameters:

- `query` required
- `page` optional, default `1`
- `pageSize` optional, default `20`, maximum `100`
- `categoryId` optional
- `minPrice` optional
- `maxPrice` optional

Example:

```text
GET /api/products/semantic-search?query=wireless%20headphones&page=1&pageSize=20&categoryId=<category-id>&minPrice=50&maxPrice=200
```

Results are ordered from most relevant to least relevant. The configured similarity threshold is applied in PostgreSQL before pagination.

## Configuration

Optional environment variables:

```env
SEMANTIC_SEARCH_SIMILARITY_THRESHOLD=0.35
SEMANTIC_SEARCH_DEFAULT_PAGE_SIZE=20
SEMANTIC_SEARCH_MAX_PAGE_SIZE=100
```

`SEMANTIC_SEARCH_SIMILARITY_THRESHOLD` must be between `0` and `1`. The default is defined by backend configuration, not in the repository query.

Gemini remains backend-only through `GEMINI_API_KEY`.

## Database

`product_embeddings.embedding` uses `vector(1536)` and has an HNSW index using `vector_cosine_ops`. Each product has at most one embedding for the configured Gemini model because `(product_id, model)` is unique.

The repository performs filtering, ordering, pagination, and the similarity threshold directly in PostgreSQL. It selects only the product fields needed by the search response and never loads the full product catalog into application memory.

## Brand filter

The current PostgreSQL product schema does not contain a `brand` column or a generic product-attributes column. Therefore semantic search does not expose a fake `brand` filter. A real brand filter should be added only after the product schema has a canonical brand field.

## Scope

This implementation does not change the existing AI Shopping Assistant behavior and does not introduce Elasticsearch, Pinecone, Weaviate, Redis, Python, or another search service.
