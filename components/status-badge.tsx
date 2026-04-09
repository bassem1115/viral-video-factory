import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  idle:             { label: 'Queued',     className: 'bg-zinc-700 text-zinc-300' },
  scripting:        { label: 'Scripting',  className: 'bg-blue-900 text-blue-300' },
  video_queued:     { label: 'Queued',     className: 'bg-yellow-900 text-yellow-300' },
  video_processing: { label: 'Generating', className: 'bg-orange-900 text-orange-300' },
  done:             { label: 'Done',       className: 'bg-green-900 text-green-300' },
  failed:           { label: 'Failed',     className: 'bg-red-900 text-red-300' },
}

export function StatusBadge({ status }: { status: string }) {
  const config = statusConfig[status] ?? { label: status, className: 'bg-zinc-700 text-zinc-300' }
  return (
    <Badge className={cn('text-xs font-medium border-0', config.className)}>
      {config.label}
    </Badge>
  )
}
