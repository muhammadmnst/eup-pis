'use client'

import { useState, useMemo, useEffect } from 'react'
import { DayStatus } from '@prisma/client'
import { DAY_STATUS_CONFIG, cn } from '@/lib/utils'
import { Plus, Trash2, GripVertical, Save, Loader2, CalendarDays, RefreshCw, LayoutGrid, List as ListIcon } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────
interface ScheduleEntry {
  dayNumber: number
  date: string
  dayStatus: DayStatus
  note?: string | null
}

interface Task {
  id: string
  name: string
  order: number
  schedule: ScheduleEntry[]
}

interface Props {
  projectId: string
  startDate: string | null
  initialTasks: Task[]
}

// ─── Constants ────────────────────────────────────────────
const STATUS_CYCLE: DayStatus[] = ['EMPTY', 'WORK', 'REST', 'TROUBLE', 'CUSTOM1', 'CUSTOM2']
const BULAN_FULL  = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember']
const HARI_SHORT  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab']

function nextStatus(s: DayStatus): DayStatus {
  return STATUS_CYCLE[(STATUS_CYCLE.indexOf(s) + 1) % STATUS_CYCLE.length]
}

// ─── Structures ───────────────────────────────────────────
interface DayCol {
  dayNumber: number
  date: Date
  dateStr: string
  dayOfMonth: number
  dayOfWeek: string
  monthKey: string    // "2026-01"
  monthLabel: string  // "Januari 2026"
  isWeekend: boolean
  weekNumber: number
}

interface MonthBlock {
  key: string
  label: string
  days: DayCol[]
}

interface WeekBlock {
  key: string     // "W1"
  label: string   // "W1"
  days: DayCol[]
}

function buildDays(startDateStr: string, count: number): DayCol[] {
  const base = new Date(startDateStr)
  let currentWeekNum = 1
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    const dow = d.getDay()
    const m   = d.getMonth()
    const y   = d.getFullYear()
    
    const dayCol = {
      dayNumber:  i + 1,
      date:       d,
      dateStr:    d.toISOString().split('T')[0],
      dayOfMonth: d.getDate(),
      dayOfWeek:  HARI_SHORT[dow],
      monthKey:   `${y}-${String(m + 1).padStart(2, '0')}`,
      monthLabel: `${BULAN_FULL[m]} ${y}`,
      isWeekend:  dow === 0 || dow === 6,
      weekNumber: currentWeekNum
    }
    
    // Asumsi: minggu berganti setiap hari Senin (index 1)
    if (dow === 1 && i > 0) {
      currentWeekNum++
    }
    
    return dayCol
  })
}

function groupByMonth(days: DayCol[]): MonthBlock[] {
  const map = new Map<string, MonthBlock>()
  for (const d of days) {
    if (!map.has(d.monthKey)) map.set(d.monthKey, { key: d.monthKey, label: d.monthLabel, days: [] })
    map.get(d.monthKey)!.days.push(d)
  }
  return Array.from(map.values())
}

function groupByWeek(days: DayCol[]): WeekBlock[] {
  const map = new Map<number, WeekBlock>()
  for (const d of days) {
    if (!map.has(d.weekNumber)) map.set(d.weekNumber, { key: `W${d.weekNumber}`, label: `Minggu ${d.weekNumber}`, days: [] })
    map.get(d.weekNumber)!.days.push(d)
  }
  return Array.from(map.values())
}

// ─── Main Component ───────────────────────────────────────
export function JadwalEditor({ projectId, startDate, initialTasks }: Props) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [baseDate, setBaseDate] = useState(startDate?.slice(0, 10) ?? new Date().toISOString().slice(0, 10))
  
  // Hitung end date default (1 tahun dari baseDate jika belum ada)
  const defaultEndDate = useMemo(() => {
    const d = new Date(baseDate)
    d.setFullYear(d.getFullYear() + 1)
    return d.toISOString().slice(0, 10)
  }, [baseDate])

  const [targetEndDate, setTargetEndDate] = useState(defaultEndDate)
  const [saving, setSaving] = useState(false)
  const [newTaskName, setNewTaskName] = useState('')
  const [savingTask, setSavingTask] = useState(false)
  
  // UI States
  const [activeMonth, setActiveMonth] = useState<string>('')
  const [viewMode, setViewMode] = useState<'DAILY' | 'WEEKLY'>('DAILY')

  // Tanggal mass-fill per task temporer
  const [taskFillDates, setTaskFillDates] = useState<Record<string, { start: string, end: string }>>({})

  // Hitung total hari dari start ke end
  const calculatedDayCount = useMemo(() => {
    const startObj = new Date(baseDate)
    const endObj = new Date(targetEndDate)
    if (isNaN(startObj.getTime()) || isNaN(endObj.getTime())) return 30
    const diffTime = endObj.getTime() - startObj.getTime()
    return Math.max(7, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1)
  }, [baseDate, targetEndDate])

  const days = useMemo(() => buildDays(baseDate, calculatedDayCount), [baseDate, calculatedDayCount])
  const months = useMemo(() => groupByMonth(days), [days])
  const weeks = useMemo(() => groupByWeek(days), [days])

  // Set default active tab
  useEffect(() => {
    if (months.length > 0 && !months.find(m => m.key === activeMonth)) {
      setActiveMonth(months[0].key)
    }
  }, [months, activeMonth])

  // ── Toggle Single Cell ────────────────────────────────
  function toggleCell(taskId: string, dayNumber: number, dateStr: string) {
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      const existing = t.schedule.find((s) => s.dayNumber === dayNumber)
      if (existing) {
        return { ...t, schedule: t.schedule.map((s) =>
          s.dayNumber === dayNumber ? { ...s, dayStatus: nextStatus(s.dayStatus) } : s
        )}
      }
      return { ...t, schedule: [...t.schedule, { dayNumber, date: dateStr, dayStatus: 'WORK' }] }
    }))
  }

  // ── Toggle Week (Satu Minggu Sekaligus) ───────────────
  function toggleWeek(taskId: string, weekDays: DayCol[]) {
    // Cek mayoritas status di minggu ini
    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      let newSchedule = [...t.schedule]
      
      const isMostlyWork = weekDays.some(d => {
        const s = newSchedule.find(x => x.dayNumber === d.dayNumber)
        return s && s.dayStatus !== 'EMPTY'
      })

      const targetStatus: DayStatus = isMostlyWork ? 'EMPTY' : 'WORK'

      for (const d of weekDays) {
        const existIdx = newSchedule.findIndex(s => s.dayNumber === d.dayNumber)
        if (existIdx >= 0) {
          newSchedule[existIdx] = { ...newSchedule[existIdx], dayStatus: targetStatus }
        } else {
          newSchedule.push({ dayNumber: d.dayNumber, date: d.dateStr, dayStatus: targetStatus })
        }
      }
      return { ...t, schedule: newSchedule }
    }))
  }

  // ── Mass Fill (By Range) ──────────────────────────────
  function applyMassFill(taskId: string) {
    const range = taskFillDates[taskId]
    if (!range?.start || !range?.end) return alert('Tentukan tanggal mulai dan selesai untuk isi otomatis.')

    const startObj = new Date(range.start)
    const endObj = new Date(range.end)
    
    // Cari semua dayNumber di dalam range tersebut
    const daysInRange = days.filter(d => {
      const dObj = new Date(d.dateStr)
      return dObj >= startObj && dObj <= endObj
    })

    if (daysInRange.length === 0) return alert('Tidak ada tanggal jadwal di dalam rentang tersebut.')

    setTasks((prev) => prev.map((t) => {
      if (t.id !== taskId) return t
      let newSchedule = [...t.schedule]
      
      daysInRange.forEach(d => {
        // Abaikan weekend secara otomatis untuk mass fill
        if (d.isWeekend) return 

        const existIdx = newSchedule.findIndex(s => s.dayNumber === d.dayNumber)
        if (existIdx >= 0) {
          newSchedule[existIdx] = { ...newSchedule[existIdx], dayStatus: 'WORK' }
        } else {
          newSchedule.push({ dayNumber: d.dayNumber, date: d.dateStr, dayStatus: 'WORK' })
        }
      })
      return { ...t, schedule: newSchedule }
    }))
    
    // Clear the inputs
    setTaskFillDates(prev => {
       const next = {...prev}
       delete next[taskId]
       return next
    })
  }

  // ── API Actions ───────────────────────────────────────
  async function addTask() {
    if (!newTaskName.trim()) return
    setSavingTask(true)
    const res = await fetch('/api/jadwal/task', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectId, name: newTaskName.trim(), order: tasks.length }),
    })
    setSavingTask(false)
    if (res.ok) {
      const task = await res.json()
      setTasks((prev) => [...prev, { ...task, schedule: [] }])
      setNewTaskName('')
    }
  }

  async function deleteTask(taskId: string) {
    if (!confirm('Hapus baris pekerjaan ini?')) return
    const res = await fetch(`/api/jadwal/task/${taskId}`, { method: 'DELETE' })
    if (res.ok) setTasks((prev) => prev.filter((t) => t.id !== taskId))
  }

  async function saveAll() {
    if (!baseDate) return alert('Pilih tanggal mulai terlebih dahulu')
    setSaving(true)
    const payload = tasks.map((t) => ({
      taskId: t.id,
      schedule: days.map((d) => ({
        dayNumber: d.dayNumber,
        date:      d.dateStr,
        dayStatus: t.schedule.find((s) => s.dayNumber === d.dayNumber)?.dayStatus ?? 'EMPTY',
      })),
    }))
    const res = await fetch('/api/jadwal', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ projectId, tasks: payload }),
    })
    setSaving(false)
    if (!res.ok) alert('Gagal menyimpan jadwal. Coba lagi.')
    else alert('Jadwal berhasil disimpan!')
  }

  const currentMonthData = months.find(m => m.key === activeMonth)

  return (
    <div className="space-y-6">

      {/* ── 1. Smart Duration Controls ─── */}
      <div className="card p-5 border border-slate-700/50 bg-slate-900/40">
        <div className="flex flex-col lg:flex-row gap-5 items-start lg:items-end justify-between">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="label text-slate-400">Dimulai Pada</label>
              <input type="date" value={baseDate}
                onChange={(e) => setBaseDate(e.target.value)}
                className="input w-44" id="jadwal-start-date" />
            </div>
            <div>
              <label className="label text-slate-400">Target Selesai (Batas Kalender)</label>
              <input type="date" value={targetEndDate}
                onChange={(e) => setTargetEndDate(e.target.value)}
                className="input w-44" id="jadwal-end-date" />
            </div>
            <div className="text-sm font-mono text-slate-500 mb-2.5 px-2 py-1 bg-slate-800/50 rounded">
              Total Kalender: {calculatedDayCount} Hari
            </div>
          </div>
          
          <button onClick={saveAll} disabled={saving} className="btn-primary gap-2" id="btn-save-jadwal">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Menyimpan...</>
              : <><Save className="w-4 h-4" /> Simpan Database</>}
          </button>
        </div>
      </div>

      {/* ── 2. Top Bar: Zoom Level & Legend ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-1">
        {/* Zoom Toggle */}
        <div className="flex p-1 bg-slate-800 border border-slate-700 rounded-lg">
          <button 
            onClick={() => setViewMode('DAILY')}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'DAILY' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
          >
            <LayoutGrid className="w-4 h-4" /> Harian
          </button>
          <button 
            onClick={() => setViewMode('WEEKLY')}
            className={cn("flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all", viewMode === 'WEEKLY' ? "bg-blue-600 text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
          >
            <ListIcon className="w-4 h-4" /> Mingguan (Helicopter View)
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {STATUS_CYCLE.filter((s) => s !== 'EMPTY').map((s) => {
            const cfg = DAY_STATUS_CONFIG[s]
            return (
              <div key={s} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className={cn('w-5 h-5 rounded flex items-center justify-center font-bold border text-[10px]', cfg.bg, cfg.text, cfg.border)}>
                  {cfg.short}
                </span>
                {cfg.label}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Empty state ─── */}
      {days.length === 0 && (
        <div className="card p-10 text-center text-slate-500 bg-slate-900/30">
          <CalendarDays className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>Kalender belum tersedia, periksa kembali range tanggal.</p>
        </div>
      )}

      {/* ── 3. Monthly Tab Bar & Matrix View ─── */}
      {days.length > 0 && viewMode === 'DAILY' && (
        <div className="card border-slate-700/60 overflow-hidden bg-slate-900 shadow-xl">
          {/* Tabs */}
          <div className="flex overflow-x-auto scrollbar-hide border-b border-slate-700/80 bg-slate-800">
            {months.map(m => (
              <button
                key={m.key}
                onClick={() => setActiveMonth(m.key)}
                className={cn(
                  "px-5 py-3 text-sm font-medium whitespace-nowrap transition-all border-b-2",
                  activeMonth === m.key 
                    ? "border-blue-500 text-blue-400 bg-blue-900/20" 
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/50"
                )}
              >
                {m.label} <span className="ml-1.5 text-[10px] bg-slate-700/50 px-1.5 py-0.5 rounded-full text-slate-400">{m.days.length} hari</span>
              </button>
            ))}
          </div>

          {/* Table Container with Sticky Column */}
          {currentMonthData && (
            <div className="overflow-x-auto scrollbar-thin max-h-[65vh]">
              <table className="text-xs border-collapse min-w-full relative">
                <thead className="sticky top-0 z-20">
                  <tr className="bg-slate-800">
                    <th className="sticky left-0 z-30 bg-slate-800 px-4 py-2 text-left text-slate-300 min-w-[280px] border-b border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                      Daftar Pekerjaan
                    </th>
                    {currentMonthData.days.map((d) => (
                      <th key={d.dayNumber}
                        className={cn(
                          'px-0 py-1 text-center min-w-[34px] text-[10px] font-normal border-b border-slate-700/50',
                          d.isWeekend ? 'text-red-400' : 'text-slate-400'
                        )}>
                        {d.dayOfWeek}
                      </th>
                    ))}
                  </tr>
                  <tr className="bg-slate-800/90 shadow-sm border-b-2 border-slate-700/80">
                    <th className="sticky left-0 z-30 bg-slate-800/95 text-xs text-slate-500 px-4 py-1.5 text-left border-b border-r border-slate-700 font-normal">
                      Range & Aksi
                    </th>
                    {currentMonthData.days.map((d) => (
                      <th key={d.dayNumber}
                        className={cn(
                          'px-0 py-1.5 text-center text-[11px] font-bold border-b border-slate-700',
                          d.isWeekend ? 'text-red-400 bg-red-900/10' : 'text-slate-200'
                        )}>
                        {d.dayOfMonth}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800/50">
                  {tasks.map((task) => {
                    const schedMap = new Map(task.schedule.map((s) => [s.dayNumber, s]))
                    const currentFill = taskFillDates[task.id] || { start: '', end: '' }
                    
                    return (
                      <tr key={task.id} className="group hover:bg-slate-800/30 transition-colors">
                        
                        {/* Sticky Name Column & Mass Fill */}
                        <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-3 py-2 border-r border-slate-700/80 align-top shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                          <div className="flex flex-col gap-2">
                             <div className="flex items-center gap-1.5">
                                <GripVertical className="w-3.5 h-3.5 text-slate-600 shrink-0 cursor-grab" />
                                <span className="text-slate-200 font-medium whitespace-normal leading-tight text-sm">
                                  {task.name}
                                </span>
                             </div>
                             {/* Mini Mass Fill UI */}
                             <div className="pl-5 flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity focus-within:opacity-100">
                                <input 
                                   type="date" 
                                   className="h-6 text-[10px] bg-slate-800 border-slate-700 rounded text-slate-300 w-24 px-1" 
                                   value={currentFill.start} 
                                   onChange={(e) => setTaskFillDates(p => ({...p, [task.id]: { start: e.target.value, end: currentFill.end }}))}
                                   title="Tgl Mulai Task"
                                />
                                <span className="text-slate-600">-</span>
                                <input 
                                   type="date" 
                                   className="h-6 text-[10px] bg-slate-800 border-slate-700 rounded text-slate-300 w-24 px-1" 
                                   value={currentFill.end} 
                                   onChange={(e) => setTaskFillDates(p => ({...p, [task.id]: { start: currentFill.start, end: e.target.value }}))}
                                   title="Tgl Selesai Task"
                                />
                                <button 
                                   onClick={() => applyMassFill(task.id)}
                                   className="h-6 w-6 ml-1 flex items-center justify-center bg-blue-600 hover:bg-blue-500 rounded text-white shrink-0" 
                                   title="Isi otomatis hari kerja (abaikan libur)"
                                >
                                   <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button onClick={() => deleteTask(task.id)} className="h-6 w-6 ml-auto flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-950 rounded shrink-0">
                                   <Trash2 className="w-3.5 h-3.5" />
                                </button>
                             </div>
                          </div>
                        </td>

                        {/* Daily Toggle Cells */}
                        {currentMonthData.days.map((d) => {
                          const entry  = schedMap.get(d.dayNumber)
                          const status = entry?.dayStatus ?? 'EMPTY'
                          const cfg    = DAY_STATUS_CONFIG[status]
                          return (
                            <td key={d.dayNumber} className={cn('p-0.5 text-center align-middle', d.isWeekend && 'bg-red-950/20')}>
                              <button
                                onClick={() => toggleCell(task.id, d.dayNumber, d.dateStr)}
                                title={`${task.name} — ${d.dayOfWeek} ${d.dayOfMonth}: ${cfg.label}`}
                                className={cn(
                                  'w-[26px] h-9 mx-auto flex items-center justify-center rounded-sm border text-[10px] font-bold',
                                  'transition-all duration-100 hover:scale-110 hover:ring-1 hover:ring-white/50 shadow-sm',
                                  cfg.bg, cfg.text, cfg.border,
                                  status === 'EMPTY' && d.isWeekend && 'opacity-20',
                                  status === 'EMPTY' && !d.isWeekend && 'opacity-40 border-slate-700/50 bg-slate-800'
                                )}>
                                {cfg.short}
                              </button>
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── 3. Weekly Matrix View (Helicopter View) ─── */}
      {days.length > 0 && viewMode === 'WEEKLY' && (
        <div className="card border-slate-700/60 overflow-hidden bg-slate-900 shadow-xl p-4">
           <div className="mb-4 flex gap-2 items-center text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg text-sm">
             <CalendarDays className="w-4 h-4 shrink-0" />
             <p>Mode Mingguan ditujukan untuk memindai jadwal 1 tahun dengan cepat. Klik kolom minggu untuk mengisi status secara serentak.</p>
           </div>
           
           <div className="overflow-x-auto scrollbar-thin max-h-[65vh]">
              <table className="text-xs border-collapse min-w-full relative">
                 <thead className="sticky top-0 z-20">
                    <tr className="bg-slate-800 shadow-sm border-b-2 border-slate-700/80">
                       <th className="sticky left-0 z-30 bg-slate-800 px-4 py-3 text-left text-slate-300 min-w-[200px] border-r border-slate-700 shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                         Daftar Pekerjaan
                       </th>
                       {weeks.map((w) => (
                         <th key={w.key} className="px-2 py-3 text-center min-w-[45px] text-[11px] font-bold border-r border-slate-700/50 text-slate-300" title={`${w.days[0]?.dateStr} s.d. ${w.days[w.days.length-1]?.dateStr}`}>
                           {w.label}
                         </th>
                       ))}
                    </tr>
                 </thead>
                 <tbody className="bg-slate-900 divide-y divide-slate-800/50">
                    {tasks.map((task) => {
                       // Map set hari dari task
                       const schedSet = new Set(task.schedule.filter(s => s.dayStatus !== 'EMPTY').map(s => s.dayNumber))
                       
                       return (
                         <tr key={task.id} className="group hover:bg-slate-800/30">
                            <td className="sticky left-0 z-10 bg-slate-900 group-hover:bg-slate-800 px-3 py-2 border-r border-slate-700/80 align-center shadow-[2px_0_5px_rgba(0,0,0,0.1)]">
                               <span className="text-slate-200 font-medium line-clamp-2" title={task.name}>{task.name}</span>
                            </td>
                            {weeks.map((w) => {
                               // Check if any day in this week has status
                               const hasWork = w.days.some(d => schedSet.has(d.dayNumber))
                               return (
                                 <td key={w.key} className="p-1 text-center border-r border-slate-800/40">
                                   <button
                                     onClick={() => toggleWeek(task.id, w.days)}
                                     title={`Toggle ${w.label}`}
                                     className={cn(
                                       'w-full h-8 mx-auto flex items-center justify-center rounded-sm transition-all',
                                       hasWork 
                                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/40' 
                                          : 'bg-slate-800/40 border border-slate-700 hover:bg-slate-700'
                                     )}>
                                     {hasWork && <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                                   </button>
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
      )}

      {/* ── 4. Add task form ─── */}
      {days.length > 0 && (
        <div className="card p-4 flex gap-3 bg-slate-800/50">
          <input
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addTask()}
            placeholder="Ketik nama pekerjaan baru... (Tekan Enter untuk menambah)"
            className="input flex-1 border-slate-700" id="input-new-task"
          />
          <button onClick={addTask} disabled={savingTask || !newTaskName.trim()}
            className="btn-primary gap-2 w-44" id="btn-add-task">
            {savingTask
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <><Plus className="w-4 h-4" /> Tambah Baris</>}
          </button>
        </div>
      )}

    </div>
  )
}
