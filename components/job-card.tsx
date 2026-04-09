import { StatusBadge } from './status-badge'
import { formatDistanceToNow } from 'date-fns'

interface Job {
  id: string
  title: string | null
  status: string
  videoUrl: string | null
  errorMessage: string | null
  createdAt: string
  story?: { title: string } | null
}

export function JobCard({ job }: { job: Job }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition-colors">
      {job.videoUrl ? (
        <video
          src={job.videoUrl}
          className="w-full aspect-[9/16] object-cover bg-zinc-800"
          muted
          loop
          playsInline
          onMouseOver={e => (e.target as HTMLVideoElement).play()}
          onMouseOut={e => {
            const v = e.target as HTMLVideoElement
            v.pause()
            v.currentTime = 0
          }}
        />
      ) : (
        <div className="w-full aspect-[9/16] bg-zinc-800 flex items-center justify-center">
          <div className="text-zinc-600 text-xs">
            {job.status === 'failed' ? '✕ Failed' : '⟳ Processing'}
          </div>
        </div>
      )}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <p className="text-sm font-medium line-clamp-2 leading-snug">
            {job.title ?? job.story?.title ?? 'Untitled'}
          </p>
          <StatusBadge status={job.status} />
        </div>
        <p className="text-xs text-zinc-500">
          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
        </p>
        {job.errorMessage && (
          <p className="text-xs text-red-400 mt-1 line-clamp-2">{job.errorMessage}</p>
        )}
      </div>
    </div>
  )
}
