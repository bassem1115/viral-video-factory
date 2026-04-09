'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { StoryFormDialog } from './story-form-dialog'
import { useRouter } from 'next/navigation'

interface Story {
  id: string
  title: string
  content: string
}

export function StoriesTable({ stories }: { stories: Story[] }) {
  const router = useRouter()
  const [editStory, setEditStory] = useState<Story | null>(null)
  const [addOpen, setAddOpen] = useState(false)

  async function handleDelete(id: string) {
    if (!confirm('Delete this story?')) return
    await fetch(`/api/stories/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" />
          Add Story
        </Button>
      </div>

      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/60">
              <th className="text-left px-4 py-3 text-zinc-400 font-medium">Title</th>
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">
                Content Preview
              </th>
              <th className="px-4 py-3 w-20" />
            </tr>
          </thead>
          <tbody>
            {stories.map(story => (
              <tr
                key={story.id}
                className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="px-4 py-3 font-medium">{story.title}</td>
                <td className="px-4 py-3 text-zinc-500 hidden md:table-cell">
                  <span className="line-clamp-1">{story.content.slice(0, 100)}...</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-zinc-500 hover:text-white"
                      onClick={() => setEditStory(story)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-zinc-500 hover:text-red-400"
                      onClick={() => handleDelete(story.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StoryFormDialog open={addOpen} onOpenChange={setAddOpen} />
      {editStory && (
        <StoryFormDialog
          open={!!editStory}
          onOpenChange={open => !open && setEditStory(null)}
          story={editStory}
        />
      )}
    </div>
  )
}
