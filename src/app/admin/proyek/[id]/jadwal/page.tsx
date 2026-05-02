import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { JadwalEditor } from '@/components/admin/JadwalEditor'
import { ArrowLeft } from 'lucide-react'

export const metadata: Metadata = { title: 'Editor Jadwal' }
export const dynamic = 'force-dynamic'

export default async function JadwalPage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      tasks: {
        orderBy: { order: 'asc' },
        include: { schedule: { orderBy: { dayNumber: 'asc' } } },
      },
    },
  })
  if (!project) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/admin/proyek/${params.id}/edit`} className="btn-ghost gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Time Schedule</h1>
          <p className="text-slate-400 text-sm mt-0.5 line-clamp-1">{project.name}</p>
        </div>
      </div>

      <JadwalEditor
        projectId={project.id}
        startDate={project.startDate?.toISOString() ?? null}
        initialTasks={project.tasks.map((t) => ({
          ...t,
          schedule: t.schedule.map((s) => ({
            ...s,
            date: s.date.toISOString(),
          })),
        }))}
      />
    </div>
  )
}
