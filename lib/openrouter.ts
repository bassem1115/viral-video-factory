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

  let parsed: ScriptOutput
  try {
    parsed = JSON.parse(content) as ScriptOutput
  } catch {
    throw new Error('OpenRouter response was not valid JSON')
  }

  if (!parsed.title || !parsed.description || !parsed.videoPrompt) {
    throw new Error('OpenRouter response missing required fields')
  }

  return parsed
}
