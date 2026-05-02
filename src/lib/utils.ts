import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { Status, DayStatus } from '@prisma/client'

// ──────────────────────────────────────────
// Tailwind class merger
// ──────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ──────────────────────────────────────────
// Status project — label & warna (Bahasa Indonesia)
// ──────────────────────────────────────────
export const STATUS_CONFIG: Record<
  Status,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  PLANNED: {
    label:  'Direncanakan',
    color:  'text-indigo-300',
    bg:     'bg-indigo-500/20',
    border: 'border-indigo-500/40',
    dot:    'bg-indigo-400',
  },
  ON_PROGRESS: {
    label:  'Sedang Dikerjakan',
    color:  'text-amber-300',
    bg:     'bg-amber-500/20',
    border: 'border-amber-500/40',
    dot:    'bg-amber-400',
  },
  COMPLETED: {
    label:  'Selesai',
    color:  'text-emerald-300',
    bg:     'bg-emerald-500/20',
    border: 'border-emerald-500/40',
    dot:    'bg-emerald-400',
  },
  ON_HOLD: {
    label:  'Ditunda',
    color:  'text-yellow-300',
    bg:     'bg-yellow-500/20',
    border: 'border-yellow-500/40',
    dot:    'bg-yellow-400',
  },
  CANCELLED: {
    label:  'Dibatalkan',
    color:  'text-red-300',
    bg:     'bg-red-500/20',
    border: 'border-red-500/40',
    dot:    'bg-red-400',
  },
}

// ──────────────────────────────────────────
// DayStatus — label & warna untuk Time Schedule
// ──────────────────────────────────────────
export const DAY_STATUS_CONFIG: Record<
  DayStatus,
  { label: string; short: string; bg: string; text: string; border: string }
> = {
  WORK: {
    label:  'Hari Kerja',
    short:  'W',
    bg:     'bg-blue-500',
    text:   'text-white',
    border: 'border-blue-400',
  },
  REST: {
    label:  'Istirahat',
    short:  'R',
    bg:     'bg-yellow-400',
    text:   'text-yellow-900',
    border: 'border-yellow-500',
  },
  TROUBLE: {
    label:  'Kendala',
    short:  'T',
    bg:     'bg-teal-500',
    text:   'text-white',
    border: 'border-teal-400',
  },
  CUSTOM1: {
    label:  'Custom 1',
    short:  'C1',
    bg:     'bg-slate-400',
    text:   'text-slate-900',
    border: 'border-slate-500',
  },
  CUSTOM2: {
    label:  'Custom 2',
    short:  'C2',
    bg:     'bg-stone-500',
    text:   'text-white',
    border: 'border-stone-600',
  },
  EMPTY: {
    label:  '-',
    short:  '',
    bg:     'bg-green-900/60',
    text:   'text-green-300',
    border: 'border-green-800',
  },
}

// ──────────────────────────────────────────
// Format tanggal → Bahasa Indonesia
// ──────────────────────────────────────────
export function formatTanggal(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function formatTanggalPendek(date: Date | string | null | undefined): string {
  if (!date) return '-'
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

// ──────────────────────────────────────────
// Hari dalam seminggu (untuk header jadwal)
// ──────────────────────────────────────────
const HARI = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']

export function namaHari(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return HARI[d.getDay()]
}

// ──────────────────────────────────────────
// Pluralisasi (sederhana)
// ──────────────────────────────────────────
export function pluralProject(n: number): string {
  return `${n} Project`
}

// ──────────────────────────────────────────
// Truncate text
// ──────────────────────────────────────────
export function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
