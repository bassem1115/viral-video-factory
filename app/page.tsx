export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { DbNotConfigured } from '@/components/db-not-configured'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  let jobs: Awaited<ReturnType<typeof prisma.job.findMany<{ include: { story: { select: { title: true } } } }>>> = []
  try {
    jobs = await prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { story: { select: { title: true } } },
    })
  } catch {
    return <DbNotConfigured />
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-0.5">{jobs.length} videos generated</p>
        </div>
        <Link href="/generate">
          <Button size="sm" className="gap-1.5">
            <Plus className="w-4 h-4" />
            New Video
          </Button>
        </Link>
      </div>

      {jobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-600">
          <p className="text-sm">No videos yet.</p>
          <Link href="/generate" className="text-sm text-zinc-400 hover:text-white mt-2 underline">
            Generate your first video →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {jobs.map(job => (
            <JobCard
              key={job.id}
              job={{ ...job, createdAt: job.createdAt.toISOString() }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
