import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Status } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const updateSchema = z.object({
  name:           z.string().min(1).optional(),
  position:       z.string().nullable().optional(),
  startDate:      z.string().nullable().optional(),
  pic:            z.string().nullable().optional(),
  vendor:         z.string().nullable().optional(),
  vendorPhone:    z.string().nullable().optional(),
  address:        z.string().nullable().optional(),
  noSpr:          z.string().nullable().optional(),
  correlatedDate: z.string().nullable().optional(),
  status:         z.nativeEnum(Status).optional(),
  progress:       z.number().min(0).max(100).optional(),
  remark:         z.string().nullable().optional(),
})

// GET /api/proyek/[id]
export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      photos: { orderBy: [{ isCover: 'desc' }, { order: 'asc' }] },
      tasks:  { orderBy: { order: 'asc' }, include: { schedule: { orderBy: { dayNumber: 'asc' } } } },
      statusHistory: { orderBy: { changedAt: 'desc' }, take: 20 },
    },
  })
  if (!project) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })
  return NextResponse.json(project)
}

// PUT /api/proyek/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body   = await req.json()
    const parsed = updateSchema.parse(body)

    const existing = await prisma.project.findUnique({
      where: { id: params.id },
      select: { status: true },
    })
    if (!existing) return NextResponse.json({ error: 'Tidak ditemukan' }, { status: 404 })

    const statusChanged = parsed.status && parsed.status !== existing.status

    const project = await prisma.project.update({
      where: { id: params.id },
      data: {
        ...parsed,
        startDate:      parsed.startDate      ? new Date(parsed.startDate)      : undefined,
        correlatedDate: parsed.correlatedDate ? new Date(parsed.correlatedDate) : undefined,
        ...(statusChanged && {
          statusHistory: {
            create: {
              oldStatus: existing.status,
              newStatus: parsed.status!,
              note: `Status diubah ke ${parsed.status}`,
              changedBy: 'admin',
            },
          },
        }),
      },
    })

    return NextResponse.json(project)
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[PUT /api/proyek/[id]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui project' }, { status: 500 })
  }
}

// DELETE /api/proyek/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Delete uploaded photos from disk
    const photos = await prisma.photo.findMany({ where: { projectId: params.id } })
    for (const photo of photos) {
      const filePath = path.join(process.cwd(), 'public', photo.url)
      await fs.unlink(filePath).catch(() => {}) // ignore if not found
    }

    await prisma.project.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/proyek/[id]]', err)
    return NextResponse.json({ error: 'Gagal menghapus project' }, { status: 500 })
  }
}
