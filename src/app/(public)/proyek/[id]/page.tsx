import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { StatusBadge } from '@/components/StatusBadge'
import { ProgressBar } from '@/components/ProgressBar'
import { TimeScheduleGrid } from '@/components/TimeScheduleGrid'
import { PhotoGalleryClient } from '@/components/PhotoGalleryClient'
import { formatTanggal, STATUS_CONFIG } from '@/lib/utils'
import {
  ArrowLeft, MapPin, User, Building2, Phone,
  Calendar, FileText, MessageSquare, Clock,
  CalendarDays
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// ─── Generate metadata ────────────────────────────────────
export async function generateMetadata({
  params,
}: {
  params: { id: string }
}): Promise<Metadata> {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    select: { name: true, position: true, status: true },
  })
  if (!project) return { title: 'Project Tidak Ditemukan' }
  return {
    title: project.name,
    description: `Detail progress project ${project.name}${project.position ? ` di ${project.position}` : ''} — ${STATUS_CONFIG[project.status].label}`,
  }
}

// ─── Page ────────────────────────────────────────────────
export default async function ProjectDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      photos: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }] },
      tasks: {
        orderBy: { order: 'asc' },
        include: {
          schedule: { orderBy: { dayNumber: 'asc' } },
        },
      },
      statusHistory: { orderBy: { changedAt: 'desc' }, take: 10 },
    },
  })

  if (!project) notFound()

  return (
    <div className="section">
      <div className="container-app space-y-8">

        {/* ─── Back & Breadcrumb ──────────────── */}
        <div className="flex items-center gap-3">
          <Link href="/" className="btn-ghost gap-2 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Kembali
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400 text-sm truncate">{project.name}</span>
        </div>

        {/* ─── Header ────────────────────────── */}
        <div className="card p-6 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              {project.noSpr && (
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <FileText className="w-3.5 h-3.5" />
                  {project.noSpr}
                </div>
              )}
              <h1 className="text-2xl font-bold text-white">{project.name}</h1>
              <StatusBadge status={project.status} />
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-blue-400">{project.progress}%</p>
              <p className="text-xs text-slate-500 mt-1">Progress</p>
            </div>
          </div>
          <ProgressBar value={project.progress} showLabel={false} className="mt-2" />
        </div>

        {/* ─── Two column: info + foto ────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ─ Info detail ─ */}
          <div className="lg:col-span-1 space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                Informasi Project
              </h2>
              <InfoRow icon={MapPin}    label="Posisi / Plant"   value={project.position} />
              <InfoRow icon={User}      label="PIC"              value={project.pic} />
              <InfoRow icon={Building2} label="Vendor / Pelaksana" value={project.vendor} />
              <InfoRow icon={Phone}     label="No. Telp Vendor"  value={project.vendorPhone} />
              <InfoRow icon={MapPin}    label="Alamat"           value={project.address} />
              <InfoRow icon={Calendar}  label="Tanggal Mulai"    value={formatTanggal(project.startDate)} />
              <InfoRow icon={Calendar}  label="Tanggal Korelasi" value={formatTanggal(project.correlatedDate)} />
              {project.remark && (
                <InfoRow icon={MessageSquare} label="Keterangan" value={project.remark} />
              )}
            </div>

            {/* Status History */}
            {project.statusHistory.length > 0 && (
              <div className="card p-5 space-y-3">
                <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
                  Riwayat Status
                </h2>
                <div className="space-y-3">
                  {project.statusHistory.map((log) => (
                    <div key={log.id} className="flex gap-3">
                      <div className="mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-600" />
                      </div>
                      <div>
                        <StatusBadge status={log.newStatus} size="sm" />
                        <p className="text-[11px] text-slate-500 mt-1">
                          {new Date(log.changedAt).toLocaleDateString('id-ID', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit',
                          })}
                        </p>
                        {log.note && <p className="text-xs text-slate-400 mt-0.5">{log.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─ Foto Gallery ─ */}
          <div className="lg:col-span-2 space-y-4">
            <PhotoGalleryClient
              photos={project.photos.map((p) => ({
                id: p.id,
                url: p.url,
                caption: p.caption,
                isCover: p.isCover,
              }))}
              projectName={project.name}
            />
          </div>
        </div>

        {/* ─── Time Schedule ──────────────────── */}
        {project.tasks.length > 0 && (
          <div className="card p-6 space-y-4">
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-400" />
              <h2 className="text-lg font-semibold text-white">Time Schedule</h2>
            </div>
            <TimeScheduleGrid tasks={project.tasks} />
          </div>
        )}

      </div>
    </div>
  )
}

// ─── Helper component ─────────────────────────────────────
function InfoRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType
  label: string
  value?: string | null
}) {
  if (!value) return null
  return (
    <div className="flex gap-3">
      <Icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
      <div>
        <p className="text-[11px] text-slate-500 mb-0.5">{label}</p>
        <p className="text-sm text-slate-200">{value}</p>
      </div>
    </div>
  )
}
