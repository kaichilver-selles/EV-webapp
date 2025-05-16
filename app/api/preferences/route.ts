import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'

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
    // Get preferences from KV store
    let preferences = await kv.get<Preferences>('preferences')

    // If no preferences exist yet, initialize with defaults
    if (!preferences) {
      await kv.set('preferences', defaultPreferences)
      preferences = defaultPreferences
    }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching preferences:', error)
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 })
  }
}

// POST handler to save preferences
export async function POST(request: Request) {
  try {
    const preferences = await request.json()
    await kv.set('preferences', preferences)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving preferences:', error)
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 })
  }
} 