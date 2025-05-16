import { kv } from '@vercel/kv'
import { NextResponse } from 'next/server'
import type { UsageAssumptions } from '@/lib/types'
import { defaultUsageAssumptions } from '@/lib/utils'

// GET handler to retrieve usage assumptions
export async function GET() {
  try {
    // Get usage assumptions from KV store
    let usageAssumptions = await kv.get<UsageAssumptions>('usageAssumptions')

    // If no usage assumptions exist yet, initialize with defaults
    if (!usageAssumptions) {
      await kv.set('usageAssumptions', defaultUsageAssumptions)
      usageAssumptions = defaultUsageAssumptions
    }

    return NextResponse.json(usageAssumptions)
  } catch (error) {
    console.error('Error fetching usage assumptions:', error)
    return NextResponse.json({ error: 'Failed to fetch usage assumptions' }, { status: 500 })
  }
}

// POST handler to save usage assumptions
export async function POST(request: Request) {
  try {
    const usageAssumptions = await request.json()
    await kv.set('usageAssumptions', usageAssumptions)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving usage assumptions:', error)
    return NextResponse.json({ error: 'Failed to save usage assumptions' }, { status: 500 })
  }
} 