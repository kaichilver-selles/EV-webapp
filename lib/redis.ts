import { createClient } from 'redis';

// Create Redis client singleton
let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
  if (!client) {
    // Create a new client if none exists
    client = createClient({
      url: process.env.KV_URL,
    });
    
    // Log connection events
    client.on('error', (err) => console.error('Redis Client Error', err));
    client.on('connect', () => console.log('Redis Client Connected'));
    
    // Connect to Redis
    await client.connect();
  }
  
  return client;
}

// Helper function to ensure connection is closed when the app is shutting down
export async function closeRedisConnection() {
  if (client) {
    await client.quit();
    client = null;
  }
} 