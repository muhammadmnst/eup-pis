import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

// DELETE /api/foto/[id]
export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const photo = await prisma.photo.findUnique({ where: { id: params.id } })
    if (!photo) return NextResponse.json({ error: 'Foto tidak ditemukan' }, { status: 404 })

    const filePath = path.join(process.cwd(), 'public', photo.url)
    await fs.unlink(filePath).catch(() => {})

    await prisma.photo.delete({ where: { id: params.id } })

    // If deleted photo was cover, set next photo as cover
    if (photo.isCover) {
      const next = await prisma.photo.findFirst({
        where: { projectId: photo.projectId },
        orderBy: { order: 'asc' },
      })
      if (next) await prisma.photo.update({ where: { id: next.id }, data: { isCover: true } })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[DELETE /api/foto/[id]]', err)
    return NextResponse.json({ error: 'Gagal menghapus foto' }, { status: 500 })
  }
}
