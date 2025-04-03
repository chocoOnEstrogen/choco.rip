import { createClient, RedisClientType } from 'redis';
import { env } from '@/env.mjs';

// Create a singleton Redis client with connection pooling
let redisClient: RedisClientType | null = null;
let isConnecting = false;
let connectionPromise: Promise<RedisClientType> | null = null;

export const getRedisClient = async () => {
  if (isConnecting) {
    return connectionPromise;
  }

  if (!redisClient) {
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        redisClient = createClient({
          username: env.REDIS_USERNAME,
          password: env.REDIS_PASSWORD,
          socket: {
            host: env.REDIS_HOST,
            port: env.REDIS_PORT,
          },
          pingInterval: 1000, // Keep connection alive
        });

        redisClient.on('error', (error: Error) => {
          console.error('Redis Client Error:', error);
        });

        redisClient.on('connect', () => {
          console.log('Redis Client Connected');
        });

        redisClient.on('reconnecting', () => {
          console.log('Redis Client Reconnecting');
        });

        await redisClient.connect();
        return redisClient;
      } finally {
        isConnecting = false;
        connectionPromise = null;
      }
    })();
  }

  return redisClient;
};

// Enhanced Redis operations with error handling and type safety
export const redis = {
  async set(key: string, value: string | number | object, ttl?: number) {
    try {
      const client = await getRedisClient();
      if (!client) {
        throw new Error('Redis client not initialized');
      }
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
      if (ttl) {
        return client.set(key, serializedValue, { EX: ttl });
      }
      return client.set(key, serializedValue);
    } catch (error) {
      console.error(`Redis SET Error for key ${key}:`, error);
      throw error;
    }
  },

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const client = await getRedisClient();
      if (!client) {
        throw new Error('Redis client not initialized');
      }
      const value = await client.get(key);
      if (!value) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.error(`Redis GET Error for key ${key}:`, error);
      throw error;
    }
  },

  async del(key: string) {
    try {
      const client = await getRedisClient();
      if (!client) {
        throw new Error('Redis client not initialized');
      }
      return client.del(key);
    } catch (error) {
      console.error(`Redis DEL Error for key ${key}:`, error);
      throw error;
    }
  },

  async exists(key: string) {
    try {
      const client = await getRedisClient();
      if (!client) {
        throw new Error('Redis client not initialized');
      }
      return client.exists(key);
    } catch (error) {
      console.error(`Redis EXISTS Error for key ${key}:`, error);
      throw error;
    }
  },

  async disconnect() {
    if (redisClient) {
      try {
        await redisClient.disconnect();
      } finally {
        redisClient = null;
      }
    }
  },
};