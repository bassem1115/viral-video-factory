export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { StoriesTable } from '@/components/stories-table'
import { DbNotConfigured } from '@/components/db-not-configured'

export default async function StoriesPage() {
  let stories: { id: string; title: string; content: string }[] = []
  try {
    stories = await prisma.story.findMany({ orderBy: { createdAt: 'asc' } })
  } catch {
    return <DbNotConfigured />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Stories</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{stories.length} stories available</p>
      </div>
      <StoriesTable stories={stories} />
    </div>
  )
}
