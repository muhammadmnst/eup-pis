import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// PATCH /api/foto/[id]/cover — set as cover photo
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json()
    const { projectId } = body

    // Unset all covers first
    await prisma.photo.updateMany({ where: { projectId }, data: { isCover: false } })

    // Set this as cover
    await prisma.photo.update({ where: { id: params.id }, data: { isCover: true } })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[PATCH /api/foto/[id]/cover]', err)
    return NextResponse.json({ error: 'Gagal mengatur cover' }, { status: 500 })
  }
}
