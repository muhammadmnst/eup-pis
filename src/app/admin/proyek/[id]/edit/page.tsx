import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { ProjectForm } from '@/components/admin/ProjectForm'
import { CalendarDays, Image as ImageIcon, Eye, FileText } from 'lucide-react'

export const metadata: Metadata = { title: 'Edit Project' }
export const dynamic = 'force-dynamic'

export default async function EditProyekPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
  })
  if (!project) notFound()

  // Serialize dates to strings for client component
  const initialData = {
    id:             project.id,
    name:           project.name,
    position:       project.position ?? '',
    startDate:      project.startDate?.toISOString() ?? '',
    pic:            project.pic ?? '',
    vendor:         project.vendor ?? '',
    vendorPhone:    project.vendorPhone ?? '',
    address:        project.address ?? '',
    noSpr:          project.noSpr ?? '',
    correlatedDate: project.correlatedDate?.toISOString() ?? '',
    status:         project.status,
    progress:       project.progress,
    remark:         project.remark ?? '',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Project</h1>
          <p className="text-slate-400 text-sm mt-1 line-clamp-1">{project.name}</p>
        </div>
        {/* Quick links */}
        <div className="flex gap-2 flex-wrap">
          <Link href={`/admin/proyek/${params.id}/foto`} className="btn-secondary gap-2 text-sm">
            <ImageIcon className="w-4 h-4" />
            Foto
          </Link>
          <Link href={`/admin/proyek/${params.id}/jadwal`} className="btn-secondary gap-2 text-sm">
            <CalendarDays className="w-4 h-4" />
            Jadwal
          </Link>
          <Link href={`/admin/proyek/${params.id}/dokumen`} className="btn-secondary gap-2 text-sm">
            <FileText className="w-4 h-4" />
            Dokumen
          </Link>
          <Link href={`/proyek/${params.id}`} target="_blank" className="btn-ghost gap-2 text-sm">
            <Eye className="w-4 h-4" />
            Lihat Publik
          </Link>
        </div>
      </div>

      <ProjectForm mode="edit" initialData={initialData} />
    </div>
  )
}
