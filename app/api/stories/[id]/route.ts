import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json() as { title?: string; content?: string }

  const title = body.title?.trim()
  const content = body.content?.trim()

  if (title !== undefined && title === '') {
    return NextResponse.json({ error: 'title cannot be empty' }, { status: 400 })
  }
  if (content !== undefined && content === '') {
    return NextResponse.json({ error: 'content cannot be empty' }, { status: 400 })
  }

  try {
    const story = await prisma.story.update({
      where: { id: params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
      },
    })
    return NextResponse.json(story)
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw e
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.story.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    throw e
  }
}
