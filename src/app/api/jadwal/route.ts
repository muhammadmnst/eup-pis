import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { DayStatus } from '@prisma/client'

const saveSchema = z.object({
  projectId: z.string(),
  tasks: z.array(z.object({
    taskId: z.string(),
    schedule: z.array(z.object({
      dayNumber: z.number(),
      date: z.string(),
      dayStatus: z.nativeEnum(DayStatus),
    })),
  })),
})

// PUT /api/jadwal — bulk save all schedule entries
export async function PUT(req: NextRequest) {
  try {
    const body   = await req.json()
    const parsed = saveSchema.parse(body)

    for (const task of parsed.tasks) {
      for (const entry of task.schedule) {
        await prisma.dailySchedule.upsert({
          where: { taskId_date: { taskId: task.taskId, date: new Date(entry.date) } },
          update: { dayStatus: entry.dayStatus, dayNumber: entry.dayNumber },
          create: {
            taskId:    task.taskId,
            date:      new Date(entry.date),
            dayNumber: entry.dayNumber,
            dayStatus: entry.dayStatus,
          },
        })
      }
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 })
    }
    console.error('[PUT /api/jadwal]', err)
    return NextResponse.json({ error: 'Gagal menyimpan jadwal' }, { status: 500 })
  }
}

// GET /api/jadwal?projectId=xxx
export async function GET(req: NextRequest) {
  const projectId = new URL(req.url).searchParams.get('projectId')
  if (!projectId) return NextResponse.json({ error: 'projectId diperlukan' }, { status: 400 })

  const tasks = await prisma.task.findMany({
    where: { projectId },
    orderBy: { order: 'asc' },
    include: { schedule: { orderBy: { dayNumber: 'asc' } } },
  })

  return NextResponse.json(tasks)
}
