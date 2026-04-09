# Viral Video Factory — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a self-hosted Next.js webapp that generates short viral CCTV-style videos automatically using OpenRouter (Claude Sonnet) for scripting and kie.ai (Sora) for video generation.

**Architecture:** Next.js 14 App Router with TypeScript. API routes handle all AI calls and stream progress via SSE. SQLite via Prisma stores stories, jobs, and API key overrides. The Generate page POSTs to create a job then opens an SSE connection that drives the full pipeline live.

**Tech Stack:** Next.js 14 · TypeScript · Prisma + SQLite · Tailwind CSS · shadcn/ui · OpenRouter API · kie.ai API

---

## Task 1: Project Bootstrap

**Files:**
- Create: `/Users/bassem/Documents/N8N/` (project root)

**Step 1: Initialize Next.js app**

```bash
cd /Users/bassem/Documents/N8N
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --yes
```

Expected: Next.js 14 project scaffolded with TypeScript and Tailwind.

**Step 2: Install Prisma and dependencies**

```bash
npm install prisma @prisma/client
npm install @ai-sdk/openai ai
npm install eventsource-parser
npx shadcn@latest init --defaults
```

When shadcn asks about style, choose: Default. Base color: Slate. CSS variables: Yes.

**Step 3: Install shadcn components we need**

```bash
npx shadcn@latest add button card badge input label select textarea table dialog toast separator skeleton
```

**Step 4: Initialize Prisma with SQLite**

```bash
npx prisma init --datasource-provider sqlite
```

**Step 5: Verify the app runs**

```bash
npm run dev
```

Expected: App running at http://localhost:3000

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: bootstrap Next.js 14 project with Prisma and shadcn/ui"
```

---

## Task 2: Database Schema + Seed

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Modify: `package.json` (add seed script)

**Step 1: Write the Prisma schema**

Replace the contents of `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Story {
  id        String   @id @default(cuid())
  title     String
  content   String
  active    Boolean  @default(true)
  createdAt DateTime @default(now())
  jobs      Job[]
}

model Job {
  id           String   @id @default(cuid())
  storyId      String?
  story        Story?   @relation(fields: [storyId], references: [id])
  status       String   @default("idle")
  title        String?
  description  String?
  videoPrompt  String?
  videoUrl     String?
  taskId       String?
  errorMessage String?
  createdAt    DateTime @default(now())
}

model Setting {
  key   String @id
  value String
}
```

**Step 2: Set DATABASE_URL in `.env`**

Append to `.env`:

```
DATABASE_URL="file:./dev.db"
```

**Step 3: Create seed file `prisma/seed.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const stories = [
  {
    title: "Child Almost Falls from Window",
    content: "A toddler climbs onto a window ledge on the 3rd floor while parent is briefly out of the room. A passerby on the street below notices and rushes upstairs to alert the family just in time."
  },
  {
    title: "Dog Saves Child from Drowning",
    content: "A family dog spots a 4-year-old silently slipping into the backyard pool. The dog jumps in and keeps the child afloat, barking until the parents rush out."
  },
  {
    title: "Cat Wakes Owner During House Fire",
    content: "In the middle of the night, a cat persistently paws at its sleeping owner's face. The owner wakes up to find the kitchen on fire — the smoke detector battery had died."
  },
  {
    title: "Stranger Performs CPR on Collapsed Runner",
    content: "A marathon runner collapses mid-race from cardiac arrest. A bystander with medical training pushes through the crowd and performs CPR until paramedics arrive, saving the runner's life."
  },
  {
    title: "Security Guard Saves Choking Child",
    content: "A mall security guard on routine patrol notices a toddler silently choking in a food court while panicked parents look on. He performs the Heimlich maneuver and dislodges the obstruction."
  },
  {
    title: "Woman Stops Runaway Stroller",
    content: "A stroller with an infant inside begins rolling down a steep parking lot ramp toward traffic. A passing woman sprints and grabs it just before it reaches the road."
  },
  {
    title: "Cyclist Helps Fallen Elderly Person",
    content: "An elderly woman trips and falls on a busy sidewalk. A cyclist immediately stops, helps her up, calls an ambulance, and stays with her until help arrives."
  },
  {
    title: "Kids Form Human Chain to Save Drowning Friend",
    content: "A group of children at a river beach notice their friend caught in a current. Unable to swim out, they form a human chain from the shore and pull him to safety."
  },
  {
    title: "Toddler Wanders Near Pool — Dog Blocks Path",
    content: "A toddler slips out of a sliding door and walks toward the family pool. The family dog plants itself in front of the child, barking loudly and refusing to let them pass until the parents arrive."
  },
  {
    title: "Driver Stops Highway Traffic to Save Injured Dog",
    content: "A dog is hit by a car on a busy highway and left in the road. A driver parks their car across a lane, exits, and carries the injured dog to safety while managing to slow traffic."
  },
  {
    title: "Stranger Gives Jacket to Freezing Homeless Man",
    content: "On a freezing winter night, a pedestrian removes their own jacket and wraps it around a homeless man sleeping on a bench. They also leave money for a meal and call a shelter."
  },
  {
    title: "Bird Trapped in Store Helped to Freedom",
    content: "A bird flies into a large store and panics, repeatedly hitting windows. A staff member carefully guides it toward the exit using a broomstick and cardboard over 20 minutes until it flies free."
  },
  {
    title: "Good Samaritan Helps Stranded Motorist in Storm",
    content: "During a severe storm, a driver's car breaks down on a deserted road. A passing truck driver stops, provides tools, helps fix the issue, and follows behind until the car safely reaches the next town."
  },
  {
    title: "Child Reunited with Lost Dog",
    content: "A family searches for their missing dog for days. A neighbor spots it miles away, recognizes the dog from a flyer, and drives it home — arriving just as the heartbroken child is taking down the posters."
  },
  {
    title: "Baby Carriage Stopped Before Rolling Into Traffic",
    content: "A mother briefly lets go of a stroller on a sloped sidewalk to check her phone. The stroller begins rolling toward a busy intersection. A nearby shop owner rushes out and stops it with seconds to spare."
  },
  {
    title: "Man Rescues Cat from Burning Building",
    content: "Firefighters have controlled the blaze but can't re-enter for a resident's cat. The owner's neighbor, knowing the cat's hiding spot, waits for clearance and runs in to retrieve it."
  },
  {
    title: "Horse Escapes, Neighborhood Rallies Together",
    content: "A horse escapes from a residential stable and runs through the neighborhood. Neighbors spontaneously form a wide human arc to calmly guide the horse back to its pen without panicking it."
  },
  {
    title: "Child Locks Itself in Hot Car",
    content: "A toddler accidentally locks itself inside a car on a hot summer day. Bystanders work together — one calls 911, another finds a slim jim, a third shields the child's side of the car from the sun until the door is opened."
  },
  {
    title: "Elderly Couple Helped During Flash Flood",
    content: "Flash flooding traps an elderly couple on their porch. Two neighbors wade through knee-deep water, form a linked-arm chain, and guide the couple to higher ground before the water rises further."
  },
  {
    title: "Child's Balloon Returned by Kind Stranger",
    content: "A child's birthday balloon escapes and floats into a neighbor's tree. A stranger climbs a ladder to retrieve it, then ties it securely to the child's wrist with a note: 'Hold on tight.'"
  }
]

async function main() {
  console.log('Seeding database with 20 stories...')
  
  for (const story of stories) {
    await prisma.story.upsert({
      where: { id: story.title }, // won't match, always creates
      update: {},
      create: story,
    })
  }

  console.log('Seeded 20 stories.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

**Step 4: Add seed script to `package.json`**

Add inside `"scripts"` in package.json:
```json
"prisma": {
  "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
}
```

Also install ts-node:
```bash
npm install -D ts-node
```

**Step 5: Run migration and seed**

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

Expected: `dev.db` created, 20 stories seeded.

**Step 6: Commit**

```bash
git add -A
git commit -m "feat: add Prisma schema and seed 20 CCTV stories"
```

---

## Task 3: Prisma Client Singleton + API Key Helper

**Files:**
- Create: `lib/prisma.ts`
- Create: `lib/api-keys.ts`

**Step 1: Create Prisma singleton `lib/prisma.ts`**

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

**Step 2: Create API key helper `lib/api-keys.ts`**

```typescript
import { prisma } from './prisma'

export async function getApiKey(name: 'OPENROUTER_API_KEY' | 'KIE_AI_API_KEY'): Promise<string> {
  const setting = await prisma.setting.findUnique({ where: { key: name } })
  if (setting?.value) return setting.value
  const envValue = process.env[name]
  if (envValue) return envValue
  throw new Error(`API key ${name} is not configured. Set it in Settings or .env`)
}

export async function getApiKeySource(name: string): Promise<'db' | 'env' | 'missing'> {
  const setting = await prisma.setting.findUnique({ where: { key: name } })
  if (setting?.value) return 'db'
  if (process.env[name]) return 'env'
  return 'missing'
}
```

**Step 3: Commit**

```bash
git add lib/
git commit -m "feat: add Prisma singleton and API key helper"
```

---

## Task 4: Settings API Routes

**Files:**
- Create: `app/api/settings/route.ts`

**Step 1: Create `app/api/settings/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiKeySource } from '@/lib/api-keys'

const KEYS = ['OPENROUTER_API_KEY', 'KIE_AI_API_KEY'] as const

export async function GET() {
  const result: Record<string, { source: string; masked: string }> = {}
  
  for (const key of KEYS) {
    const source = await getApiKeySource(key)
    const dbSetting = await prisma.setting.findUnique({ where: { key } })
    const value = dbSetting?.value ?? process.env[key] ?? ''
    result[key] = {
      source,
      masked: value ? `${value.slice(0, 6)}${'•'.repeat(Math.max(0, value.length - 10))}${value.slice(-4)}` : '',
    }
  }

  return NextResponse.json(result)
}

export async function POST(req: Request) {
  const body = await req.json() as { key: string; value: string | null }
  
  if (!KEYS.includes(body.key as typeof KEYS[number])) {
    return NextResponse.json({ error: 'Invalid key' }, { status: 400 })
  }

  if (body.value === null) {
    await prisma.setting.deleteMany({ where: { key: body.key } })
    return NextResponse.json({ ok: true, action: 'cleared' })
  }

  await prisma.setting.upsert({
    where: { key: body.key },
    update: { value: body.value },
    create: { key: body.key, value: body.value },
  })

  return NextResponse.json({ ok: true, action: 'saved' })
}
```

**Step 2: Test manually**

```bash
# Start dev server then:
curl http://localhost:3000/api/settings
```

Expected: JSON with OPENROUTER_API_KEY and KIE_AI_API_KEY, both showing source: 'missing' (until you add .env values).

**Step 3: Commit**

```bash
git add app/api/settings/
git commit -m "feat: add settings API for API key management"
```

---

## Task 5: Stories API Routes

**Files:**
- Create: `app/api/stories/route.ts`
- Create: `app/api/stories/[id]/route.ts`

**Step 1: Create `app/api/stories/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const stories = await prisma.story.findMany({
    orderBy: { createdAt: 'asc' },
  })
  return NextResponse.json(stories)
}

export async function POST(req: Request) {
  const body = await req.json() as { title: string; content: string }
  
  if (!body.title?.trim() || !body.content?.trim()) {
    return NextResponse.json({ error: 'title and content are required' }, { status: 400 })
  }

  const story = await prisma.story.create({
    data: { title: body.title.trim(), content: body.content.trim() },
  })

  return NextResponse.json(story, { status: 201 })
}
```

**Step 2: Create `app/api/stories/[id]/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json() as { title?: string; content?: string }
  
  const story = await prisma.story.update({
    where: { id: params.id },
    data: {
      ...(body.title && { title: body.title.trim() }),
      ...(body.content && { content: body.content.trim() }),
    },
  })

  return NextResponse.json(story)
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  await prisma.story.delete({ where: { id: params.id } })
  return NextResponse.json({ ok: true })
}
```

**Step 3: Test manually**

```bash
curl http://localhost:3000/api/stories
```

Expected: JSON array of 20 stories.

**Step 4: Commit**

```bash
git add app/api/stories/
git commit -m "feat: add stories CRUD API"
```

---

## Task 6: OpenRouter Service

**Files:**
- Create: `lib/openrouter.ts`

**Step 1: Create `lib/openrouter.ts`**

```typescript
import { getApiKey } from './api-keys'

export interface ScriptOutput {
  title: string
  description: string
  videoPrompt: string
}

const SYSTEM_PROMPT = `You are a viral short-video scriptwriter specializing in emotional CCTV-style footage. 
Given a story, you write content that feels raw, real, and human — like actual surveillance footage someone stumbled upon.

Return ONLY valid JSON with these fields:
- title: A compelling, curiosity-driven title (max 80 chars). Use urgency or emotion. No clickbait emojis.
- description: 2-3 sentence hook for the video caption. First-person perspective of a bystander or emotional observer.
- videoPrompt: Detailed Sora video generation prompt. Specify: camera angle (low CCTV angle, fisheye), lighting (harsh fluorescent, dim night-vision green), scene elements, character actions, emotional atmosphere, video quality (grainy, timestamp overlay, low resolution CCTV aesthetic). Make it feel like real security footage.`

export async function generateScript(storyContent: string): Promise<ScriptOutput> {
  const apiKey = await getApiKey('OPENROUTER_API_KEY')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Viral Video Factory',
    },
    body: JSON.stringify({
      model: 'anthropic/claude-sonnet-4-5',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Write a viral CCTV-style video script for this story:\n\n${storyContent}` },
      ],
      temperature: 0.8,
      response_format: { type: 'json_object' },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenRouter error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) throw new Error('OpenRouter returned empty response')

  const parsed = JSON.parse(content) as ScriptOutput

  if (!parsed.title || !parsed.description || !parsed.videoPrompt) {
    throw new Error('OpenRouter response missing required fields')
  }

  return parsed
}
```

**Step 2: Commit**

```bash
git add lib/openrouter.ts
git commit -m "feat: add OpenRouter service for script generation"
```

---

## Task 7: kie.ai Service

**Files:**
- Create: `lib/kie.ts`

**Step 1: Create `lib/kie.ts`**

```typescript
import { getApiKey } from './api-keys'

export interface KieCreateResponse {
  taskId: string
}

export interface KieStatusResponse {
  status: 'pending' | 'processing' | 'success' | 'failed'
  videoUrl?: string
  error?: string
}

async function getHeaders() {
  const apiKey = await getApiKey('KIE_AI_API_KEY')
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  }
}

export async function createVideo(videoPrompt: string): Promise<string> {
  const headers = await getHeaders()

  const response = await fetch('https://api.kie.ai/v1/video/generate', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt: videoPrompt,
      aspect_ratio: '9:16',
      duration: 10,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`kie.ai create error ${response.status}: ${error}`)
  }

  const data = await response.json()
  const taskId = data?.taskId ?? data?.task_id ?? data?.id

  if (!taskId) throw new Error('kie.ai did not return a taskId')

  return taskId
}

export async function checkVideoStatus(taskId: string): Promise<KieStatusResponse> {
  const headers = await getHeaders()

  const response = await fetch(`https://api.kie.ai/v1/video/status/${taskId}`, {
    headers,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`kie.ai status error ${response.status}: ${error}`)
  }

  const data = await response.json()

  return {
    status: data.status,
    videoUrl: data.videoUrl ?? data.video_url ?? data.url,
    error: data.error ?? data.message,
  }
}
```

**Step 2: Commit**

```bash
git add lib/kie.ts
git commit -m "feat: add kie.ai service for video generation and polling"
```

---

## Task 8: Generate API (Job Creation + SSE Pipeline)

**Files:**
- Create: `app/api/generate/route.ts`
- Create: `app/api/generate/[id]/stream/route.ts`

**Step 1: Create `app/api/generate/route.ts`**

```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { story: { select: { title: true } } },
  })
  return NextResponse.json(jobs)
}

export async function POST(req: Request) {
  const body = await req.json() as { storyId: string }

  const story = await prisma.story.findUnique({ where: { id: body.storyId } })
  if (!story) {
    return NextResponse.json({ error: 'Story not found' }, { status: 404 })
  }

  const job = await prisma.job.create({
    data: { storyId: story.id, status: 'idle' },
  })

  return NextResponse.json({ jobId: job.id }, { status: 201 })
}
```

**Step 2: Create `app/api/generate/[id]/stream/route.ts`**

This is the core pipeline — it runs the full OpenRouter → kie.ai flow and streams events:

```typescript
import { prisma } from '@/lib/prisma'
import { generateScript } from '@/lib/openrouter'
import { createVideo, checkVideoStatus } from '@/lib/kie'

export const dynamic = 'force-dynamic'
export const maxDuration = 300 // 5 minutes max

function makeSSE(data: object): string {
  return `data: ${JSON.stringify(data)}\n\n`
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const jobId = params.id

  const job = await prisma.job.findUnique({ where: { id: jobId }, include: { story: true } })
  if (!job || !job.story) {
    return new Response('Job not found', { status: 404 })
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      function send(data: object) {
        controller.enqueue(encoder.encode(makeSSE(data)))
      }

      try {
        // Step 1: Generate script
        send({ step: 'scripting', message: 'Writing script with Claude...' })
        await prisma.job.update({ where: { id: jobId }, data: { status: 'scripting' } })

        const script = await generateScript(job.story!.content)

        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: 'video_queued',
            title: script.title,
            description: script.description,
            videoPrompt: script.videoPrompt,
          },
        })

        send({
          step: 'script_done',
          title: script.title,
          description: script.description,
          videoPrompt: script.videoPrompt,
        })

        // Step 2: Queue video generation
        send({ step: 'video_queued', message: 'Sending to kie.ai for video generation...' })

        const taskId = await createVideo(script.videoPrompt)

        await prisma.job.update({
          where: { id: jobId },
          data: { status: 'video_processing', taskId },
        })

        send({ step: 'video_queued', taskId, message: 'Video queued — polling for completion...' })

        // Step 3: Poll for completion (max 12 attempts × 10s = 2 min)
        const MAX_ATTEMPTS = 12
        const POLL_INTERVAL = 10_000

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          await sleep(POLL_INTERVAL)
          send({ step: 'video_processing', attempt, max: MAX_ATTEMPTS, message: `Checking video status (attempt ${attempt}/${MAX_ATTEMPTS})...` })

          const status = await checkVideoStatus(taskId)

          if (status.status === 'success' && status.videoUrl) {
            await prisma.job.update({
              where: { id: jobId },
              data: { status: 'done', videoUrl: status.videoUrl },
            })
            send({ step: 'done', videoUrl: status.videoUrl })
            controller.close()
            return
          }

          if (status.status === 'failed') {
            throw new Error(status.error ?? 'kie.ai reported video generation failed')
          }
        }

        throw new Error(`kie.ai did not complete after ${MAX_ATTEMPTS} attempts (${MAX_ATTEMPTS * 10}s)`)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        await prisma.job.update({
          where: { id: jobId },
          data: { status: 'failed', errorMessage: message },
        })
        send({ step: 'failed', error: message })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
```

**Step 3: Commit**

```bash
git add app/api/generate/
git commit -m "feat: add generate API with SSE pipeline (OpenRouter + kie.ai)"
```

---

## Task 9: App Layout + Navigation

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/nav.tsx`
- Modify: `app/globals.css` (dark theme base)

**Step 1: Update `app/globals.css` — enforce dark theme**

Keep the existing Tailwind directives and add at the top of `:root`:

```css
:root {
  color-scheme: dark;
}
```

Also set in the `<html>` tag in layout: `className="dark"`.

**Step 2: Create `components/nav.tsx`**

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Video, BookOpen, Settings, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/generate', label: 'Generate', icon: Video },
  { href: '/stories', label: 'Stories', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function Nav() {
  const pathname = usePathname()

  return (
    <nav className="w-56 shrink-0 border-r border-zinc-800 bg-zinc-950 min-h-screen p-4 flex flex-col gap-1">
      <div className="mb-6 px-2">
        <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Video Factory</span>
        <div className="text-[10px] text-zinc-600 mt-0.5">CCTV Automation</div>
      </div>
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
            pathname === href
              ? 'bg-zinc-800 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
          )}
        >
          <Icon className="w-4 h-4" />
          {label}
        </Link>
      ))}
    </nav>
  )
}
```

**Step 3: Update `app/layout.tsx`**

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Nav } from '@/components/nav'
import { Toaster } from '@/components/ui/toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Video Factory',
  description: 'Automated CCTV-style viral video generation',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-white`}>
        <div className="flex min-h-screen">
          <Nav />
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  )
}
```

**Step 4: Install lucide-react**

```bash
npm install lucide-react
```

**Step 5: Commit**

```bash
git add app/layout.tsx app/globals.css components/nav.tsx
git commit -m "feat: add dark layout and navigation sidebar"
```

---

## Task 10: Dashboard Page

**Files:**
- Modify: `app/page.tsx`
- Create: `components/job-card.tsx`
- Create: `components/status-badge.tsx`

**Step 1: Create `components/status-badge.tsx`**

```typescript
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
```

**Step 2: Create `components/job-card.tsx`**

```typescript
import Link from 'next/link'
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
          onMouseOut={e => { (e.target as HTMLVideoElement).pause(); (e.target as HTMLVideoElement).currentTime = 0 }}
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
```

**Step 3: Install date-fns**

```bash
npm install date-fns
```

**Step 4: Update `app/page.tsx`**

```typescript
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { JobCard } from '@/components/job-card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default async function DashboardPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: { story: { select: { title: true } } },
  })

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
            <JobCard key={job.id} job={{ ...job, createdAt: job.createdAt.toISOString() }} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 5: Commit**

```bash
git add app/page.tsx components/job-card.tsx components/status-badge.tsx
git commit -m "feat: add dashboard with job grid and status badges"
```

---

## Task 11: Generate Page (Live SSE)

**Files:**
- Create: `app/generate/page.tsx`
- Create: `components/generate-form.tsx`
- Create: `components/progress-panel.tsx`

**Step 1: Create `components/progress-panel.tsx`**

```typescript
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

export function ProgressPanel({ events, currentStep }: { events: ProgressEvent[]; currentStep: string | null }) {
  const lastEvent = events[events.length - 1]
  const isFailed = currentStep === 'failed'
  const isDone = currentStep === 'done'
  const currentIdx = currentStep ? getStepIndex(currentStep) : -1

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 space-y-3">
      {steps.map((step, idx) => {
        const isActive = currentStep === step.key
        const isDoneStep = !isFailed && currentIdx > idx
        const isCurrent = isActive || (currentStep === 'done' && idx === steps.length - 1)

        return (
          <div key={step.key} className={cn('flex items-start gap-3 text-sm', isDoneStep || isCurrent ? 'text-white' : 'text-zinc-600')}>
            <div className="mt-0.5 shrink-0">
              {isDoneStep ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : isCurrent && !isFailed ? (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-zinc-700" />
              )}
            </div>
            <div>
              <div className={cn(isCurrent && !isFailed && 'font-medium')}>{step.label}</div>
              {step.key === 'script_done' && isDoneStep && lastEvent?.title && (
                <div className="text-xs text-zinc-400 mt-0.5">"{lastEvent.title}"</div>
              )}
              {step.key === 'video_processing' && isActive && lastEvent?.attempt && (
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

      {isDone && lastEvent?.videoUrl && (
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
```

**Step 2: Create `components/generate-form.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Shuffle, Clapperboard } from 'lucide-react'
import { ProgressPanel } from './progress-panel'

interface Story { id: string; title: string }
interface ProgressEvent { step: string; [key: string]: unknown }

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

    // Create job
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

    const { jobId } = await res.json()

    // Open SSE stream
    const eventSource = new EventSource(`/api/generate/${jobId}/stream`)

    eventSource.onmessage = (e) => {
      const event = JSON.parse(e.data) as ProgressEvent
      setEvents(prev => [...prev, event])
      setCurrentStep(event.step)

      if (event.step === 'done' || event.step === 'failed') {
        eventSource.close()
        setRunning(false)
      }
    }

    eventSource.onerror = () => {
      setEvents(prev => [...prev, { step: 'failed', error: 'Connection lost. Check job status on Dashboard.' }])
      setCurrentStep('failed')
      eventSource.close()
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
              <SelectItem key={story.id} value={story.id} className="text-zinc-200 focus:bg-zinc-800">
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
        <ProgressPanel events={events as Parameters<typeof ProgressPanel>[0]['events']} currentStep={currentStep} />
      )}
    </div>
  )
}
```

**Step 3: Create `app/generate/page.tsx`**

```typescript
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
```

**Step 4: Commit**

```bash
git add app/generate/ components/generate-form.tsx components/progress-panel.tsx
git commit -m "feat: add generate page with live SSE progress panel and video player"
```

---

## Task 12: Stories Page (CRUD)

**Files:**
- Create: `app/stories/page.tsx`
- Create: `components/stories-table.tsx`
- Create: `components/story-form-dialog.tsx`

**Step 1: Create `components/story-form-dialog.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'

interface Story { id?: string; title: string; content: string }

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

    if (story?.id) {
      await fetch(`/api/stories/${story.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
    } else {
      await fetch('/api/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }),
      })
    }

    setLoading(false)
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle>{story?.id ? 'Edit Story' : 'Add Story'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm text-zinc-400">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700"
              placeholder="e.g. Dog Saves Child from Drowning"
            />
          </div>
          <div>
            <Label htmlFor="content" className="text-sm text-zinc-400">Story Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              className="mt-1 bg-zinc-800 border-zinc-700 min-h-[120px]"
              placeholder="Describe the CCTV scene in detail..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={loading || !title.trim() || !content.trim()}>
            {loading ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
```

**Step 2: Create `components/stories-table.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { StoryFormDialog } from './story-form-dialog'
import { useRouter } from 'next/navigation'

interface Story { id: string; title: string; content: string }

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
              <th className="text-left px-4 py-3 text-zinc-400 font-medium hidden md:table-cell">Content Preview</th>
              <th className="px-4 py-3 w-20"></th>
            </tr>
          </thead>
          <tbody>
            {stories.map(story => (
              <tr key={story.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
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
```

**Step 3: Create `app/stories/page.tsx`**

```typescript
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
```

**Step 4: Commit**

```bash
git add app/stories/ components/stories-table.tsx components/story-form-dialog.tsx
git commit -m "feat: add stories CRUD page with add/edit/delete"
```

---

## Task 13: Settings Page

**Files:**
- Create: `app/settings/page.tsx`
- Create: `components/settings-form.tsx`

**Step 1: Create `components/settings-form.tsx`**

```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface KeyInfo { source: 'db' | 'env' | 'missing'; masked: string }
interface SettingsData { OPENROUTER_API_KEY: KeyInfo; KIE_AI_API_KEY: KeyInfo }

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const router = useRouter()
  const [openRouter, setOpenRouter] = useState('')
  const [kieAi, setKieAi] = useState('')
  const [show, setShow] = useState({ openRouter: false, kieAi: false })
  const [saving, setSaving] = useState<string | null>(null)

  async function save(key: string, value: string) {
    setSaving(key)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    })
    setSaving(null)
    router.refresh()
  }

  async function clear(key: string) {
    setSaving(key)
    await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value: null }),
    })
    setSaving(null)
    router.refresh()
  }

  function renderField(
    key: 'OPENROUTER_API_KEY' | 'KIE_AI_API_KEY',
    label: string,
    value: string,
    onChange: (v: string) => void,
    showKey: boolean,
    onToggleShow: () => void
  ) {
    const info = initial[key]
    const isEnvLocked = info.source === 'env'

    return (
      <div className="space-y-2">
        <Label className="text-sm text-zinc-300">{label}</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type={showKey ? 'text' : 'password'}
              value={isEnvLocked ? info.masked : value}
              onChange={e => onChange(e.target.value)}
              disabled={isEnvLocked}
              placeholder={info.masked || 'Paste API key here...'}
              className="bg-zinc-800 border-zinc-700 pr-10 font-mono text-sm"
            />
            <button
              type="button"
              onClick={onToggleShow}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {isEnvLocked ? (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 px-2">
              <Lock className="w-3.5 h-3.5" />
              From .env
            </div>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => save(key, value)}
                disabled={!value || saving === key}
              >
                {saving === key ? 'Saving...' : 'Save'}
              </Button>
              {info.source === 'db' && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => clear(key)}
                  disabled={saving === key}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear
                </Button>
              )}
            </>
          )}
        </div>
        <p className="text-xs text-zinc-600">
          {info.source === 'db' ? 'Using DB override' : info.source === 'env' ? 'Loaded from .env (read-only here)' : 'Not configured'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      {renderField(
        'OPENROUTER_API_KEY', 'OpenRouter API Key',
        openRouter, setOpenRouter,
        show.openRouter, () => setShow(s => ({ ...s, openRouter: !s.openRouter }))
      )}
      {renderField(
        'KIE_AI_API_KEY', 'kie.ai API Key',
        kieAi, setKieAi,
        show.kieAi, () => setShow(s => ({ ...s, kieAi: !s.kieAi }))
      )}
      <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-600 space-y-1">
        <p>Get your OpenRouter key at <strong className="text-zinc-500">openrouter.ai/keys</strong></p>
        <p>Get your kie.ai key at <strong className="text-zinc-500">kie.ai</strong> → API Keys</p>
      </div>
    </div>
  )
}
```

**Step 2: Create `app/settings/page.tsx`**

```typescript
import { prisma } from '@/lib/prisma'
import { getApiKeySource } from '@/lib/api-keys'
import { SettingsForm } from '@/components/settings-form'

async function getSettingsData() {
  const keys = ['OPENROUTER_API_KEY', 'KIE_AI_API_KEY'] as const
  const result: Record<string, { source: string; masked: string }> = {}

  for (const key of keys) {
    const source = await getApiKeySource(key)
    const dbSetting = await prisma.setting.findUnique({ where: { key } })
    const value = dbSetting?.value ?? process.env[key] ?? ''
    result[key] = {
      source,
      masked: value
        ? `${value.slice(0, 6)}${'•'.repeat(Math.max(0, value.length - 10))}${value.slice(-4)}`
        : '',
    }
  }

  return result
}

export default async function SettingsPage() {
  const settings = await getSettingsData()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure your API keys</p>
      </div>
      <SettingsForm initial={settings as Parameters<typeof SettingsForm>[0]['initial']} />
    </div>
  )
}
```

**Step 3: Commit**

```bash
git add app/settings/ components/settings-form.tsx
git commit -m "feat: add settings page for API key management with env/db override support"
```

---

## Task 14: Final Polish + Smoke Test

**Step 1: Add `.env.example`**

Create `.env.example`:
```
DATABASE_URL="file:./dev.db"
OPENROUTER_API_KEY="your-openrouter-key-here"
KIE_AI_API_KEY="your-kie-ai-key-here"
```

**Step 2: Update `.gitignore` to exclude DB file**

Add to `.gitignore`:
```
dev.db
dev.db-journal
.env
```

**Step 3: Full smoke test**

```bash
npm run build
npm run dev
```

Check each route:
- `http://localhost:3000` → Dashboard (empty state)
- `http://localhost:3000/stories` → 20 stories listed
- `http://localhost:3000/settings` → Both keys show "Not configured"
- `http://localhost:3000/generate` → Story selector populated, Random works

Then add API keys in Settings and run a full generate test.

**Step 4: Final commit**

```bash
git add -A
git commit -m "feat: complete Viral Video Factory webapp

- Dashboard with job grid (video thumbnails, status badges)
- Generate page with live SSE progress + inline video player
- Stories CRUD (20 pre-seeded CCTV stories)
- Settings page with env/DB API key management
- OpenRouter (Claude Sonnet) script generation
- kie.ai (Sora) video generation with polling
- Dark CCTV-aesthetic theme via Tailwind + shadcn/ui"
```

---

## Summary

| Task | What it builds |
|------|---------------|
| 1 | Next.js 14 + Prisma + shadcn/ui bootstrap |
| 2 | SQLite schema + 20 seeded stories |
| 3 | Prisma singleton + API key helper |
| 4 | Settings API (GET/POST) |
| 5 | Stories CRUD API |
| 6 | OpenRouter service (script generation) |
| 7 | kie.ai service (video create + poll) |
| 8 | Generate API + SSE pipeline |
| 9 | Dark layout + navigation sidebar |
| 10 | Dashboard page with job grid |
| 11 | Generate page with live progress + video player |
| 12 | Stories page (table + add/edit/delete) |
| 13 | Settings page (API key UI) |
| 14 | Polish, .env.example, smoke test |
