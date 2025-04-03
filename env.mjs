// Import Zod for runtime type checking and validation
import { z } from 'zod';

// Define the schema for environment variables using Zod
// This ensures all required environment variables are present and of the correct type
const envSchema = z.object({
  // Redis connection credentials
  REDIS_USERNAME: z.string(), // Redis username (default is 'default')
  REDIS_PASSWORD: z.string(), // Redis password for authentication
  REDIS_HOST: z.string(),     // Redis server hostname or IP address
  REDIS_PORT: z.coerce.number(), // Redis server port (converted to number)
  
  // Discord webhook URL for notifications
  DISCORD_WEBHOOK_URL: z.string(), // URL for Discord webhook integration
});

// Parse and validate environment variables against the schema
// This will throw an error if any required variables are missing or invalid
export const env = envSchema.parse({
  REDIS_USERNAME: process.env.REDIS_USERNAME,
  REDIS_PASSWORD: process.env.REDIS_PASSWORD,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
}); 