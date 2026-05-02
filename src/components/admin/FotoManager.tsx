'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Upload, Trash2, Star, StarOff, Loader2, ImagePlus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  caption: string | null
  isCover: boolean
  order: number
}

interface Props {
  projectId: string
  initialPhotos: Photo[]
}

export function FotoManager({ projectId, initialPhotos }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function uploadFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)

    const fd = new FormData()
    Array.from(files).forEach((f) => fd.append('files', f))
    fd.append('projectId', projectId)

    const res = await fetch('/api/foto/upload', { method: 'POST', body: fd })
    setUploading(false)

    if (res.ok) {
      const data = await res.json()
      setPhotos((prev) => [...prev, ...data.photos])
      router.refresh()
    } else {
      alert('Gagal upload foto. Pastikan format JPG/PNG/WebP dan ukuran max 5MB.')
    }
  }

  async function setCover(photoId: string) {
    setLoadingId(photoId)
    const res = await fetch(`/api/foto/${photoId}/cover`, { method: 'PATCH', body: JSON.stringify({ projectId }) })
    setLoadingId(null)
    if (res.ok) {
      setPhotos((prev) => prev.map((p) => ({ ...p, isCover: p.id === photoId })))
    }
  }

  async function deletePhoto(photoId: string) {
    if (!confirm('Hapus foto ini?')) return
    setLoadingId(photoId)
    const res = await fetch(`/api/foto/${photoId}`, { method: 'DELETE' })
    setLoadingId(null)
    if (res.ok) {
      setPhotos((prev) => prev.filter((p) => p.id !== photoId))
      router.refresh()
    }
  }

  return (
    <div className="space-y-6">
      {/* ─── Drop Zone ─── */}
      <div
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadFiles(e.dataTransfer.files) }}
        className={cn(
          'card border-2 border-dashed cursor-pointer transition-all duration-200',
          'flex flex-col items-center justify-center gap-3 py-12',
          dragOver
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-slate-600 hover:border-slate-500 hover:bg-slate-800/60'
        )}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => uploadFiles(e.target.files)}
          id="foto-upload-input"
        />
        {uploading ? (
          <Loader2 className="w-10 h-10 text-blue-400 animate-spin" />
        ) : (
          <ImagePlus className="w-10 h-10 text-slate-500" />
        )}
        <div className="text-center">
          <p className="text-slate-300 font-medium">
            {uploading ? 'Mengupload...' : 'Klik atau drag foto ke sini'}
          </p>
          <p className="text-xs text-slate-500 mt-1">JPG, PNG, WebP — Maks. 5MB per file</p>
        </div>
        {!uploading && (
          <button className="btn-primary gap-2 mt-2" type="button">
            <Upload className="w-4 h-4" /> Pilih Foto
          </button>
        )}
      </div>

      {/* ─── Photo Grid ─── */}
      {photos.length === 0 ? (
        <p className="text-center text-slate-500 py-8">Belum ada foto. Upload foto pertama!</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                'group relative rounded-xl overflow-hidden bg-slate-800 border-2 transition-all',
                photo.isCover ? 'border-blue-500' : 'border-transparent hover:border-slate-600'
              )}
            >
              {/* Image */}
              <div className="relative h-36">
                <Image
                  src={photo.url}
                  alt={photo.caption ?? 'foto'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, 25vw"
                />
              </div>

              {/* Cover badge */}
              {photo.isCover && (
                <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 rounded-full text-[10px] font-bold text-white">
                  Cover
                </div>
              )}

              {/* Loading overlay */}
              {loadingId === photo.id && (
                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                </div>
              )}

              {/* Actions overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setCover(photo.id)}
                  disabled={photo.isCover || !!loadingId}
                  className="w-9 h-9 rounded-lg bg-blue-600/80 hover:bg-blue-600 flex items-center justify-center transition-colors disabled:opacity-40"
                  title={photo.isCover ? 'Foto cover' : 'Jadikan cover'}
                >
                  {photo.isCover ? <Star className="w-4 h-4 text-white fill-white" /> : <StarOff className="w-4 h-4 text-white" />}
                </button>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  disabled={!!loadingId}
                  className="w-9 h-9 rounded-lg bg-red-600/80 hover:bg-red-600 flex items-center justify-center transition-colors disabled:opacity-40"
                  title="Hapus foto"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Caption */}
              {photo.caption && (
                <p className="px-2 py-1.5 text-[11px] text-slate-400 truncate border-t border-slate-700">
                  {photo.caption}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
