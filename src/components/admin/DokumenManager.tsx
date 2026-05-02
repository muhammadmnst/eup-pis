'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Trash2, UploadCloud, Loader2 } from 'lucide-react'
import type { Document } from '@prisma/client'

interface Props {
  projectId: string
  initialDokumen: Document[]
}

export function DokumenManager({ projectId, initialDokumen }: Props) {
  const router = useRouter()
  const [docs, setDocs] = useState<Document[]>(initialDokumen)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    setError('')
    setUploading(true)

    const fd = new FormData()
    fd.append('projectId', projectId)
    for (let i = 0; i < files.length; i++) {
      fd.append('files', files[i])
    }

    try {
      const res = await fetch('/api/dokumen/upload', {
        method: 'POST',
        body: fd,
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Gagal upload dokumen')
      }

      const data = await res.json()
      setDocs((prev) => [...prev, ...data.documents])
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
      // reset input
      e.target.value = ''
    }
  }

  async function handleDelete(docId: string) {
    if (!confirm('Hapus dokumen ini?')) return

    try {
      const res = await fetch(`/api/dokumen/${docId}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Gagal menghapus dokumen')

      setDocs((prev) => prev.filter((d) => d.id !== docId))
      router.refresh()
    } catch (err: any) {
      alert(err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">Upload Dokumen</h2>
            <p className="text-sm text-slate-400">PDF, Word, Excel (Max 10MB)</p>
          </div>

          <label className="btn-primary gap-2 cursor-pointer relative overflow-hidden group">
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Mengunggah...</>
            ) : (
              <><UploadCloud className="w-4 h-4" /> Pilih File</>
            )}
            <input
              type="file"
              multiple
              className="hidden"
              disabled={uploading}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,image/*"
            />
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {docs.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 border-2 border-dashed border-slate-700 rounded-xl">
            Belum ada dokumen pendukung.
          </div>
        ) : (
          docs.map((doc) => (
            <div key={doc.id} className="card p-4 flex flex-col gap-3 group">
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg shrink-0">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-white truncate" title={doc.title ?? doc.filename}>
                    {doc.title ?? doc.filename}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {new Date(doc.createdAt).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-2 pt-3 border-t border-slate-700/50">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary py-1 px-3 text-xs"
                >
                  Buka
                </a>
                <button
                  onClick={() => handleDelete(doc.id)}
                  className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"
                  title="Hapus Dokumen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
