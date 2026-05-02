import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'


// POST /api/foto/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const projectId = formData.get('projectId') as string
    if (!projectId) return NextResponse.json({ error: 'projectId diperlukan' }, { status: 400 })

    const files = formData.getAll('files') as File[]
    if (!files.length) return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 })

    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
    const MAX_SIZE = 5 * 1024 * 1024

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', projectId)
    await fs.mkdir(uploadDir, { recursive: true })

    const savedPhotos = []
    const hasCover = await prisma.photo.findFirst({ where: { projectId, isCover: true } })

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!ALLOWED.includes(file.type)) continue
      if (file.size > MAX_SIZE) continue

      const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
      const filename = `${randomUUID()}.${ext}`
      const filePath = path.join(uploadDir, filename)
      const url      = `/uploads/${projectId}/${filename}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      const isCover = !hasCover && i === 0
      const photo = await prisma.photo.create({
        data: { projectId, filename, url, isCover, order: i },
      })
      savedPhotos.push(photo)
    }

    return NextResponse.json({ photos: savedPhotos }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/foto/upload]', err)
    return NextResponse.json({ error: 'Gagal upload foto' }, { status: 500 })
  }
}
