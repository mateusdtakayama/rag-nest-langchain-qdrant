import { z } from 'zod';

export const environmentSchema = z.enum(['test', 'development', 'production']);

export const apiKeySchema = z.string();

export const configSchema = z.object({
  env: environmentSchema,
  port: z.coerce.number().positive().int(),
  apiKey: apiKeySchema,
});
