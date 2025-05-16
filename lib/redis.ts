import { createClient } from 'redis';

// Create Redis client singleton
let client: ReturnType<typeof createClient> | null = null;

// Mock implementation for local development when Redis is not available
const mockRedisClient = {
  get: async (key: string) => null,
  set: async (key: string, value: string) => true,
  quit: async () => true,
  on: (event: string, callback: any) => {}
};

export async function getRedisClient() {
  // Check if Redis URL is configured
  if (!process.env.KV_URL) {
    console.warn('Redis URL not configured. Using mock implementation.');
    return mockRedisClient as unknown as ReturnType<typeof createClient>;
  }

  if (!client) {
    try {
      // Create a new client if none exists
      client = createClient({
        url: process.env.KV_URL,
      });
      
      // Log connection events
      client.on('error', (err) => {
        console.error('Redis Client Error', err);
      });
      
      client.on('connect', () => console.log('Redis Client Connected'));
      
      // Connect to Redis with timeout
      const connectPromise = client.connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      console.warn('Using mock implementation instead');
      return mockRedisClient as unknown as ReturnType<typeof createClient>;
    }
  }
  
  return client;
}

// Helper function to ensure connection is closed when the app is shutting down
export async function closeRedisConnection() {
  if (client) {
    try {
      await client.quit();
    } catch (error) {
      console.error('Error closing Redis connection:', error);
    }
    client = null;
  }
} 