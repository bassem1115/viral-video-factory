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
