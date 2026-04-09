import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(stories)
}

export async function POST(req: Request) {
  const body = await req.json() as { title: string; content: string }

  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }

  const story = await prisma.story.create({
    data: { title: body.title.trim(), content: body.content.trim() },
  })

  return NextResponse.json(story, { status: 201 })
}
