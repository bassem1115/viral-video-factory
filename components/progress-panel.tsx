'use client'

import { CheckCircle, Loader2, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ProgressEvent {
  step: string
  message?: string
  title?: string
  description?: string
  videoUrl?: string
  error?: string
  attempt?: number
  max?: number
}

const steps = [
  { key: 'scripting',        label: 'Selecting story & writing script' },
  { key: 'script_done',      label: 'Script ready' },
  { key: 'video_queued',     label: 'Video queued with kie.ai' },
  { key: 'video_processing', label: 'Generating video' },
  { key: 'done',             label: 'Video ready' },
]

function getStepIndex(step: string) {
  return steps.findIndex(s => s.key === step)
}

export function ProgressPanel({
  events,
  currentStep,
}: {
  events: ProgressEvent[]
  currentStep: string | null
}) {
  const lastEvent = events[events.length - 1]
  const isFailed = currentStep === 'failed'
  const currentIdx = currentStep ? getStepIndex(currentStep) : -1

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
      {steps.map((step, idx) => {
        const isPast = !isFailed && currentIdx > idx
        const isCurrent = currentStep === step.key || (currentStep === 'done' && idx === steps.length - 1)

        return (
          <div
            key={step.key}
            className={cn(
              'flex items-start gap-3 text-sm',
              isPast || isCurrent ? 'text-white' : 'text-zinc-600'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {isPast ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : isCurrent && !isFailed ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-zinc-700" />
              )}
            </div>
            <div>
              <div className={cn(isCurrent && !isFailed && 'font-medium')}>{step.label}</div>
              {step.key === 'script_done' && isPast && lastEvent?.title && (
                <div className="text-xs text-zinc-400 mt-0.5">&ldquo;{lastEvent.title}&rdquo;</div>
              )}
              {step.key === 'video_processing' && isCurrent && lastEvent?.attempt && (
                <div className="text-xs text-zinc-500 mt-0.5">
                  Attempt {lastEvent.attempt}/{lastEvent.max}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {isFailed && (
        <div className="flex items-start gap-3 text-sm text-red-400">
          <XCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <div className="font-medium">Generation failed</div>
            <div className="text-xs text-red-500 mt-0.5">{lastEvent?.error}</div>
          </div>
        </div>
      )}

      {currentStep === 'done' && lastEvent?.videoUrl && (
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <video
            src={lastEvent.videoUrl}
            controls
            autoPlay
            loop
            muted
            className="w-full max-w-xs mx-auto rounded-lg"
          />
          <div className="text-center mt-2">
            <a
              href={lastEvent.videoUrl}
              download
              className="text-xs text-zinc-400 hover:text-white underline"
            >
              Download video
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
