import { AlertTriangle } from 'lucide-react'

export function DbNotConfigured() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center max-w-lg mx-auto">
      <div className="w-12 h-12 rounded-full bg-yellow-900/40 flex items-center justify-center mb-4">
        <AlertTriangle className="w-6 h-6 text-yellow-400" />
      </div>
      <h2 className="text-lg font-bold mb-2">Database Not Configured</h2>
      <p className="text-sm text-zinc-400 mb-6">
        The app needs a PostgreSQL database to run. Follow these steps to connect one:
      </p>
      <ol className="text-left text-sm text-zinc-300 space-y-3 w-full">
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">1</span>
          <span>Create a free database at <strong className="text-white">neon.tech</strong> → New Project → copy the <em>Connection string</em></span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">2</span>
          <span>Go to <strong className="text-white">vercel.com</strong> → your project → Settings → Environment Variables → update <code className="bg-zinc-800 px-1 rounded text-xs">DATABASE_URL</code> with your Neon connection string</span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">3</span>
          <span>Run migrations locally once: <code className="bg-zinc-800 px-1 rounded text-xs">DATABASE_URL=&quot;your-url&quot; npm run db:migrate</code></span>
        </li>
        <li className="flex gap-3">
          <span className="shrink-0 w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">4</span>
          <span>Redeploy: <code className="bg-zinc-800 px-1 rounded text-xs">vercel --prod --yes</code></span>
        </li>
      </ol>
    </div>
  )
}
