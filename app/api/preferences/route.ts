import { NextResponse } from 'next/server'
import { getRedisClient } from '@/lib/redis'

interface Preferences {
  selectedTariffForView: string
  activeTab: string
}

const defaultPreferences: Preferences = {
  selectedTariffForView: '',
  activeTab: 'ev-charging'
}

// GET handler to retrieve preferences
export async function GET() {
  try {
    const redis = await getRedisClient();
    
    // Get preferences from Redis
    let prefsData = await redis.get('preferences');
    let preferences: Preferences | null = null;
    
    // Parse the JSON if it exists
    if (prefsData) {
      preferences = JSON.parse(prefsData);
    }

    // If no preferences exist yet, initialize with defaults
    if (!preferences) {
      const defaultJson = JSON.stringify(defaultPreferences);
      await redis.set('preferences', defaultJson);
      preferences = defaultPreferences;
    }

    return NextResponse.json(preferences);
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// POST handler to save preferences
export async function POST(request: Request) {
  try {
    const preferences = await request.json();
    const redis = await getRedisClient();
    
    // Store as JSON string
    await redis.set('preferences', JSON.stringify(preferences));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
} 