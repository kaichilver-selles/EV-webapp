import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { Tariff } from '@/lib/types'
import { defaultTariffs } from '@/lib/utils'

// GET handler to retrieve tariffs
export async function GET() {
  try {
    // Get tariffs from KV store
    let tariffs = await kv.get<Tariff[]>('tariffs')

    // If no tariffs exist yet, initialize with default tariffs
    if (!tariffs) {
      await kv.set('tariffs', defaultTariffs)
      tariffs = defaultTariffs
    }

    return NextResponse.json(tariffs)
  } catch (error) {
    console.error('Error fetching tariffs:', error)
    return NextResponse.json({ error: 'Failed to fetch tariffs' }, { status: 500 })
  }
}

// POST handler to save tariffs
export async function POST(request: Request) {
  try {
    const tariffs = await request.json()
    await kv.set('tariffs', tariffs)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving tariffs:', error)
    return NextResponse.json({ error: 'Failed to save tariffs' }, { status: 500 })
  }
} 