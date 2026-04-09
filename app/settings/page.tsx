export const dynamic = 'force-dynamic'

import { prisma } from '@/lib/prisma'
import { getApiKeySource } from '@/lib/api-keys'
import { SettingsForm } from '@/components/settings-form'
import { DbNotConfigured } from '@/components/db-not-configured'

async function getSettingsData() {
  const keys = ['OPENROUTER_API_KEY', 'KIE_AI_API_KEY'] as const
  const result: Record<string, { source: 'db' | 'env' | 'missing'; masked: string }> = {}

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

  return result as {
    OPENROUTER_API_KEY: { source: 'db' | 'env' | 'missing'; masked: string }
    KIE_AI_API_KEY: { source: 'db' | 'env' | 'missing'; masked: string }
  }
}

export default async function SettingsPage() {
  let settings: Awaited<ReturnType<typeof getSettingsData>>
  try {
    settings = await getSettingsData()
  } catch {
    return <DbNotConfigured />
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure your API keys</p>
      </div>
      <SettingsForm initial={settings} />
    </div>
  )
}
