'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface Story {
  id?: string
  title: string
  content: string
}

export function StoryFormDialog({
  open,
  onOpenChange,
  story,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  story?: Story
}) {
  const router = useRouter()
  const [title, setTitle] = useState(story?.title ?? '')
  const [content, setContent] = useState(story?.content ?? '')
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    if (!title.trim() || !content.trim()) return
    setLoading(true)

    try {
      let res: Response
      if (story?.id) {
        res = await fetch(`/api/stories/${story.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        })
      } else {
        res = await fetch('/api/stories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content }),
        })
      }

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error ?? 'Failed to save story. Please try again.')
        return
      }

      onOpenChange(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle>{story?.id ? 'Edit Story' : 'Add Story'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="story-title" className="text-sm text-zinc-400">
              Title
            </Label>
            <Input
              id="story-title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="e.g. Dog Saves Child from Drowning"
            />
          </div>
          <div>
            <Label htmlFor="story-content" className="text-sm text-zinc-400">
              Story Content
            </Label>
            <Textarea
              id="story-content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700 min-h-[120px]"
              placeholder="Describe the CCTV scene in detail..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading || !title.trim() || !content.trim()}
          >
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
