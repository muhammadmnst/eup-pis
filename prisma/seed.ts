import { PrismaClient, Status, DayStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database EUP-PIS...')

  // ======================================================
  // 1. Admin default
  // ======================================================
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Admin@EUP2026'
  const hash = await bcrypt.hash(adminPassword, 12)

  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hash,
      name: 'Administrator EUP',
    },
  })
  console.log('✅ Admin seeded: username=admin')

  // ======================================================
  // 2. Sample Projects (dari data Excel)
  // ======================================================
  const projects = [
    {
      id: 'seed-spr-2026-001',
      name: 'ACP Desain Wall 5R',
      position: 'Plant A',
      startDate: new Date('2026-01-18'),
      pic: 'Budi Santoso',
      vendor: 'CV. Maju Bersama',
      vendorPhone: '0812-3456-7890',
      address: 'Jl. Industri No. 12, Bekasi',
      noSpr: 'SPR/2026/001',
      correlatedDate: new Date('2026-02-15'),
      status: Status.ON_PROGRESS,
      progress: 65,
      remark: 'Pekerjaan berjalan sesuai jadwal',
      year: 2026,
    },
    {
      id: 'seed-spr-2026-002',
      name: 'Pembatas Jalan Trotoar',
      position: 'Area Parkir B',
      startDate: new Date('2026-01-18'),
      pic: 'Agus Wijaya',
      vendor: 'PT. Bangunan Prima',
      vendorPhone: '0813-9876-5432',
      address: 'Jl. Raya Plant, Karawang',
      noSpr: 'SPR/2026/002',
      correlatedDate: new Date('2026-02-10'),
      status: Status.ON_PROGRESS,
      progress: 70,
      remark: null,
      year: 2026,
    },
    {
      id: 'seed-spr-2026-003',
      name: 'Pengecoran Parkiran',
      position: 'Parkir Utama',
      startDate: new Date('2026-02-01'),
      pic: 'Hendra Kusuma',
      vendor: 'CV. Citra Konstruksi',
      vendorPhone: '0811-2233-4455',
      address: 'Jl. Industri No. 12, Bekasi',
      noSpr: 'SPR/2026/003',
      correlatedDate: new Date('2026-03-01'),
      status: Status.PLANNED,
      progress: 0,
      remark: 'Menunggu material semen',
      year: 2026,
    },
    {
      id: 'seed-spr-2026-004',
      name: 'Reklame Jalan Plant',
      position: 'Gate Utama',
      startDate: new Date('2026-01-10'),
      pic: 'Siti Rahayu',
      vendor: 'PT. Kreatif Display',
      vendorPhone: '0899-1122-3344',
      address: 'Jl. Gate No. 1, Karawang',
      noSpr: 'SPR/2026/004',
      correlatedDate: new Date('2026-01-31'),
      status: Status.COMPLETED,
      progress: 100,
      remark: 'Selesai tepat waktu',
      year: 2026,
    },
    {
      id: 'seed-spr-2026-005',
      name: 'Pintu Masuk Office Dalam',
      position: 'Office Building',
      startDate: new Date('2026-02-15'),
      pic: 'Dedi Kurniawan',
      vendor: 'CV. Alumindo',
      vendorPhone: '0877-6655-4433',
      address: 'Gedung Office Lt. 1',
      noSpr: 'SPR/2026/005',
      correlatedDate: new Date('2026-03-15'),
      status: Status.PLANNED,
      progress: 0,
      remark: null,
      year: 2026,
    },
  ]

  for (const p of projects) {
    const project = await prisma.project.upsert({
      where: { id: p.id },
      update: {},
      create: { ...p },
    })

    // Status log awal (skip jika sudah ada)
    const existingLog = await prisma.statusLog.findFirst({ where: { projectId: project.id } })
    if (!existingLog) {
      await prisma.statusLog.create({
        data: {
          projectId: project.id,
          newStatus: p.status,
          note: 'Status awal saat import data',
          changedBy: 'system',
        },
      })
    }

    console.log(`✅ Project seeded: ${p.name}`)
  }

  // ======================================================
  // 3. Time Schedule untuk project pertama (ACP Desain Wall 5R)
  // ======================================================
  const acp = await prisma.project.findUnique({ where: { id: 'seed-spr-2026-001' } })
  if (acp) {
    // Hapus task lama dulu jika sudah ada (idempotent)
    await prisma.task.deleteMany({ where: { projectId: acp.id } })

    const tasks = [
      'Persiapan Material',
      'Pemasangan Rangka',
      'Pemasangan ACP',
      'Finishing & Cat',
    ]

    const baseDate = new Date('2026-01-18')
    for (let t = 0; t < tasks.length; t++) {
      const task = await prisma.task.create({
        data: {
          projectId: acp.id,
          name: tasks[t],
          order: t,
        },
      })

      const scheduleData: { taskId: string; date: Date; dayNumber: number; dayStatus: DayStatus }[] = []
      for (let d = 0; d < 14; d++) {
        const date = new Date(baseDate)
        date.setDate(baseDate.getDate() + d)
        const dow = date.getDay()

        let dayStatus: DayStatus = DayStatus.EMPTY
        if (d < t * 2) {
          dayStatus = DayStatus.EMPTY
        } else if (dow === 0) {
          dayStatus = DayStatus.REST
        } else if (dow === 6 && t % 2 === 0) {
          dayStatus = DayStatus.REST
        } else if (d >= t * 2 && d < t * 2 + 7) {
          dayStatus = DayStatus.WORK
        }

        scheduleData.push({ taskId: task.id, date, dayNumber: d + 1, dayStatus })
      }

      await prisma.dailySchedule.createMany({ data: scheduleData, skipDuplicates: true })
    }
    console.log('✅ Time schedule seeded untuk ACP Desain Wall 5R')
  }

  console.log('\n🎉 Seeding selesai!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
