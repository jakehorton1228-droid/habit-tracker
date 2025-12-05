import { useState, useRef } from 'react'
import { journalEntries as initialEntries, journalPrompts, moodOptions } from '../utils/mockData'
import { useToast } from '../hooks/useToast'

function MoodSelector({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {moodOptions.map((mood) => (
        <button
          key={mood.id}
          type="button"
          onClick={() => onChange(mood.id)}
          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border transition-all duration-200 ${
            value === mood.id
              ? 'border-accent-2 bg-accent-2/20 scale-105'
              : 'border-white/10 bg-white/5 hover:bg-white/10'
          }`}
          title={mood.label}
        >
          <span className="text-xl">{mood.emoji}</span>
          <span className="text-xs text-muted">{mood.label}</span>
        </button>
      ))}
    </div>
  )
}

function JournalForm({ onAdd, onCancel }) {
  const [mode, setMode] = useState('freeform')
  const [mood, setMood] = useState('good')
  const [content, setContent] = useState('')
  const [responses, setResponses] = useState({})

  function handleSubmit(e) {
    e.preventDefault()

    if (mode === 'freeform' && !content.trim()) return
    if (mode === 'prompted' && Object.values(responses).every((v) => !v.trim())) return

    const now = new Date()
    const entry = {
      id: Date.now(),
      date: now.toISOString().slice(0, 10),
      time: now.toTimeString().slice(0, 5),
      type: mode,
      mood,
      ...(mode === 'freeform' ? { content: content.trim() } : { responses }),
    }

    onAdd(entry)
    setContent('')
    setResponses({})
    setMood('good')
  }

  function handleResponseChange(promptId, value) {
    setResponses((prev) => ({ ...prev, [promptId]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode('freeform')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'freeform'
              ? 'bg-gradient-to-r from-accent to-accent-2 text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          Free Write
        </button>
        <button
          type="button"
          onClick={() => setMode('prompted')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === 'prompted'
              ? 'bg-gradient-to-r from-accent to-accent-2 text-white'
              : 'bg-white/5 text-muted hover:bg-white/10'
          }`}
        >
          Guided Prompts
        </button>
      </div>

      <div>
        <label className="block text-sm text-muted mb-2">How are you feeling?</label>
        <MoodSelector value={mood} onChange={setMood} />
      </div>

      {mode === 'freeform' ? (
        <div>
          <label className="block text-sm text-muted mb-2">What's on your mind?</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write freely about your day, thoughts, or anything else..."
            rows={5}
            className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-text text-sm resize-none focus:outline-none focus:border-accent-2"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {journalPrompts.map((prompt) => (
            <div key={prompt.id}>
              <label className="flex items-center gap-2 text-sm text-muted mb-2">
                <span>{prompt.icon}</span>
                <span>{prompt.label}</span>
              </label>
              <textarea
                value={responses[prompt.id] || ''}
                onChange={(e) => handleResponseChange(prompt.id, e.target.value)}
                placeholder="..."
                rows={2}
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-white/5 text-text text-sm resize-none focus:outline-none focus:border-accent-2"
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 justify-end pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text"
          >
            Cancel
          </button>
        )}
        <button type="submit">Save Entry</button>
      </div>
    </form>
  )
}

function JournalEntry({ entry, onDelete }) {
  const moodData = moodOptions.find((m) => m.id === entry.mood)
  const [expanded, setExpanded] = useState(false)

  return (
    <div
      className="p-4 rounded-lg border border-white/5 transition-all duration-200 hover:border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl" title={moodData?.label}>{moodData?.emoji}</span>
          <div>
            <div className="text-sm text-muted">
              {entry.time} · {entry.type === 'prompted' ? 'Guided Entry' : 'Free Write'}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(entry.id)}
          className="px-2 py-1 text-xs bg-transparent border-white/10 text-muted hover:bg-error/20 hover:text-error hover:border-error/30"
        >
          Delete
        </button>
      </div>

      <div className="mt-3">
        {entry.type === 'freeform' ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{entry.content}</p>
        ) : (
          <div className="space-y-3">
            {journalPrompts.map((prompt) => {
              const response = entry.responses?.[prompt.id]
              if (!response) return null
              return (
                <div key={prompt.id}>
                  <div className="flex items-center gap-1.5 text-xs text-accent-2 mb-1">
                    <span>{prompt.icon}</span>
                    <span>{prompt.label}</span>
                  </div>
                  <p className="text-sm leading-relaxed">{response}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function groupEntriesByDate(entries) {
  const groups = {}
  entries.forEach((entry) => {
    if (!groups[entry.date]) {
      groups[entry.date] = []
    }
    groups[entry.date].push(entry)
  })

  // Sort entries within each day by time (newest first)
  Object.keys(groups).forEach((date) => {
    groups[date].sort((a, b) => b.time.localeCompare(a.time))
  })

  // Return sorted by date (newest first)
  return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a))
}

function formatDateHeader(dateStr) {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  const yesterday = new Date(today.getTime() - 86400000)

  if (dateStr === today.toISOString().slice(0, 10)) return 'Today'
  if (dateStr === yesterday.toISOString().slice(0, 10)) return 'Yesterday'

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  })
}

export default function Journal() {
  const [entries, setEntries] = useState(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const toast = useToast()
  const previousState = useRef(null)

  function handleAdd(entry) {
    previousState.current = [...entries]
    setEntries((prev) => [entry, ...prev])
    setShowForm(false)
    toast.success('Journal entry saved', {
      onUndo: () => {
        if (previousState.current) {
          setEntries(previousState.current)
          toast.info('Entry removed')
        }
      },
    })
  }

  function handleDelete(id) {
    const entry = entries.find((e) => e.id === id)
    previousState.current = [...entries]
    setEntries((prev) => prev.filter((e) => e.id !== id))
    toast.success('Entry deleted', {
      onUndo: () => {
        if (previousState.current) {
          setEntries(previousState.current)
          toast.info('Entry restored')
        }
      },
    })
  }

  const groupedEntries = groupEntriesByDate(entries)

  return (
    <section className="p-6 max-w-[800px] mx-auto">
      <div
        className="p-5 rounded-lg border border-white/[0.06] backdrop-blur-[10px] mb-6 transition-all duration-200"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          boxShadow: 'var(--soft-shadow), var(--card-glow)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="m-0 mb-1 text-base text-accent-2">Daily Journal</h3>
            <p className="text-muted m-0 text-sm">Reflect on your day, track your mood, and build self-awareness.</p>
          </div>
          {!showForm && (
            <button onClick={() => setShowForm(true)}>New Entry</button>
          )}
        </div>

        {showForm && (
          <JournalForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
        )}
      </div>

      <div className="space-y-6">
        {groupedEntries.map(([date, dayEntries]) => (
          <div key={date}>
            <h4 className="text-sm font-semibold text-accent-2 mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-2" />
              {formatDateHeader(date)}
              <span className="text-muted font-normal">({dayEntries.length} {dayEntries.length === 1 ? 'entry' : 'entries'})</span>
            </h4>
            <div className="space-y-3">
              {dayEntries.map((entry) => (
                <JournalEntry key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          </div>
        ))}

        {entries.length === 0 && (
          <div className="text-center py-12 text-muted">
            <p className="text-lg mb-2">No journal entries yet</p>
            <p className="text-sm">Start writing to track your thoughts and mood.</p>
          </div>
        )}
      </div>
    </section>
  )
}
