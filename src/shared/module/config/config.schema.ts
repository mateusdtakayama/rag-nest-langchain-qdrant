import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const apiKeySchema = z.string();

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  apiKey: apiKeySchema,
  openai_api_key: z.string(),
  qdrant_url: z.string(),
  qdrant_collection_name: z.string(),
  tavily_api_key: z.string(),
});
