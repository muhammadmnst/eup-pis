import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Status } from '@prisma/client'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { STATUS_CONFIG, formatTanggalPendek } from '@/lib/utils'
import {
  Layers, Clock, CheckCircle2, BarChart3,
  PauseCircle, XCircle, PlusCircle, ArrowRight,
  TrendingUp
} from 'lucide-react'

export const metadata: Metadata = { title: 'Dashboard Admin' }
export const dynamic = 'force-dynamic'

const STAT_CARDS = [
  { status: null,          label: 'Total Project',     icon: Layers,       color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20' },
  { status: 'ON_PROGRESS', label: 'Sedang Dikerjakan', icon: Clock,        color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  { status: 'COMPLETED',   label: 'Selesai',           icon: CheckCircle2, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { status: 'PLANNED',     label: 'Direncanakan',      icon: BarChart3,    color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20' },
  { status: 'ON_HOLD',     label: 'Ditunda',           icon: PauseCircle,  color: 'text-yellow-400',  bg: 'bg-yellow-500/10',  border: 'border-yellow-500/20' },
  { status: 'CANCELLED',   label: 'Dibatalkan',        icon: XCircle,      color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
]

export default async function AdminDashboardPage() {
  const [total, grouped, recent] = await Promise.all([
    prisma.project.count({ where: { year: 2026 } }),
    prisma.project.groupBy({ by: ['status'], _count: true, where: { year: 2026 } }),
    prisma.project.findMany({
      where: { year: 2026 },
      orderBy: { updatedAt: 'desc' },
      take: 8,
      include: { photos: { where: { isCover: true }, take: 1 } },
    }),
  ])

  const statMap = Object.fromEntries(grouped.map((g) => [g.status, g._count]))
  const avgProgress = recent.length
    ? Math.round(recent.reduce((sum, p) => sum + p.progress, 0) / recent.length)
    : 0

  return (
    <div className="space-y-8 max-w-7xl">

      {/* ─── Page header ──────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Ringkasan status project 2026</p>
        </div>
        <Link href="/admin/proyek/baru" className="btn-primary gap-2">
          <PlusCircle className="w-4 h-4" />
          Tambah Project
        </Link>
      </div>

      {/* ─── Stat cards ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {STAT_CARDS.map(({ status, label, icon: Icon, color, bg, border }) => {
          const count = status === null ? total : (statMap[status] ?? 0)
          return (
            <div key={label} className={`card px-5 py-4 border ${border} flex flex-col gap-3`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white leading-none">{count}</p>
                <p className="text-xs text-slate-400 mt-1 leading-tight">{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ─── Avg progress banner ──────────────── */}
      <div className="card p-5 flex items-center gap-5">
        <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
          <TrendingUp className="w-6 h-6 text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-slate-400 mb-2">Rata-rata Progress Keseluruhan</p>
          <ProgressBar value={avgProgress} showLabel className="max-w-md" />
        </div>
        <p className="text-3xl font-bold text-blue-400 shrink-0">{avgProgress}%</p>
      </div>

      {/* ─── Recent projects table ─────────────── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Project Terbaru</h2>
          <Link href="/admin/proyek" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            Lihat semua <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="table-wrapper">
          <table className="w-full text-sm">
            <thead>
              <tr className="table-head">
                <th className="px-4 py-3 text-left">Nama Project</th>
                <th className="hidden md:table-cell px-4 py-3 text-left">PIC</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="hidden sm:table-cell px-4 py-3 text-left">Progress</th>
                <th className="hidden lg:table-cell px-4 py-3 text-left">Mulai</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recent.map((p) => (
                <tr key={p.id} className="table-row">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-slate-200 line-clamp-1">{p.name}</p>
                      {p.noSpr && <p className="text-xs text-slate-500">{p.noSpr}</p>}
                    </div>
                  </td>
                  <td className="hidden md:table-cell px-4 py-3 text-slate-400">
                    {p.pic ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={p.status} size="sm" />
                  </td>
                  <td className="hidden sm:table-cell px-4 py-3 w-40">
                    <ProgressBar value={p.progress} showLabel />
                  </td>
                  <td className="hidden lg:table-cell px-4 py-3 text-slate-400 text-xs">
                    {formatTanggalPendek(p.startDate)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/proyek/${p.id}/edit`}
                      className="text-xs text-blue-400 hover:text-blue-300"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
