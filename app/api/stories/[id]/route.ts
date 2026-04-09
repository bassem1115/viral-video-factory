import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json() as { title?: string; content?: string }

  const story = await prisma.story.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.content && { content: body.content.trim() }),
    },
  })

  return NextResponse.json(story)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.story.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
