import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'

const createSchema = z.object({
  projectId: z.string(),
  name:      z.string().min(1, 'Nama pekerjaan wajib diisi'),
  order:     z.number().optional(),
})

// POST /api/jadwal/task — add task row
export async function POST(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = createSchema.parse(body)

    const task = await prisma.task.create({
      data: {
        projectId: parsed.projectId,
        name:      parsed.name,
        order:     parsed.order ?? 0,
      },
    })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[POST /api/jadwal/task]', err)
    return NextResponse.json({ error: 'Gagal membuat task' }, { status: 500 })
  }
}
