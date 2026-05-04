'use client'

import Image from 'next/image'
import { useState } from 'react'
import { PhotoLightbox } from '@/components/PhotoLightbox'
import { ImageIcon, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  caption: string | null
  isCover: boolean
}

interface Props {
  photos: Photo[]
  projectName: string
}

export function PhotoGalleryClient({ photos, projectName }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const cover   = photos.find((p) => p.isCover) ?? photos[0]
  const gallery = photos.filter((p, i) => !(p.isCover && i === photos.indexOf(cover)))

  // All photos ordered: cover first, then gallery
  const allPhotos = cover
    ? [cover, ...photos.filter((p) => p.id !== cover?.id)]
    : photos

  if (photos.length === 0) {
    return (
      <div className="card h-56 flex items-center justify-center text-slate-600">
        <div className="text-center">
          <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Belum ada foto</p>
        </div>
      </div>
    )
  }

  const coverIndexInAll = 0

  return (
    <>
      {/* Cover photo */}
      {cover && (
        <div className="card overflow-hidden">
          <button
            onClick={() => setLightboxIndex(coverIndexInAll)}
            className="relative w-full h-72 sm:h-96 bg-slate-800 block group cursor-zoom-in"
            id="photo-cover-trigger"
          >
            <Image
              src={cover.url}
              alt={cover.caption ?? projectName}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
              priority
              unoptimized
              sizes="(max-width: 1024px) 100vw, 66vw"
            />
            {/* Zoom overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ZoomIn className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 drop-shadow-lg transition-opacity" />
            </div>
            {/* Cover badge */}
            <div className="absolute top-3 left-3 px-2 py-0.5 bg-blue-600/90 text-white text-[11px] font-bold rounded-full">
              Cover
            </div>
          </button>
          {cover.caption && (
            <p className="px-4 py-2 text-xs text-slate-400 border-t border-slate-700">
              {cover.caption}
            </p>
          )}
        </div>
      )}

      {/* Gallery grid */}
      {gallery.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {gallery.map((photo, i) => {
            const indexInAll = allPhotos.findIndex((p) => p.id === photo.id)
            return (
              <button
                key={photo.id}
                onClick={() => setLightboxIndex(indexInAll)}
                className="relative h-28 rounded-xl overflow-hidden bg-slate-800 group cursor-zoom-in"
                id={`photo-thumb-${photo.id}`}
              >
                <Image
                  src={photo.url}
                  alt={photo.caption ?? `Foto ${i + 2}`}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 1024px) 33vw, 22vw"
                />
                {/* Zoom overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                  <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 drop-shadow transition-opacity" />
                </div>
                {photo.caption && (
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-[10px] text-white truncate">{photo.caption}</p>
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Photo count hint */}
      <p className="text-xs text-slate-500 text-center">
        {photos.length} foto · Klik untuk melihat lebih besar
      </p>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <PhotoLightbox
          photos={allPhotos}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
