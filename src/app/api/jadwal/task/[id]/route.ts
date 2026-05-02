import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// DELETE /api/jadwal/task/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.task.delete({ where: { id: params.id } })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/jadwal/task/[id]]', err)
    return NextResponse.json({ error: 'Gagal menghapus task' }, { status: 500 })
  }
}

// PUT /api/jadwal/task/[id] — rename task
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { name, order } = await req.json()
    const task = await prisma.task.update({
      where: { id: params.id },
      data: { ...(name && { name }), ...(order !== undefined && { order }) },
    })
    return NextResponse.json(task)
  } catch (err) {
    console.error('[PUT /api/jadwal/task/[id]]', err)
    return NextResponse.json({ error: 'Gagal memperbarui task' }, { status: 500 })
  }
}
