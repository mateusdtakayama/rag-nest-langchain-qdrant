import { ConfigException } from './config.exception';
import { configSchema } from './config.schema';
import { Config } from './config.type';

export const factory = (): Config => {
  const result = configSchema.safeParse({
    env: process.env.NODE_ENV,
    port: process.env.PORT,
    apiKey: process.env.ACCESS_API_KEY,
    qdrant_url: process.env.QDRANT_URL,
    qdrant_collection_name: process.env.QDRANT_COLLECTION_NAME,
    tavily_api_key: process.env.TAVILY_API_KEY,
  });

  if (result.success) {
    return result.data;
  }

  throw new ConfigException(
    `Invalid application configuration: ${result.error.message}`,
  );
};
