import { useState, useEffect, useRef } from 'react'
import { habitsAPI } from '../services/api'
import { categories } from '../utils/constants'
import Heatmap from '../components/Heatmap'
import CompletionChart from '../components/CompletionChart'
import { useToast } from '../hooks/useToast'

function HabitItem({ habit, category, logs, onToggle, onDelete }) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState('')

  const today = new Date().toISOString().slice(0, 10)
  const todayLog = logs.find((log) => log.date === today)
  const doneToday = !!todayLog

  // Calculate streak from logs
  const sortedDates = [...new Set(logs.map((l) => l.date))].sort().reverse()
  let streak = 0
  const checkDate = new Date()
  for (const date of sortedDates) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (date === dateStr) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else if (date < dateStr) {
      break
    }
  }

  function handleComplete() {
    if (!doneToday) {
      setShowNoteInput(true)
    } else {
      onToggle(habit.id, todayLog.id, null)
    }
  }

  function submitNote(e) {
    e.preventDefault()
    onToggle(habit.id, null, note.trim() || null)
    setNote('')
    setShowNoteInput(false)
  }

  function skipNote() {
    onToggle(habit.id, null, null)
    setNote('')
    setShowNoteInput(false)
  }

  return (
    <li
      className={`flex items-center justify-between gap-4 p-4 rounded-lg border transition-all duration-200 hover:translate-x-1 ${
        doneToday
          ? 'border-success/30 bg-gradient-to-br from-success/[0.08] to-success/[0.02]'
          : 'border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] hover:border-white/10'
      }`}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{ background: category?.color || '#888' }}
            title={category?.name}
          />
          <span className={`font-semibold ${doneToday ? 'line-through opacity-70' : ''}`}>
            {habit.name}
          </span>
          {category && (
            <span
              className="text-[0.7rem] font-semibold uppercase tracking-wide opacity-80"
              style={{ color: category.color }}
            >
              {category.name}
            </span>
          )}
          <button
            onClick={() => onDelete(habit.id)}
            className="ml-2 text-xs text-muted hover:text-error transition-colors"
            title="Delete habit"
          >
            ✕
          </button>
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-accent font-semibold">
            🔥 {streak} day{streak !== 1 ? 's' : ''}
          </span>
          <span className="text-muted">{habit.frequency}</span>
        </div>
      </div>

      {showNoteInput ? (
        <form className="flex items-center gap-2" onSubmit={submitNote}>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note (optional)"
            autoFocus
            className="w-40 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-text text-sm focus:outline-none focus:border-accent-2"
          />
          <button type="submit" className="px-3 py-2 text-sm">Save</button>
          <button
            type="button"
            onClick={skipNote}
            className="px-3 py-2 text-sm bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text"
          >
            Skip
          </button>
        </form>
      ) : (
        <button
          className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${
            doneToday
              ? 'bg-gradient-to-br from-success/20 to-success/10 border-success/30 text-success hover:bg-error/20 hover:border-error/30 hover:text-error'
              : ''
          }`}
          onClick={handleComplete}
        >
          {doneToday ? '✓ Done' : 'Mark Done'}
        </button>
      )}
    </li>
  )
}

function HabitForm({ onAdd, categories }) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState('health')
  const [loading, setLoading] = useState(false)

  async function submit(e) {
    e.preventDefault()
    if (!name.trim() || loading) return
    setLoading(true)
    await onAdd(name.trim(), category)
    setName('')
    setLoading(false)
  }

  return (
    <form className="flex gap-2 mt-3" onSubmit={submit}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New habit"
        className="flex-1 px-3 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-text text-sm focus:outline-none focus:border-accent-2"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="px-3 py-2.5 rounded-lg border border-white/[0.08] text-text text-sm cursor-pointer focus:outline-none focus:border-accent-2"
        style={{ background: 'rgba(15,10,24,0.95)' }}
      >
        {categories.map((c) => (
          <option key={c.id} value={c.id} style={{ background: '#1a1025' }}>
            {c.name}
          </option>
        ))}
      </select>
      <button type="submit" disabled={loading}>
        {loading ? '...' : 'Add'}
      </button>
    </form>
  )
}

export default function Habits() {
  const [habits, setHabits] = useState([])
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const toast = useToast()
  const previousState = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [habitsRes, logsRes] = await Promise.all([
        habitsAPI.list(),
        habitsAPI.listLogs(),
      ])
      setHabits(habitsRes.data || [])
      setLogs(logsRes.data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load habits:', err.response?.data || err.message || err)
      setError('Failed to load habits')
      toast.error('Failed to load habits')
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle(habitId, logId, note) {
    const today = new Date().toISOString().slice(0, 10)

    if (logId) {
      // Undo - delete the log
      previousState.current = { logs: [...logs] }
      try {
        await habitsAPI.deleteLog(logId)
        setLogs((l) => l.filter((log) => log.id !== logId))
        const habit = habits.find((h) => h.id === habitId)
        toast.success(`Unmarked "${habit.name}" as done`, {
          onUndo: async () => {
            await habitsAPI.createLog({ habit: habitId, date: today, note: '' })
            loadData()
            toast.info('Action undone')
          },
        })
      } catch (err) {
        toast.error('Failed to update habit')
      }
    } else {
      // Complete - create a log
      previousState.current = { logs: [...logs] }
      try {
        const response = await habitsAPI.createLog({ habit: habitId, date: today, note: note || '' })
        setLogs((l) => [...l, response.data])
        const habit = habits.find((h) => h.id === habitId)
        toast.success(`Completed "${habit.name}"${note ? ` - ${note}` : ''}`, {
          onUndo: async () => {
            await habitsAPI.deleteLog(response.data.id)
            setLogs((l) => l.filter((log) => log.id !== response.data.id))
            toast.info('Action undone')
          },
        })
      } catch (err) {
        toast.error('Failed to log habit')
      }
    }
  }

  async function handleAdd(name, category) {
    try {
      const response = await habitsAPI.create({ name, category, frequency: 'daily' })
      setHabits((h) => [response.data, ...h])
      toast.success(`Added "${name}"`, {
        onUndo: async () => {
          await habitsAPI.delete(response.data.id)
          setHabits((h) => h.filter((habit) => habit.id !== response.data.id))
          toast.info('Action undone')
        },
      })
    } catch (err) {
      toast.error('Failed to add habit')
    }
  }

  async function handleDelete(habitId) {
    const habit = habits.find((h) => h.id === habitId)
    try {
      await habitsAPI.delete(habitId)
      setHabits((h) => h.filter((item) => item.id !== habitId))
      setLogs((l) => l.filter((log) => log.habit !== habitId))
      toast.success(`Deleted "${habit.name}"`)
    } catch (err) {
      toast.error('Failed to delete habit')
    }
  }

  // Build history for heatmap from logs
  const uniqueDates = [...new Set(logs.map((l) => l.date))].map((date) => ({ date }))

  // Build habits with computed properties for chart
  const habitsWithStats = habits.map((habit) => {
    const habitLogs = logs.filter((l) => l.habit === habit.id)
    const today = new Date().toISOString().slice(0, 10)
    const doneToday = habitLogs.some((l) => l.date === today)
    return {
      ...habit,
      title: habit.name,
      doneToday,
      history: habitLogs.map((l) => ({ date: l.date, note: l.note })),
      streak: habitLogs.length,
    }
  })

  if (loading) {
    return (
      <section className="p-6 max-w-[800px] mx-auto">
        <div className="text-center text-muted">Loading habits...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="p-6 max-w-[800px] mx-auto">
        <div className="text-center text-error">{error}</div>
        <button onClick={loadData} className="mt-4 mx-auto block">
          Retry
        </button>
      </section>
    )
  }

  return (
    <section className="p-6 max-w-[800px] mx-auto">
      <div
        className="p-5 rounded-lg border border-white/[0.06] backdrop-blur-[10px] mb-6 transition-all duration-200 hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          boxShadow: 'var(--soft-shadow), var(--card-glow)',
        }}
      >
        <h3 className="m-0 mb-2 text-base text-accent-2">Manage habits</h3>
        <p className="text-muted m-0 mb-4">Track your daily habits and build streaks.</p>
        <HabitForm onAdd={handleAdd} categories={categories} />
      </div>

      <div className="mb-4">
        <Heatmap history={uniqueDates} color="var(--accent-2)" />
      </div>

      <div className="mb-6">
        <CompletionChart habits={habitsWithStats} />
      </div>

      <div className="flex flex-col gap-3">
        {habits.length === 0 ? (
          <p className="text-center text-muted">No habits yet. Add one above!</p>
        ) : (
          habits.map((habit) => {
            const category = categories.find((c) => c.id === habit.category)
            const habitLogs = logs.filter((l) => l.habit === habit.id)
            return (
              <HabitItem
                key={habit.id}
                habit={habit}
                category={category}
                logs={habitLogs}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            )
          })
        )}
      </div>
    </section>
  )
}
