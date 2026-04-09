import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiKeySource } from '@/lib/api-keys'

const KEYS = ['OPENROUTER_API_KEY', 'KIE_AI_API_KEY'] as const

export async function GET() {
  const result: Record<string, { source: string; masked: string }> = {}

  for (const key of KEYS) {
    const source = await getApiKeySource(key)
    const dbSetting = await prisma.setting.findUnique({ where: { key } })
    const value = dbSetting?.value ?? process.env[key] ?? ''
    result[key] = {
      source,
      masked: value ? `${value.slice(0, 6)}${'•'.repeat(Math.max(0, value.length - 10))}${value.slice(-4)}` : '',
    }
  }

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const body = await req.json() as { key: string; value: string | null }

  if (!KEYS.includes(body.key as typeof KEYS[number])) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  if (body.value === null) {
    await prisma.setting.deleteMany({ where: { key: body.key } })
    return NextResponse.json({ ok: true, action: 'cleared' })
  }

  await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: { key: body.key, value: body.value },
  })

  return NextResponse.json({ ok: true, action: 'saved' })
}
