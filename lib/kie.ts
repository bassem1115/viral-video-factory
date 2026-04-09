import { getApiKey } from './api-keys'

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

  const VALID_STATUSES = ['pending', 'processing', 'success', 'failed'] as const
  type ValidStatus = typeof VALID_STATUSES[number]

  if (!VALID_STATUSES.includes(data.status as ValidStatus)) {
    throw new Error(`kie.ai returned unexpected status: ${data.status}`)
  }

  return {
    status: data.status as ValidStatus,
    videoUrl: data.videoUrl ?? data.video_url ?? data.url,
    error: data.error ?? data.message,
  }
}
