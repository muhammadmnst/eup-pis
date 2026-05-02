import type { Metadata } from 'next'
import { ProjectForm } from '@/components/admin/ProjectForm'

export const metadata: Metadata = { title: 'Tambah Project Baru' }

export default function TambahProyekPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Tambah Project Baru</h1>
        <p className="text-slate-400 text-sm mt-1">Isi informasi project sesuai data lapangan</p>
      </div>
      <ProjectForm mode="create" />
    </div>
  )
}
