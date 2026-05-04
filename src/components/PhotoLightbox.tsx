'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Photo {
  id: string
  url: string
  caption?: string | null
  isCover: boolean
}

interface Props {
  photos: Photo[]
  initialIndex?: number
  onClose: () => void
}

export function PhotoLightbox({ photos, initialIndex = 0, onClose }: Props) {
  const [current, setCurrent] = useState(initialIndex)

  const prev = useCallback(() =>
    setCurrent((i) => (i - 1 + photos.length) % photos.length), [photos.length])
  const next = useCallback(() =>
    setCurrent((i) => (i + 1) % photos.length), [photos.length])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape')      onClose()
      if (e.key === 'ArrowLeft')   prev()
      if (e.key === 'ArrowRight')  next()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, prev, next])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const photo = photos[current]

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* ── Top bar ── */}
      <div
        className="flex items-center justify-between px-4 py-3 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-sm text-slate-400">
          {current + 1} / {photos.length}
          {photo.isCover && (
            <span className="ml-2 px-2 py-0.5 text-[10px] bg-blue-600 text-white rounded-full">Cover</span>
          )}
        </span>
        {photo.caption && (
          <p className="text-sm text-slate-300 text-center flex-1 px-4 truncate">{photo.caption}</p>
        )}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          id="lightbox-close"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* ── Main image ── */}
      <div
        className="flex-1 relative flex items-center justify-center px-16 py-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-full max-w-5xl">
          <Image
            key={photo.id}
            src={photo.url}
            alt={photo.caption ?? `Foto ${current + 1}`}
            fill
            unoptimized
            className="object-contain"
            sizes="(max-width: 1024px) 100vw, 80vw"
            priority
          />
        </div>

        {/* Prev / Next buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              id="lightbox-prev"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-xl bg-black/60 hover:bg-black/80 flex items-center justify-center text-white transition-colors"
              id="lightbox-next"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      {photos.length > 1 && (
        <div
          className="shrink-0 px-4 pb-4 flex gap-2 justify-center overflow-x-auto scrollbar-thin"
          onClick={(e) => e.stopPropagation()}
        >
          {photos.map((p, i) => (
            <button
              key={p.id}
              onClick={() => setCurrent(i)}
              className={cn(
                'relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all',
                i === current
                  ? 'border-blue-500 opacity-100 scale-105'
                  : 'border-transparent opacity-50 hover:opacity-80'
              )}
            >
              <Image
                src={p.url}
                alt={p.caption ?? `thumb ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Trigger wrapper (used in gallery grid) ───────────────
interface GalleryProps {
  photos: Photo[]
  startIndex?: number
  className?: string
  children: React.ReactNode
}

export function PhotoTrigger({ photos, startIndex = 0, className, children }: GalleryProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={cn('group relative cursor-zoom-in', className)}
      >
        {children}
        {/* Zoom hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-inherit">
          <ZoomIn className="w-6 h-6 text-white drop-shadow" />
        </div>
      </button>

      {open && (
        <PhotoLightbox
          photos={photos}
          initialIndex={startIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
