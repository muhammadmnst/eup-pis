import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { Status } from '@prisma/client'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { STATUS_CONFIG, formatTanggalPendek } from '@/lib/utils'
import {
  PlusCircle, Search, Pencil, Eye, CalendarDays, Image as ImageIcon
} from 'lucide-react'
import { DeleteProjectButton } from '@/components/admin/DeleteProjectButton'

export const metadata: Metadata = { title: 'Daftar Project' }
export const dynamic = 'force-dynamic'

interface SearchParams { q?: string; status?: string }

const FILTER_OPTIONS = [
  { value: 'SEMUA', label: 'Semua Status' },
  ...Object.entries(STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
]

export default async function AdminProyekPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const where: Record<string, unknown> = { year: 2026 }
  if (searchParams.q) {
    where.OR = [
      { name:   { contains: searchParams.q, mode: 'insensitive' } },
      { vendor: { contains: searchParams.q, mode: 'insensitive' } },
      { pic:    { contains: searchParams.q, mode: 'insensitive' } },
      { noSpr:  { contains: searchParams.q, mode: 'insensitive' } },
    ]
  }
  if (searchParams.status && searchParams.status !== 'SEMUA') {
    where.status = searchParams.status as Status
  }

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: {
      photos: { where: { isCover: true }, take: 1 },
      _count: { select: { tasks: true, photos: true } },
    },
  })

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Daftar Project</h1>
          <p className="text-slate-400 text-sm mt-1">{projects.length} project ditemukan</p>
        </div>
        <Link href="/admin/proyek/baru" className="btn-primary gap-2">
          <PlusCircle className="w-4 h-4" />
          Tambah
        </Link>
      </div>

      {/* Filter */}
      <form method="get" className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            name="q"
            defaultValue={searchParams.q ?? ''}
            placeholder="Cari nama, vendor, PIC, NO/SPR..."
            className="input pl-10"
          />
        </div>
        <select name="status" defaultValue={searchParams.status ?? 'SEMUA'} className="input sm:w-52">
          {FILTER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <button type="submit" className="btn-primary px-5">Cari</button>
        {(searchParams.q || (searchParams.status && searchParams.status !== 'SEMUA')) && (
          <Link href="/admin/proyek" className="btn-secondary px-5">Reset</Link>
        )}
      </form>

      {/* Table */}
      <div className="table-wrapper">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-head">
              <th className="px-4 py-3 text-left">Project</th>
              <th className="hidden md:table-cell px-4 py-3 text-left">Vendor / PIC</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="hidden sm:table-cell px-4 py-3 text-left w-36">Progress</th>
              <th className="hidden lg:table-cell px-4 py-3 text-left">Mulai</th>
              <th className="hidden lg:table-cell px-4 py-3 text-center">Jadwal</th>
              <th className="hidden lg:table-cell px-4 py-3 text-center">Foto</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {projects.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-slate-500">
                  Tidak ada project
                </td>
              </tr>
            )}
            {projects.map((p) => (
              <tr key={p.id} className="table-row">
                <td className="px-4 py-3">
                  <p className="font-medium text-slate-200 line-clamp-1">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.noSpr ?? p.position ?? '—'}</p>
                </td>
                <td className="hidden md:table-cell px-4 py-3 text-slate-400 text-xs">
                  <div>{p.vendor ?? '—'}</div>
                  <div className="text-slate-500">{p.pic ?? ''}</div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={p.status} size="sm" />
                </td>
                <td className="hidden sm:table-cell px-4 py-3">
                  <ProgressBar value={p.progress} showLabel />
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-slate-400 text-xs">
                  {formatTanggalPendek(p.startDate)}
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-center">
                  <Link href={`/admin/proyek/${p.id}/jadwal`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {p._count.tasks}
                  </Link>
                </td>
                <td className="hidden lg:table-cell px-4 py-3 text-center">
                  <Link href={`/admin/proyek/${p.id}/foto`} className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-blue-400">
                    <ImageIcon className="w-3.5 h-3.5" />
                    {p._count.photos}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/proyek/${p.id}`} target="_blank" className="btn-ghost p-1.5" title="Lihat publik">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <Link href={`/admin/proyek/${p.id}/edit`} className="btn-ghost p-1.5" title="Edit">
                      <Pencil className="w-4 h-4" />
                    </Link>
                    <DeleteProjectButton id={p.id} name={p.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
