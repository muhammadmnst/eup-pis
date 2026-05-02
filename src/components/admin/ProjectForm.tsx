'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Status } from '@prisma/client'
import { STATUS_CONFIG } from '@/lib/utils'
import { Save, Loader2 } from 'lucide-react'

interface ProjectFormData {
  id?: string
  name?: string
  position?: string
  startDate?: string
  pic?: string
  vendor?: string
  vendorPhone?: string
  address?: string
  noSpr?: string
  correlatedDate?: string
  status?: Status
  progress?: number
  remark?: string
}

interface Props {
  initialData?: ProjectFormData
  mode: 'create' | 'edit'
}

const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, cfg]) => ({
  value,
  label: cfg.label,
}))

export function ProjectForm({ initialData, mode }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(initialData?.progress ?? 0)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const fd = new FormData(e.currentTarget)
    const payload = {
      name:          fd.get('name'),
      position:      fd.get('position') || null,
      startDate:     fd.get('startDate') || null,
      pic:           fd.get('pic') || null,
      vendor:        fd.get('vendor') || null,
      vendorPhone:   fd.get('vendorPhone') || null,
      address:       fd.get('address') || null,
      noSpr:         fd.get('noSpr') || null,
      correlatedDate:fd.get('correlatedDate') || null,
      status:        fd.get('status'),
      progress:      Number(fd.get('progress')),
      remark:        fd.get('remark') || null,
    }

    const url    = mode === 'create' ? '/api/proyek' : `/api/proyek/${initialData!.id}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    setLoading(false)

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      setError(data.error ?? 'Terjadi kesalahan. Coba lagi.')
      return
    }

    const result = await res.json()

    const files = fd.getAll('files') as File[]
    const validFiles = files.filter(f => f.size > 0 && f.name)
    if (validFiles.length > 0) {
      const uploadFd = new FormData()
      uploadFd.append('projectId', result.id ?? initialData!.id)
      validFiles.forEach(f => uploadFd.append('files', f))

      await fetch('/api/foto/upload', {
        method: 'POST',
        body: uploadFd,
      })
    }

    const docs = fd.getAll('docs') as File[]
    const validDocs = docs.filter(f => f.size > 0 && f.name)
    if (validDocs.length > 0) {
      const uploadDocFd = new FormData()
      uploadDocFd.append('projectId', result.id ?? initialData!.id)
      validDocs.forEach(f => uploadDocFd.append('files', f))

      await fetch('/api/dokumen/upload', {
        method: 'POST',
        body: uploadDocFd,
      })
    }

    router.push(`/admin/proyek/${result.id ?? initialData!.id}/edit`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {error && (
        <div className="px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ─── Info Dasar ─── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Informasi Dasar
        </h2>

        <Field label="Nama Project *" htmlFor="name">
          <input
            id="name"
            name="name"
            required
            defaultValue={initialData?.name}
            className="input"
            placeholder="Contoh: ACP Desain Wall 5R"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="NO/SPR" htmlFor="noSpr">
            <input id="noSpr" name="noSpr" defaultValue={initialData?.noSpr ?? ''} className="input" placeholder="SPR/2026/001" />
          </Field>
          <Field label="Posisi / Plant" htmlFor="position">
            <input id="position" name="position" defaultValue={initialData?.position ?? ''} className="input" placeholder="Plant A" />
          </Field>
        </div>

        <Field label="Alamat" htmlFor="address">
          <textarea
            id="address"
            name="address"
            defaultValue={initialData?.address ?? ''}
            className="input min-h-[80px] resize-none"
            placeholder="Jl. Industri No. 12, Bekasi"
          />
        </Field>
      </section>

      {/* ─── PIC & Vendor ─── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          PIC & Vendor
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="PIC (Penanggung Jawab)" htmlFor="pic">
            <input id="pic" name="pic" defaultValue={initialData?.pic ?? ''} className="input" placeholder="Nama PIC" />
          </Field>
          <Field label="Vendor / Pelaksana" htmlFor="vendor">
            <input id="vendor" name="vendor" defaultValue={initialData?.vendor ?? ''} className="input" placeholder="Nama vendor" />
          </Field>
          <Field label="No. Telepon Vendor" htmlFor="vendorPhone">
            <input id="vendorPhone" name="vendorPhone" type="tel" defaultValue={initialData?.vendorPhone ?? ''} className="input" placeholder="0812-3456-7890" />
          </Field>
        </div>
      </section>

      {/* ─── Jadwal & Status ─── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Jadwal & Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tanggal Mulai" htmlFor="startDate">
            <input
              id="startDate" name="startDate" type="date"
              defaultValue={initialData?.startDate?.slice(0, 10) ?? ''}
              className="input"
            />
          </Field>
          <Field label="Tanggal Korelasi / Selesai" htmlFor="correlatedDate">
            <input
              id="correlatedDate" name="correlatedDate" type="date"
              defaultValue={initialData?.correlatedDate?.slice(0, 10) ?? ''}
              className="input"
            />
          </Field>
          <Field label="Status Pengerjaan" htmlFor="status">
            <select
              id="status" name="status"
              defaultValue={initialData?.status ?? 'PLANNED'}
              className="input"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Progress slider */}
        <Field label={`Progress: ${progress}%`} htmlFor="progress">
          <input
            id="progress" name="progress" type="range"
            min={0} max={100} step={5}
            value={progress}
            onChange={(e) => setProgress(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </Field>
      </section>

      {/* ─── Keterangan ─── */}
      <section className="card p-6 space-y-5">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Keterangan</h2>
        <Field label="Remark / Keterangan" htmlFor="remark">
          <textarea
            id="remark" name="remark"
            defaultValue={initialData?.remark ?? ''}
            className="input min-h-[100px] resize-none"
            placeholder="Catatan tambahan..."
          />
        </Field>
      </section>

      {/* ─── Upload Foto ─── */}
      {mode === 'create' && (
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Upload Foto</h2>
          <Field label="Pilih Foto Progress/Lokasi (Max 5MB)" htmlFor="files">
            <input
              id="files" name="files" type="file" multiple accept="image/*"
              className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
            />
          </Field>
        </section>
      )}

      {/* ─── Upload Dokumen ─── */}
      {mode === 'create' && (
        <section className="card p-6 space-y-5">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Upload Dokumen</h2>
          <Field label="Pilih Dokumen Pendukung (PDF, Word, Excel - Max 10MB)" htmlFor="docs">
            <input
              id="docs" name="docs" type="file" multiple accept=".pdf,.doc,.docx,.xls,.xlsx"
              className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-500/10 file:text-blue-400 hover:file:bg-blue-500/20 cursor-pointer"
            />
          </Field>
        </section>
      )}

      {/* ─── Submit ─── */}
      <div className="flex gap-3">
        <button type="submit" id="btn-save-project" disabled={loading} className="btn-primary gap-2">
          {loading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
            : <><Save className="w-4 h-4" /> {mode === 'create' ? 'Simpan Project' : 'Perbarui Project'}</>
          }
        </button>
        <button type="button" onClick={() => router.back()} className="btn-secondary">
          Batal
        </button>
      </div>
    </form>
  )
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="label">{label}</label>
      {children}
    </div>
  )
}
