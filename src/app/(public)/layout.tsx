import Link from 'next/link'
import { APP_COMPANY, APP_NAME } from '@/lib/constants'
import { Zap } from 'lucide-react'
import Image from 'next/image'
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* ─── Navbar ─────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md">
        <div className="container-app">
          <div className="flex h-16 items-center justify-between">
            {/* Logo + Brand */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-9 h-9 relative flex items-center justify-center shrink-0">
                <Image src="/logo.png" alt="Logo" fill unoptimized className="object-contain" sizes="36px" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-100 leading-tight">EUP Project Tracker</p>
                <p className="text-[11px] text-slate-400 leading-tight">PT. Energi Unggul Persada</p>
              </div>
            </Link>

            {/* Nav links */}
            <nav className="hidden sm:flex items-center gap-1">
              <Link href="/" className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                Beranda
              </Link>
              <Link
                href="/admin"
                className="ml-2 btn-primary text-sm py-1.5 px-4"
                id="nav-admin-link"
              >
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* ─── Main ───────────────────────────────── */}
      <main className="flex-1">
        {children}
      </main>

      {/* ─── Footer ─────────────────────────────── */}
      <footer className="border-t border-slate-800 py-6 mt-12">
        <div className="container-app text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} {APP_COMPANY} · {APP_NAME}</p>
        </div>
      </footer>
    </div>
  )
}
