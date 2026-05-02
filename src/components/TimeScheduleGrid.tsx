import { cn, DAY_STATUS_CONFIG, namaHari } from '@/lib/utils'
import { DayStatus } from '@prisma/client'

interface ScheduleTask {
  id: string
  name: string
  order: number
  schedule: Array<{
    dayNumber: number
    date: string | Date
    dayStatus: DayStatus
    note?: string | null
  }>
}

interface Props {
  tasks: ScheduleTask[]
  className?: string
}

// ─── Group days by Year-Month ─────────────────────────────
interface DayCol {
  dayNumber: number
  date: Date
  dayOfMonth: number  // 1-31
  dayOfWeek: string   // Sen, Sel...
  monthKey: string    // "2026-01"
}

interface MonthGroup {
  key: string
  label: string   // "Januari 2026"
  days: DayCol[]
}

const BULAN = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember'
]

function groupByMonth(days: DayCol[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>()
  for (const d of days) {
    if (!map.has(d.monthKey)) {
      const [y, m] = d.monthKey.split('-').map(Number)
      map.set(d.monthKey, {
        key: d.monthKey,
        label: `${BULAN[m - 1]} ${y}`,
        days: [],
      })
    }
    map.get(d.monthKey)!.days.push(d)
  }
  return Array.from(map.values())
}

const LEGEND_STATUSES: DayStatus[] = ['WORK', 'REST', 'TROUBLE', 'CUSTOM1', 'CUSTOM2']

export function TimeScheduleGrid({ tasks, className }: Props) {
  if (!tasks.length) return null

  // Build sorted day columns
  const allDayMap = new Map<number, DayCol>()
  for (const t of tasks) {
    for (const s of t.schedule) {
      if (!allDayMap.has(s.dayNumber)) {
        const d = new Date(s.date)
        allDayMap.set(s.dayNumber, {
          dayNumber: s.dayNumber,
          date: d,
          dayOfMonth: d.getDate(),
          dayOfWeek: namaHari(d),
          monthKey: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        })
      }
    }
  }

  const allDays = Array.from(allDayMap.values()).sort((a, b) => a.dayNumber - b.dayNumber)
  const months = groupByMonth(allDays)
  const sortedTasks = [...tasks].sort((a, b) => a.order - b.order)

  return (
    <div className={cn('space-y-4', className)}>
      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {LEGEND_STATUSES.map((status) => {
          const cfg = DAY_STATUS_CONFIG[status]
          return (
            <div key={status} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className={cn('w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold border', cfg.bg, cfg.text, cfg.border)}>
                {cfg.short}
              </span>
              {cfg.label}
            </div>
          )
        })}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span className="w-5 h-5 rounded border border-green-800 bg-green-900/60" />
          Tidak ada data
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-700/60">
        <table className="text-xs border-collapse min-w-full">
          {/* ── Row 1: Month headers ── */}
          <thead>
            <tr className="bg-slate-900/90">
              <th
                rowSpan={3}
                className="sticky left-0 z-20 bg-slate-900 px-4 py-3 text-left text-slate-400 font-semibold min-w-[180px] border-b border-r border-slate-700 align-middle"
              >
                Pekerjaan
              </th>
              {months.map((m) => (
                <th
                  key={m.key}
                  colSpan={m.days.length}
                  className="px-2 py-2 text-center text-blue-300 font-bold text-[11px] border-b border-l border-slate-700 bg-blue-900/20"
                >
                  {m.label}
                </th>
              ))}
            </tr>

            {/* ── Row 2: Day of week ── */}
            <tr className="bg-slate-900/80">
              {allDays.map((d) => (
                <th
                  key={d.dayNumber}
                  className="px-0 py-1 text-center border-b border-slate-700/60 min-w-[32px] text-[10px] text-slate-500 font-normal"
                >
                  {d.dayOfWeek}
                </th>
              ))}
            </tr>

            {/* ── Row 3: Day of month ── */}
            <tr className="bg-slate-900/70">
              {allDays.map((d) => (
                <th
                  key={d.dayNumber}
                  className="px-0 py-1.5 text-center border-b border-slate-700 text-[11px] font-bold text-slate-300"
                >
                  {d.dayOfMonth}
                </th>
              ))}
            </tr>
          </thead>

          {/* ── Body: tasks ── */}
          <tbody>
            {sortedTasks.map((task, idx) => {
              const scheduleMap = new Map(task.schedule.map((s) => [s.dayNumber, s]))
              return (
                <tr
                  key={task.id}
                  className={cn(
                    'border-b border-slate-700/40',
                    idx % 2 === 0 ? 'bg-slate-800/40' : 'bg-slate-800/20'
                  )}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-2 text-slate-200 font-medium border-r border-slate-700 whitespace-nowrap">
                    {task.name}
                  </td>
                  {allDays.map((d) => {
                    const entry = scheduleMap.get(d.dayNumber)
                    const status = entry?.dayStatus ?? 'EMPTY'
                    const cfg = DAY_STATUS_CONFIG[status]
                    return (
                      <td key={d.dayNumber} className="p-0.5 text-center">
                        <div
                          title={`${task.name} — ${d.dayOfWeek} ${d.dayOfMonth}: ${cfg.label}`}
                          className={cn(
                            'w-7 h-7 mx-auto flex items-center justify-center text-[10px] font-bold rounded border',
                            cfg.bg, cfg.text, cfg.border
                          )}
                        >
                          {cfg.short}
                        </div>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
