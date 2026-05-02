'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'

interface Props {
  id: string
  name: string
}

export function DeleteProjectButton({ id, name }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm(`Hapus project "${name}"?\n\nSemua data (foto, jadwal) akan ikut terhapus.`)) return
    setLoading(true)

    const res = await fetch(`/api/proyek/${id}`, { method: 'DELETE' })
    setLoading(false)

    if (res.ok) {
      router.refresh()
    } else {
      alert('Gagal menghapus project. Coba lagi.')
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn-ghost p-1.5 text-slate-500 hover:text-red-400 disabled:opacity-40"
      title="Hapus project"
      id={`delete-project-${id}`}
    >
      {loading
        ? <span className="w-4 h-4 border-2 border-slate-500 border-t-red-400 rounded-full animate-spin" />
        : <Trash2 className="w-4 h-4" />
      }
    </button>
  )
}
