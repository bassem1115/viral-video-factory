'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Lock, Eye, EyeOff } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface KeyInfo {
  source: 'db' | 'env' | 'missing'
  masked: string
}

interface SettingsData {
  OPENROUTER_API_KEY: KeyInfo
  KIE_AI_API_KEY: KeyInfo
}

export function SettingsForm({ initial }: { initial: SettingsData }) {
  const router = useRouter()
  const [openRouterValue, setOpenRouterValue] = useState('')
  const [kieAiValue, setKieAiValue] = useState('')
  const [show, setShow] = useState({ openRouter: false, kieAi: false })
  const [saving, setSaving] = useState<string | null>(null)

  async function save(key: string, value: string) {
    setSaving(key)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      if (!res.ok) {
        alert('Failed to save API key. Please try again.')
        return
      }
      router.refresh()
    } finally {
      setSaving(null)
    }
  }

  async function clear(key: string) {
    setSaving(key)
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value: null }),
      })
      if (!res.ok) {
        alert('Failed to clear API key. Please try again.')
        return
      }
      router.refresh()
    } finally {
      setSaving(null)
    }
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
          {info.source === 'db'
            ? 'Using DB override'
            : info.source === 'env'
            ? 'Loaded from .env (read-only here)'
            : 'Not configured'}
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-lg space-y-6">
      {renderField(
        'OPENROUTER_API_KEY',
        'OpenRouter API Key',
        openRouterValue,
        setOpenRouterValue,
        show.openRouter,
        () => setShow(s => ({ ...s, openRouter: !s.openRouter }))
      )}
      {renderField(
        'KIE_AI_API_KEY',
        'kie.ai API Key',
        kieAiValue,
        setKieAiValue,
        show.kieAi,
        () => setShow(s => ({ ...s, kieAi: !s.kieAi }))
      )}
      <div className="pt-2 border-t border-zinc-800 text-xs text-zinc-600 space-y-1">
        <p>
          Get your OpenRouter key at{' '}
          <strong className="text-zinc-500">openrouter.ai/keys</strong>
        </p>
        <p>
          Get your kie.ai key at{' '}
          <strong className="text-zinc-500">kie.ai</strong> → API Keys
        </p>
      </div>
    </div>
  )
}
