import { prisma } from '@/lib/prisma'
import { generateScript } from '@/lib/openrouter'
import { createVideo, checkVideoStatus } from '@/lib/kie'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

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

        // Step 3: Poll for completion
        const MAX_ATTEMPTS = 12
        const POLL_INTERVAL = 10_000

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          await sleep(POLL_INTERVAL)
          send({
            step: 'video_processing',
            attempt,
            max: MAX_ATTEMPTS,
            message: `Checking video status (attempt ${attempt}/${MAX_ATTEMPTS})...`,
          })

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

        throw new Error(`kie.ai did not complete after ${MAX_ATTEMPTS} attempts (${MAX_ATTEMPTS * POLL_INTERVAL / 1000}s)`)

      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        try {
          await prisma.job.update({
            where: { id: jobId },
            data: { status: 'failed', errorMessage: message },
          })
        } catch {
          // DB update failed — still close the stream cleanly
        }
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
