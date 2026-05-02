import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'

// DELETE /api/dokumen/[id]
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const doc = await prisma.document.findUnique({ where: { id: params.id } })
    if (!doc) return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 })

    const filePath = path.join(process.cwd(), 'public', 'uploads', doc.projectId, 'docs', doc.filename)
    await fs.unlink(filePath).catch(() => {})

    await prisma.document.delete({ where: { id: params.id } })

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DELETE /api/dokumen]', err)
    return NextResponse.json({ error: 'Gagal menghapus dokumen' }, { status: 500 })
  }
}
