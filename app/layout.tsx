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
