import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'


// POST /api/dokumen/upload
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const projectId = formData.get('projectId') as string
    if (!projectId) return NextResponse.json({ error: 'projectId diperlukan' }, { status: 400 })

    const files = formData.getAll('files') as File[]
    if (!files.length) return NextResponse.json({ error: 'Tidak ada file' }, { status: 400 })

    const ALLOWED = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ]
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB

    // Create upload directory
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', projectId, 'docs')
    await fs.mkdir(uploadDir, { recursive: true })

    const savedDocs = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      if (!ALLOWED.includes(file.type)) continue
      if (file.size > MAX_SIZE) continue

      const ext      = file.name.split('.').pop()?.toLowerCase() ?? 'pdf'
      const filename = `${randomUUID()}.${ext}`
      const filePath = path.join(uploadDir, filename)
      const url      = `/uploads/${projectId}/docs/${filename}`

      const buffer = Buffer.from(await file.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      const doc = await prisma.document.create({
        data: { 
          projectId, 
          filename, 
          url,
          title: file.name
        },
      })
      savedDocs.push(doc)
    }

    return NextResponse.json({ documents: savedDocs }, { status: 201 })
  } catch (err) {
    console.error('[POST /api/dokumen/upload]', err)
    return NextResponse.json({ error: 'Gagal upload dokumen' }, { status: 500 })
  }
}
