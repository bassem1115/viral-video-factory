'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Shuffle, Clapperboard } from 'lucide-react'
import { ProgressPanel } from './progress-panel'

interface Story {
  id: string
  title: string
}

interface ProgressEvent {
  step: string
  [key: string]: unknown
}

export function GenerateForm({ stories }: { stories: Story[] }) {
  const [selectedStoryId, setSelectedStoryId] = useState<string>('')
  const [events, setEvents] = useState<ProgressEvent[]>([])
  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  function pickRandom() {
    const random = stories[Math.floor(Math.random() * stories.length)]
    setSelectedStoryId(random.id)
  }

  async function handleGenerate() {
    if (!selectedStoryId || running) return

    setEvents([])
    setCurrentStep(null)
    setRunning(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId: selectedStoryId }),
      })

      if (!res.ok) {
        setEvents([{ step: 'failed', error: 'Failed to create job' }])
        setCurrentStep('failed')
        setRunning(false)
        return
      }

      const { jobId } = await res.json() as { jobId: string }

      const eventSource = new EventSource(`/api/generate/${jobId}/stream`)

      eventSource.onmessage = (e) => {
        const event = JSON.parse(e.data as string) as ProgressEvent
        setEvents(prev => [...prev, event])
        setCurrentStep(event.step)

        if (event.step === 'done' || event.step === 'failed') {
          eventSource.close()
          setRunning(false)
        }
      }

      eventSource.onerror = () => {
        setEvents(prev => [
          ...prev,
          { step: 'failed', error: 'Connection lost. Check Dashboard for job status.' },
        ])
        setCurrentStep('failed')
        eventSource.close()
        setRunning(false)
      }
    } catch {
      setEvents([{ step: 'failed', error: 'Unexpected error. Please try again.' }])
      setCurrentStep('failed')
      setRunning(false)
    }
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="flex gap-2">
        <Select value={selectedStoryId} onValueChange={setSelectedStoryId}>
          <SelectTrigger className="flex-1 bg-zinc-900 border-zinc-700">
            <SelectValue placeholder="Select a story..." />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            {stories.map(story => (
              <SelectItem
                key={story.id}
                value={story.id}
                className="text-zinc-200 focus:bg-zinc-800"
              >
                {story.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon"
          onClick={pickRandom}
          disabled={running}
          className="border-zinc-700 hover:bg-zinc-800"
          title="Pick random story"
        >
          <Shuffle className="w-4 h-4" />
        </Button>
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!selectedStoryId || running}
        className="w-full gap-2"
        size="lg"
      >
        <Clapperboard className="w-4 h-4" />
        {running ? 'Generating...' : 'Generate Video'}
      </Button>

      {(events.length > 0 || running) && (
        <ProgressPanel
          events={events as Parameters<typeof ProgressPanel>[0]['events']}
          currentStep={currentStep}
        />
      )}
    </div>
  )
}
