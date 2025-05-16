import { NextResponse } from 'next/server'
import type { Tariff } from '@/lib/types'
import { defaultTariffs } from '@/lib/utils'
import { getRedisClient } from '@/lib/redis'

// GET handler to retrieve tariffs
export async function GET() {
  try {
    const redis = await getRedisClient();
    
    // Get tariffs from Redis
    let tariffs = await redis.get('tariffs');
    let parsedTariffs: Tariff[] | null = null;
    
    // Parse the JSON if it exists
    if (tariffs) {
      parsedTariffs = JSON.parse(tariffs);
    }

    // If no tariffs exist yet, initialize with default tariffs
    if (!parsedTariffs) {
      const defaultTariffsJson = JSON.stringify(defaultTariffs);
      await redis.set('tariffs', defaultTariffsJson);
      parsedTariffs = defaultTariffs;
    }

    return NextResponse.json(parsedTariffs);
  } catch (error) {
    console.error('Error fetching tariffs:', error)
    return NextResponse.json({ error: 'Failed to fetch tariffs' }, { status: 500 })
  }
}

// POST handler to save tariffs
export async function POST(request: Request) {
  try {
    const tariffs = await request.json();
    const redis = await getRedisClient();
    
    // Store the tariffs as a JSON string
    await redis.set('tariffs', JSON.stringify(tariffs));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving tariffs:', error)
    return NextResponse.json({ error: 'Failed to save tariffs' }, { status: 500 })
  }
} 