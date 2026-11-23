// OpenAPI 3.1 description of the public AmericanPeptide.com HTTP API.
//
// This is the machine-readable `service-desc` (RFC 8631) advertised from
// /.well-known/api-catalog and served at /openapi.json. It documents the open,
// keyless GET API (catalog + per-peptide), the markdown twins, and the
// self-serve key endpoints. It is built from the same constants the API and the
// /developers page use (API_SITE, API_VERSION, TIERS), so the contract and the
// implementation share one source of truth.

import {
  API_SITE,
  API_VERSION,
  API_LICENSE,
  API_ATTRIBUTION,
} from './catalog-api'

const LICENSE_URL = 'https://creativecommons.org/licenses/by/4.0/'

// A nullable string/number/integer schema (OpenAPI 3.1 / JSON Schema style).
const nullable = (type: 'string' | 'number' | 'integer') => ({
  type: [type, 'null'],
})

export function openApiSpec() {
  return {
    openapi: '3.1.0',
    info: {
      title: `${API_ATTRIBUTION} API`,
      version: API_VERSION,
      summary: 'Open, CC BY 4.0 catalog of research peptides.',
      description:
        'Open HTTP API over a PubChem-enriched catalog of research peptides: list and filter the catalog, fetch a single peptide (with live clinical-trial / PubMed context), and read token-efficient markdown twins. GET endpoints are keyless with permissive CORS; an optional free API key raises rate and daily limits. Research and educational content, not medical advice.',
      termsOfService: `${API_SITE}/developers`,
      license: { name: API_LICENSE, url: LICENSE_URL },
    },
    servers: [{ url: API_SITE }],
    externalDocs: {
      description: 'Developer documentation',
      url: `${API_SITE}/developers`,
    },
    tags: [
      { name: 'catalog', description: 'Peptide catalog data (JSON).' },
      { name: 'markdown', description: 'Token-efficient markdown twins for agents.' },
      { name: 'keys', description: 'Self-serve API keys for higher limits.' },
    ],
    paths: {
      '/api/catalog': {
        get: {
          tags: ['catalog'],
          operationId: 'listCatalog',
          summary: 'List and filter the peptide catalog',
          description:
            'Returns catalog peptides with optional filtering. All filters combine (AND). The response also enumerates the valid `category` ids and research-area `slug`s.',
          security: [{}, { ApiKeyHeader: [] }, { BearerAuth: [] }],
          parameters: [
            {
              name: 'category',
              in: 'query',
              required: false,
              description: 'Filter by catalog category id (see `categories` in the response).',
              schema: { type: 'string' },
            },
            {
              name: 'area',
              in: 'query',
              required: false,
              description: 'Filter by research-area slug (see `researchAreas` in the response).',
              schema: { type: 'string' },
            },
            {
              name: 'fda',
              in: 'query',
              required: false,
              description: 'Set to `true` to return only FDA-approved peptides.',
              schema: { type: 'string', enum: ['true'] },
            },
            {
              name: 'q',
              in: 'query',
              required: false,
              description: 'Free-text search over name, aliases, and description.',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Matching peptides.',
              headers: {
                'X-Quota-Limit': { schema: { type: 'integer' }, description: 'Daily quota for the caller’s tier.' },
                'X-Quota-Remaining': { schema: { type: 'integer' }, description: 'Remaining calls today.' },
              },
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/CatalogListResponse' } },
              },
            },
            '400': { $ref: '#/components/responses/Error' },
            '429': { $ref: '#/components/responses/Error' },
          },
        },
      },
      '/api/catalog/{slug}': {
        get: {
          tags: ['catalog'],
          operationId: 'getPeptide',
          summary: 'Get a single peptide by slug',
          description:
            'Full reference for one peptide plus live "latest research" (recent ClinicalTrials.gov and PubMed hits, refreshed daily).',
          security: [{}, { ApiKeyHeader: [] }, { BearerAuth: [] }],
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              description: 'Peptide slug, e.g. `semaglutide` or `bpc-157`.',
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'The peptide.',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/PeptideResponse' } },
              },
            },
            '404': { $ref: '#/components/responses/Error' },
            '429': { $ref: '#/components/responses/Error' },
          },
        },
      },
      '/catalog/{slug}.md': {
        get: {
          tags: ['markdown'],
          operationId: 'getPeptideMarkdown',
          summary: 'A single peptide as clean markdown',
          description: 'Token-efficient markdown twin of the peptide page, for LLMs and agents.',
          parameters: [
            {
              name: 'slug',
              in: 'path',
              required: true,
              schema: { type: 'string' },
            },
          ],
          responses: {
            '200': {
              description: 'Peptide as markdown.',
              content: { 'text/markdown': { schema: { type: 'string' } } },
            },
            '404': {
              description: 'Unknown slug.',
              content: { 'text/plain': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/llms.txt': {
        get: {
          tags: ['markdown'],
          operationId: 'getLlmsIndex',
          summary: 'Curated markdown index of the whole site',
          description: 'The llmstxt.org index. The entire catalog as one document is at `/llms-full.txt`.',
          responses: {
            '200': {
              description: 'Markdown index.',
              content: { 'text/markdown': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/api/keys': {
        post: {
          tags: ['keys'],
          operationId: 'createKey',
          summary: 'Self-serve a free API key',
          description:
            'Issues a free-tier key. The plaintext key is returned ONCE and stored only as a hash — save it. Rate-limited per IP to deter mass creation.',
          requestBody: {
            required: false,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', description: 'Optional, for attribution.' },
                    label: { type: 'string', description: 'Optional label for the key.' },
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Key created.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiKeyCreated' } } },
            },
            '429': { $ref: '#/components/responses/Error' },
          },
        },
        get: {
          tags: ['keys'],
          operationId: 'getKeyInfo',
          summary: 'Inspect your key’s tier, limits, and usage',
          description: 'Authenticate with the key itself.',
          security: [{ ApiKeyHeader: [] }, { BearerAuth: [] }],
          responses: {
            '200': {
              description: 'Key info.',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/KeyInfo' } } },
            },
            '401': { $ref: '#/components/responses/Error' },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        ApiKeyHeader: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'A free API key from POST /api/keys. Optional — raises rate/quota limits.',
        },
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description: 'The same API key sent as `Authorization: Bearer <key>`.',
        },
      },
      responses: {
        Error: {
          description: 'Error — a human `error` message (quota errors return 429 with X-Quota-* headers).',
          content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
        },
      },
      schemas: {
        ApiMeta: {
          type: 'object',
          description: 'Metadata present on every JSON response.',
          required: ['version', 'license', 'attribution', 'documentation'],
          properties: {
            version: { type: 'string' },
            license: { type: 'string', examples: [API_LICENSE] },
            attribution: { type: 'string', examples: [API_ATTRIBUTION] },
            documentation: { type: 'string', format: 'uri' },
          },
        },
        ResearchAreaGuide: {
          type: 'object',
          required: ['slug', 'label', 'url'],
          properties: {
            slug: { type: 'string' },
            label: { type: 'string' },
            url: { type: 'string', format: 'uri' },
          },
        },
        Faq: {
          type: 'object',
          required: ['q', 'a'],
          properties: { q: { type: 'string' }, a: { type: 'string' } },
        },
        Peptide: {
          type: 'object',
          required: [
            'slug', 'name', 'aliases', 'categories', 'categoryLabels', 'researchAreas',
            'researchAreaGuides', 'shortDescription', 'description', 'background',
            'keyResearch', 'faqs', 'fdaApproved', 'url',
          ],
          properties: {
            slug: { type: 'string' },
            name: { type: 'string' },
            aliases: { type: 'array', items: { type: 'string' } },
            categories: { type: 'array', items: { type: 'string' } },
            categoryLabels: { type: 'array', items: { type: 'string' } },
            researchAreas: { type: 'array', items: { type: 'string' } },
            researchAreaGuides: { type: 'array', items: { $ref: '#/components/schemas/ResearchAreaGuide' } },
            shortDescription: { type: 'string' },
            description: { type: 'string' },
            background: { type: 'array', items: { type: 'string' } },
            keyResearch: { type: 'array', items: { type: 'string' } },
            faqs: { type: 'array', items: { $ref: '#/components/schemas/Faq' } },
            mechanism: nullable('string'),
            molecularWeight: nullable('number'),
            molecularFormula: nullable('string'),
            sequence: nullable('string'),
            cas: nullable('string'),
            pubchemCid: nullable('integer'),
            uniprotId: nullable('string'),
            fdaApproved: { type: 'boolean' },
            url: { type: 'string', format: 'uri' },
          },
        },
        RecentTrial: {
          type: 'object',
          required: ['nctId', 'title', 'url'],
          properties: {
            nctId: { type: 'string' },
            title: { type: 'string' },
            status: nullable('string'),
            phase: nullable('string'),
            lastUpdate: nullable('string'),
            url: { type: 'string', format: 'uri' },
          },
        },
        RecentArticle: {
          type: 'object',
          required: ['pmid', 'title', 'url'],
          properties: {
            pmid: { type: 'string' },
            title: { type: 'string' },
            journal: nullable('string'),
            date: nullable('string'),
            url: { type: 'string', format: 'uri' },
          },
        },
        LatestResearch: {
          type: 'object',
          required: ['query', 'trials', 'articles', 'fetchedAt'],
          properties: {
            query: { type: 'string' },
            trials: { type: 'array', items: { $ref: '#/components/schemas/RecentTrial' } },
            articles: { type: 'array', items: { $ref: '#/components/schemas/RecentArticle' } },
            fetchedAt: { type: 'string', format: 'date-time' },
          },
        },
        CatalogListResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiMeta' },
            {
              type: 'object',
              required: ['generated', 'filters', 'categories', 'researchAreas', 'count', 'peptides'],
              properties: {
                generated: { type: 'string', format: 'date-time' },
                filters: {
                  type: 'object',
                  properties: {
                    category: nullable('string'),
                    area: nullable('string'),
                    fda: { type: 'boolean' },
                    q: nullable('string'),
                  },
                },
                categories: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['id', 'label'],
                    properties: { id: { type: 'string' }, label: { type: 'string' } },
                  },
                },
                researchAreas: {
                  type: 'array',
                  items: {
                    type: 'object',
                    required: ['slug', 'label'],
                    properties: { slug: { type: 'string' }, label: { type: 'string' } },
                  },
                },
                count: { type: 'integer' },
                peptides: { type: 'array', items: { $ref: '#/components/schemas/Peptide' } },
              },
            },
          ],
        },
        PeptideResponse: {
          allOf: [
            { $ref: '#/components/schemas/ApiMeta' },
            {
              type: 'object',
              required: ['generated', 'peptide', 'latestResearch'],
              properties: {
                generated: { type: 'string', format: 'date-time' },
                peptide: { $ref: '#/components/schemas/Peptide' },
                latestResearch: { $ref: '#/components/schemas/LatestResearch' },
              },
            },
          ],
        },
        TierLimits: {
          type: 'object',
          required: ['label', 'perMinute', 'perDay'],
          properties: {
            label: { type: 'string' },
            perMinute: { type: 'integer' },
            perDay: { type: 'integer' },
          },
        },
        ApiKeyCreated: {
          type: 'object',
          required: ['key', 'tier', 'limits', 'note', 'documentation'],
          properties: {
            key: { type: 'string', description: 'The plaintext key — shown once.' },
            tier: { type: 'string', examples: ['free'] },
            label: { type: 'string' },
            created: { type: 'string', format: 'date-time' },
            limits: { $ref: '#/components/schemas/TierLimits' },
            persistent: { type: 'boolean' },
            note: { type: 'string' },
            documentation: { type: 'string', format: 'uri' },
          },
        },
        KeyInfo: {
          type: 'object',
          required: ['tier', 'limits'],
          properties: {
            tier: { type: 'string' },
            label: { type: 'string' },
            created: { type: 'string', format: 'date-time' },
            limits: { $ref: '#/components/schemas/TierLimits' },
            usage: { type: 'object', additionalProperties: true },
          },
        },
        Error: {
          allOf: [
            { $ref: '#/components/schemas/ApiMeta' },
            {
              type: 'object',
              required: ['error'],
              properties: {
                error: { type: 'string', description: 'Human-readable error message.' },
                code: { type: 'string', description: 'Machine-readable code, when present.' },
              },
            },
          ],
        },
      },
    },
  }
}
