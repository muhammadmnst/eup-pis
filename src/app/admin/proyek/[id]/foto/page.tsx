import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { FotoManager } from '@/components/admin/FotoManager'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Manajemen Foto' }
export const dynamic = 'force-dynamic'

export default async function FotoPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: { photos: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }] } },
  })
  if (!project) notFound()

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link href={`/admin/proyek/${params.id}/edit`} className="btn-ghost gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Manajemen Foto</h1>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{project.name}</p>
        </div>
      </div>
      <FotoManager projectId={project.id} initialPhotos={project.photos} />
    </div>
  )
}
