export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { GenerateForm } from '@/components/generate-form'
import { DbNotConfigured } from '@/components/db-not-configured'

export default async function GeneratePage() {
  let stories: { id: string; title: string }[] = []
  try {
    stories = await prisma.story.findMany({
      orderBy: { createdAt: 'asc' },
      select: { id: true, title: true },
    })
  } catch {
    return <DbNotConfigured />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Generate Video</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          Select a story and watch the video generate live.
        </p>
      </div>
      <GenerateForm stories={stories} />
    </div>
  )
}
