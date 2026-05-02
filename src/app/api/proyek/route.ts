import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { Status } from '@prisma/client'

const projectSchema = z.object({
  name:           z.string().min(1, 'Nama project wajib diisi'),
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

// GET /api/proyek — list all
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q')
  const status = searchParams.get('status')

  const where: Record<string, unknown> = { year: 2026 }
  if (q) {
    where.OR = [
      { name:   { contains: q, mode: 'insensitive' } },
      { vendor: { contains: q, mode: 'insensitive' } },
    ]
  }
  if (status && status !== 'SEMUA') where.status = status

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: 'desc' },
    include: { photos: { where: { isCover: true }, take: 1 } },
  })

  return NextResponse.json(projects)
}

// POST /api/proyek — create
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = projectSchema.parse(body)

    const prevStatus = 'PLANNED' as Status
    const newStatus  = parsed.status ?? 'PLANNED'

    const project = await prisma.project.create({
      data: {
        ...parsed,
        startDate:      parsed.startDate      ? new Date(parsed.startDate)      : null,
        correlatedDate: parsed.correlatedDate ? new Date(parsed.correlatedDate) : null,
        status:         newStatus,
        progress:       parsed.progress ?? 0,
        year:           2026,
        statusHistory: {
          create: {
            newStatus,
            note: 'Project dibuat',
            changedBy: 'admin',
          },
        },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[POST /api/proyek]', err)
    return NextResponse.json({ error: 'Gagal membuat project' }, { status: 500 })
  }
}
