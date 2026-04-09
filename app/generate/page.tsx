import { prisma } from '@/lib/prisma'
import { GenerateForm } from '@/components/generate-form'

export default async function GeneratePage() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, title: true },
  })

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
