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
