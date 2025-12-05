import { useState, useRef } from 'react'
import { habits as initialHabits, categories } from '../utils/mockData'
import Heatmap from '../components/Heatmap'
import CompletionChart from '../components/CompletionChart'
import { useToast } from '../hooks/useToast'

function HabitItem({ h, category, onToggle }) {
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [note, setNote] = useState('')

  function handleComplete() {
    if (!h.doneToday) {
      setShowNoteInput(true)
    } else {
      onToggle(h.id, null)
    }
  }

  function submitNote(e) {
    e.preventDefault()
    onToggle(h.id, note.trim() || null)
    setNote('')
    setShowNoteInput(false)
  }

  function skipNote() {
    onToggle(h.id, null)
    setNote('')
    setShowNoteInput(false)
  }

  return (
    <li
      className={`flex items-center justify-between gap-4 p-4 rounded-lg border transition-all duration-200 hover:translate-x-1 ${
        h.doneToday
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
          <span className={`font-semibold ${h.doneToday ? 'line-through opacity-70' : ''}`}>
            {h.title}
          </span>
          {category && (
            <span
              className="text-[0.7rem] font-semibold uppercase tracking-wide opacity-80"
              style={{ color: category.color }}
            >
              {category.name}
            </span>
          )}
        </div>
        <div className="flex gap-4 text-sm">
          <span className="text-accent font-semibold">
            🔥 {h.streak} day{h.streak !== 1 ? 's' : ''}
          </span>
          <span className="text-muted">Best: {h.bestStreak}</span>
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
            h.doneToday
              ? 'bg-gradient-to-br from-success/20 to-success/10 border-success/30 text-success hover:bg-error/20 hover:border-error/30 hover:text-error'
              : ''
          }`}
          onClick={handleComplete}
        >
          {h.doneToday ? '✓ Done' : 'Mark Done'}
        </button>
      )}
    </li>
  )
}

function HabitForm({ onAdd, categories }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('health')

  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim(), category)
    setTitle('')
  }

  return (
    <form className="flex gap-2 mt-3" onSubmit={submit}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
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
      <button type="submit">Add</button>
    </form>
  )
}

export default function Habits() {
  const [list, setList] = useState(initialHabits)
  const toast = useToast()
  const previousState = useRef(null)

  function handleToggle(id, note) {
    const today = new Date().toISOString().slice(0, 10)
    const habit = list.find((h) => h.id === id)
    const wasDone = habit.doneToday

    previousState.current = { id, list: [...list] }

    setList((l) => l.map((h) => {
      if (h.id !== id) return h
      const newHistory = wasDone
        ? h.history.filter((entry) => entry.date !== today)
        : [...h.history, { date: today, note }]
      return {
        ...h,
        doneToday: !wasDone,
        streak: wasDone ? Math.max(0, h.streak - 1) : h.streak + 1,
        history: newHistory,
      }
    }))

    const message = wasDone
      ? `Unmarked "${habit.title}" as done`
      : `Completed "${habit.title}"${note ? ` - ${note}` : ''}`

    toast.success(message, {
      onUndo: () => {
        if (previousState.current) {
          setList(previousState.current.list)
          toast.info('Action undone')
        }
      },
    })
  }

  function handleAdd(title, category) {
    const id = Math.max(0, ...list.map((i) => i.id)) + 1
    const newHabit = {
      id,
      title,
      category,
      streak: 0,
      bestStreak: 0,
      doneToday: false,
      history: [],
    }

    previousState.current = { id, list: [...list] }

    setList((l) => [newHabit, ...l])

    toast.success(`Added "${title}"`, {
      onUndo: () => {
        if (previousState.current) {
          setList(previousState.current.list)
          toast.info('Action undone')
        }
      },
    })
  }

  const allHistory = list.flatMap((h) => h.history)
  const uniqueDates = [...new Set(allHistory.map((h) => h.date))].map((date) => ({ date }))

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
        <CompletionChart habits={list} />
      </div>

      <div className="flex flex-col gap-3">
        {list.map((h) => {
          const category = categories.find((c) => c.id === h.category)
          return (
            <HabitItem
              key={h.id}
              h={h}
              category={category}
              onToggle={handleToggle}
            />
          )
        })}
      </div>
    </section>
  )
}
