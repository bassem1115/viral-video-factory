export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { StoriesTable } from '@/components/stories-table'

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({ orderBy: { createdAt: 'asc' } })

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
