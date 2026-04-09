import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { story: { select: { title: true } } },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: Request) {
  const body = await req.json() as { storyId: string }

  if (!body.storyId) {
    return NextResponse.json({ error: 'storyId is required' }, { status: 400 })
  }

  const story = await prisma.story.findUnique({ where: { id: body.storyId } })
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  const job = await prisma.job.create({
    data: { storyId: story.id, status: 'idle' },
  })

  return NextResponse.json({ jobId: job.id }, { status: 201 })
}
