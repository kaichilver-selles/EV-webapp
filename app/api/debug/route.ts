import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

export async function GET() {
  try {
    // Check if Redis URL is configured
    const redisUrl = process.env.KV_URL || process.env.REDIS_URL;
    const redisConfigured = !!redisUrl;
    
    // Attempt to connect to Redis and perform a simple operation
    let redisConnected = false;
    let redisError = null;
    
    try {
      const redis = await getRedisClient();
      // Try to set and get a test value
      await redis.set('debug-test', 'test-value');
      const testValue = await redis.get('debug-test');
      redisConnected = testValue === 'test-value';
    } catch (error) {
      redisError = error instanceof Error ? error.message : String(error);
    }
    
    // Return the debug information
    return NextResponse.json({
      environment: process.env.NODE_ENV,
      redis: {
        configured: redisConfigured,
        connected: redisConnected,
        url: redisUrl ? `${redisUrl.substring(0, 15)}...` : null,
        error: redisError
      },
      env_vars: {
        KV_URL: !!process.env.KV_URL,
        REDIS_URL: !!process.env.REDIS_URL,
        KV_REST_API_URL: !!process.env.KV_REST_API_URL,
        KV_REST_API_TOKEN: !!process.env.KV_REST_API_TOKEN,
        KV_REST_API_READ_ONLY_TOKEN: !!process.env.KV_REST_API_READ_ONLY_TOKEN
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 