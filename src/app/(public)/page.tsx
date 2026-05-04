import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/db'
import { Status } from '@prisma/client'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { STATUS_CONFIG, formatTanggalPendek, cn } from '@/lib/utils'
import { APP_COMPANY } from '@/lib/constants'
import {
  Search, MapPin, User, Building2, Calendar,
  FileText, ChevronRight, Layers, CheckCircle2,
  Clock, PauseCircle, XCircle, BarChart3,
  LayoutGrid, List as ListIcon, ChevronLeft
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Beranda — Daftar Project',
  description: `Status project GA ${APP_COMPANY} secara real-time`,
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

// ─── Types ───────────────────────────────────────────────
interface SearchParams {
  q?: string
  status?: string
  view?: string
  page?: string
}

// ─── Data fetching ───────────────────────────────────────
async function getProjects(searchParams: SearchParams) {
  const page = parseInt(searchParams.page || '1', 10)
  const take = 12 // Pagination Limit (Point 1)
  const skip = (page - 1) * take

  const where: Record<string, unknown> = { year: 2026 }

  if (searchParams.q) {
    where.OR = [
      { name: { contains: searchParams.q, mode: 'insensitive' } },
      { vendor: { contains: searchParams.q, mode: 'insensitive' } },
      { pic: { contains: searchParams.q, mode: 'insensitive' } },
      { position: { contains: searchParams.q, mode: 'insensitive' } },
      { noSpr: { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }

  if (searchParams.status && searchParams.status !== 'SEMUA') {
    where.status = searchParams.status as Status
  }

  const [projects, totalFiltered, stats] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: [{ status: 'asc' }, { updatedAt: 'desc' }],
      take,
      skip,
      include: {
        photos: { where: { isCover: true }, take: 1 },
      },
    }),
    prisma.project.count({ where }),
    prisma.project.groupBy({
      by: ['status'],
      _count: true,
      where: { year: 2026 },
    }),
  ])

  const totalPages = Math.ceil(totalFiltered / take)

  return { projects, totalFiltered, totalPages, page, stats }
}

// ─── Constants ───────────────────────────────────────────
const STAT_ITEMS = [
  { key: 'ALL', label: 'Total Project', icon: Layers, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  { key: 'ON_PROGRESS', label: 'Sedang Dikerjakan', icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  { key: 'COMPLETED', label: 'Selesai', icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  { key: 'PLANNED', label: 'Direncanakan', icon: BarChart3, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
  { key: 'ON_HOLD', label: 'Ditunda', icon: PauseCircle, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  { key: 'CANCELLED', label: 'Dibatalkan', icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10' },
]

const TAB_OPTIONS = [
  { value: 'SEMUA', label: 'Semua Project' },
  { value: 'ON_PROGRESS', label: STATUS_CONFIG.ON_PROGRESS.label },
  { value: 'COMPLETED', label: STATUS_CONFIG.COMPLETED.label },
  { value: 'PLANNED', label: STATUS_CONFIG.PLANNED.label },
  { value: 'ON_HOLD', label: STATUS_CONFIG.ON_HOLD.label },
]

// ─── Page ────────────────────────────────────────────────
export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { projects, totalFiltered, totalPages, page, stats } = await getProjects(searchParams)
  const total = await prisma.project.count({ where: { year: 2026 } })
  const statMap = Object.fromEntries(stats.map((s) => [s.status, s._count]))

  const currentStatus = searchParams.status || 'SEMUA'
  const viewMode = searchParams.view === 'list' ? 'list' : 'grid'

  // Helper untuk membangun URL dengan param baru
  const buildUrl = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.status) params.set('status', searchParams.status)
    if (searchParams.view) params.set('view', searchParams.view)
    if (searchParams.page) params.set('page', searchParams.page)

    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) params.delete(k)
      else params.set(k, v)
    })

    return `/?${params.toString()}`
  }

  return (
    <div className="section min-h-screen pb-20">
      <div className="container-app space-y-10">

        {/* ─── Hero ──────────────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600/20 via-slate-800/80 to-slate-900 border border-blue-500/20 px-8 py-12">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium mb-4">
              <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
              Live Monitoring
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
              Project Information System
            </h1>
            <p className="text-slate-300 text-lg max-w-xl">
              Status project GA <span className="text-blue-300 font-semibold">{APP_COMPANY}</span> secara real-time.
            </p>
          </div>
        </div>

        {/* ─── Stats Bar ─────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_ITEMS.map(({ key, label, icon: Icon, color, bg }) => {
            const count = key === 'ALL' ? total : (statMap[key] ?? 0)
            return (
              <div key={key} className="stat-card gap-3 py-4 px-4 bg-slate-900/50 border-slate-700/50">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', bg)}>
                  <Icon className={cn('w-5 h-5', color)} />
                </div>
                <div className="min-w-0">
                  <p className="text-2xl font-bold text-white leading-none">{count}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">{label}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* ─── Filter & Control Bar ──────────────── */}
        <div className="sticky top-[73px] z-20 -mx-4 px-4 py-4 sm:mx-0 sm:px-0 bg-slate-950/80 backdrop-blur-xl border-b sm:border-none border-slate-800">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">

            {/* Sistem Tabs (Point 2) */}
            <div className="w-full lg:w-auto overflow-x-auto pb-2 sm:pb-0 scrollbar-hide flex-1">
              <div className="flex items-center gap-2">
                {TAB_OPTIONS.map(tab => {
                  const isActive = currentStatus === tab.value;
                  return (
                    <Link
                      key={tab.value}
                      href={buildUrl({ status: tab.value === 'SEMUA' ? undefined : tab.value, page: '1' })}
                      className={cn(
                        "px-4 py-2 rounded-full whitespace-nowrap font-medium text-sm transition-all border",
                        isActive
                          ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                          : "bg-slate-800/50 border-transparent text-slate-400 hover:text-white hover:bg-slate-700"
                      )}
                    >
                      {tab.label}
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Search & View Toggle (Point 3) */}
            <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
              <form method="get" className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  name="q"
                  defaultValue={searchParams.q ?? ''}
                  placeholder="Cari project..."
                  className="input pl-10 py-2 h-10 w-full bg-slate-900 border-slate-700 focus:border-blue-500"
                />
                {searchParams.status && <input type="hidden" name="status" value={searchParams.status} />}
                {searchParams.view && <input type="hidden" name="view" value={searchParams.view} />}
                {/* Submit button hidden, form submits on Enter */}
                <button type="submit" className="hidden">Cari</button>
              </form>

              <div className="flex items-center bg-slate-900 rounded-lg p-1 shrink-0 border border-slate-700/50 h-10">
                <Link
                  href={buildUrl({ view: 'grid' })}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === 'grid' ? "bg-slate-700 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300")}
                  title="Grid View"
                >
                  <LayoutGrid className="w-4 h-4" />
                </Link>
                <Link
                  href={buildUrl({ view: 'list' })}
                  className={cn("p-1.5 rounded-md transition-colors", viewMode === 'list' ? "bg-slate-700 text-blue-400 shadow-sm" : "text-slate-500 hover:text-slate-300")}
                  title="List View"
                >
                  <ListIcon className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        </div>

        {/* ─── Result / Info row ─────────────────── */}
        <div className="flex items-center justify-between">
          <p className="text-slate-400 text-sm">
            Menampilkan <span className="text-white font-semibold">{totalFiltered}</span> project
            {searchParams.q && (
              <> untuk "<span className="text-blue-300">{searchParams.q}</span>"</>
            )}
          </p>
          {(searchParams.q || currentStatus !== 'SEMUA') && (
            <Link href="/" className="text-sm text-slate-400 hover:text-blue-400 transition-colors">
              Hapus filter ×
            </Link>
          )}
        </div>

        {/* ─── Project Listing ───────────────────── */}
        {projects.length === 0 ? (
          <div className="text-center py-20 text-slate-500 bg-slate-900/30 rounded-3xl border border-slate-800/50">
            <Layers className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-semibold">Tidak ada project ditemukan</p>
            <p className="text-sm mt-1">Coba ubah kata kunci atau filter status</p>
          </div>
        ) : (
          <div className={cn(
            "gap-5",
            viewMode === 'grid'
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              : "flex flex-col space-y-4"
          )}>
            {projects.map((project) => {
              const cover = project.photos[0]

              // ─── Tampilan Card Simple (Grid View) (Point 4) ───
              if (viewMode === 'grid') {
                return (
                  <Link
                    key={project.id}
                    href={`/proyek/${project.id}`}
                    className="card-hover group flex flex-col overflow-hidden animate-in h-400 bg-slate-900 border border-slate-800 rounded-2xl"
                  >
                    <div className="relative h-44 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden shrink-0">
                      {cover ? (
                        <Image src={cover.url} alt={project.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Building2 className="w-12 h-12 text-slate-600" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                    </div>

                    <div className="flex flex-col flex-1 p-5 gap-2">
                      <h3 className="font-bold text-slate-100 leading-snug line-clamp-2 text-base group-hover:text-blue-300 transition-colors" title={project.name}>
                        {project.name}
                      </h3>
                      {project.startDate && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <Calendar className="w-3 h-3" />
                          <span>{formatTanggalPendek(project.startDate)}</span>
                        </div>
                      )}

                      <div className="mt-auto pt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Progres</span>
                          <span className="text-xs font-bold text-blue-400">{project.progress}%</span>
                        </div>
                        <ProgressBar value={project.progress} />
                      </div>
                    </div>
                  </Link>
                )
              }

              // ─── Tampilan Desktop List (List View) (Point 3 & 4) ───
              return (
                <Link
                  key={project.id}
                  href={`/proyek/${project.id}`}
                  className="group flex flex-col sm:flex-row bg-slate-900 border border-slate-800 hover:border-blue-500/40 rounded-2xl overflow-hidden transition-all animate-in p-4 sm:p-5 gap-5"
                >
                  <div className="relative w-full sm:w-56 h-40 sm:h-auto rounded-xl overflow-hidden shrink-0 bg-slate-800">
                    {cover ? (
                      <Image src={cover.url} alt={project.name} fill unoptimized className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 640px) 100vw, 256px" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-slate-600" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col min-w-0 py-1">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <StatusBadge status={project.status} size="sm" />
                      {project.noSpr && (
                        <span className="text-[10px] font-mono text-slate-400 border border-slate-700/80 bg-slate-800/50 px-2 py-0.5 rounded-md">
                          SPR: {project.noSpr}
                        </span>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-100 text-lg mb-3 truncate group-hover:text-blue-300 transition-colors">
                      {project.name}
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs text-slate-400 mb-4 bg-slate-950/50 p-3 rounded-lg border border-slate-800/50">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Building2 className="w-2.5 h-2.5" /> Vendor</span>
                        <span className="truncate font-medium text-slate-300">{project.vendor || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><User className="w-2.5 h-2.5" /> PIC</span>
                        <span className="truncate font-medium text-slate-300">{project.pic || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> Lokasi</span>
                        <span className="truncate font-medium text-slate-300">{project.position || '-'}</span>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-slate-500 flex items-center gap-1"><Calendar className="w-2.5 h-2.5" /> Mulai</span>
                        <span className="truncate font-medium text-slate-300">{project.startDate ? formatTanggalPendek(project.startDate) : '-'}</span>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-4">
                      <div className="flex-1 max-w-sm">
                        <ProgressBar value={project.progress} />
                      </div>
                      <span className="text-sm font-bold text-blue-400 font-mono">{project.progress}%</span>
                    </div>
                  </div>

                  <div className="hidden sm:flex items-center justify-center px-2">
                    <div className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800/50 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 group-hover:text-white transition-all text-slate-500 shadow-sm">
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}

        {/* ─── Pagination (Point 1) ──────────────── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-12 pt-8 border-t border-slate-800/50">
            <Link
              href={page > 1 ? buildUrl({ page: (page - 1).toString() }) : '#'}
              className={cn(
                "p-2 rounded-lg border border-slate-700/50 flex items-center justify-center transition-colors",
                page > 1 ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-900/50 text-slate-600 cursor-not-allowed border-transparent pointer-events-none"
              )}
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>

            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none scrollbar-hide px-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={buildUrl({ page: p.toString() })}
                  className={cn(
                    "min-w-10 h-10 px-2 rounded-lg border flex items-center justify-center text-sm font-medium transition-all shrink-0",
                    p === page
                      ? "bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-500/25"
                      : "bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-white hover:bg-slate-700"
                  )}
                >
                  {p}
                </Link>
              ))}
            </div>

            <Link
              href={page < totalPages ? buildUrl({ page: (page + 1).toString() }) : '#'}
              className={cn(
                "p-2 rounded-lg border border-slate-700/50 flex items-center justify-center transition-colors",
                page < totalPages ? "bg-slate-800 text-white hover:bg-slate-700" : "bg-slate-900/50 text-slate-600 cursor-not-allowed border-transparent pointer-events-none"
              )}
            >
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  )
}
