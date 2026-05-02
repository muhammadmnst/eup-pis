'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  Zap, LayoutDashboard, FolderOpen, PlusCircle,
  LogOut, Menu, X, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { APP_COMPANY } from '@/lib/constants'

const NAV_ITEMS = [
  { href: '/admin',              label: 'Dashboard',       icon: LayoutDashboard, exact: true },
  { href: '/admin/proyek',       label: 'Daftar Project',  icon: FolderOpen },
  { href: '/admin/proyek/baru',  label: 'Tambah Project',  icon: PlusCircle },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href)
  }

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ─── Sidebar (desktop) ──────────────────── */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 border-r border-slate-800 bg-slate-900">
        <SidebarContent pathname={pathname} isActive={isActive} />
      </aside>

      {/* ─── Mobile sidebar overlay ─────────────── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 h-full border-r border-slate-800 bg-slate-900">
            <SidebarContent pathname={pathname} isActive={isActive} onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      {/* ─── Main ───────────────────────────────── */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-14 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center px-4 gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden btn-ghost p-2"
            aria-label="Buka menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => signOut({ callbackUrl: '/admin/login' })}
            className="btn-ghost gap-2 text-sm text-slate-400 hover:text-red-400"
            id="btn-logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

// ─── Sidebar content (reused) ─────────────────────────────
function SidebarContent({
  isActive,
  onNavigate,
}: {
  pathname: string
  isActive: (href: string, exact?: boolean) => boolean
  onNavigate?: () => void
}) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-3" onClick={onNavigate}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-900/40">
            <Zap className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-100 leading-tight">Admin Panel</p>
            <p className="text-[11px] text-slate-500 leading-tight">EUP Project Tracker</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = isActive(href, exact)
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                active
                  ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer info */}
      <div className="p-4 border-t border-slate-800">
        <p className="text-[11px] text-slate-600 text-center">{APP_COMPANY}</p>
        <Link
          href="/"
          target="_blank"
          className="block text-center text-[11px] text-slate-600 hover:text-slate-400 mt-1 transition-colors"
        >
          Lihat Portal Publik ↗
        </Link>
      </div>
    </div>
  )
}
