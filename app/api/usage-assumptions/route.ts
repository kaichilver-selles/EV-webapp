import { NextResponse } from 'next/server'
import type { UsageAssumptions } from '@/lib/types'
import { defaultUsageAssumptions } from '@/lib/utils'
import { getRedisClient } from '@/lib/redis'

// GET handler to retrieve usage assumptions
export async function GET() {
  try {
    const redis = await getRedisClient();
    
    // Get usage assumptions from Redis
    let usageData = await redis.get('usageAssumptions');
    let usageAssumptions: UsageAssumptions | null = null;
    
    // Parse the JSON if it exists
    if (usageData) {
      usageAssumptions = JSON.parse(usageData);
    }

    // If no usage assumptions exist yet, initialize with defaults
    if (!usageAssumptions) {
      const defaultJson = JSON.stringify(defaultUsageAssumptions);
      await redis.set('usageAssumptions', defaultJson);
      usageAssumptions = defaultUsageAssumptions;
    }

    return NextResponse.json(usageAssumptions);
  } catch (error) {
    console.error('Error fetching usage assumptions:', error)
    return NextResponse.json({ error: 'Failed to fetch usage assumptions' }, { status: 500 })
  }
}

// POST handler to save usage assumptions
export async function POST(request: Request) {
  try {
    const usageAssumptions = await request.json();
    const redis = await getRedisClient();
    
    // Store as JSON string
    await redis.set('usageAssumptions', JSON.stringify(usageAssumptions));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving usage assumptions:', error)
    return NextResponse.json({ error: 'Failed to save usage assumptions' }, { status: 500 })
  }
} 