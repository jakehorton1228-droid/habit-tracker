import { useState } from 'react'
import '../components/dashboard/dashboard.css'
import '../components/nav.css'
import { habits as initialHabits } from '../utils/mockData'

function HabitItem({ h, onToggle }) {
  return (
    <li className={h.doneToday ? 'done' : ''}>
      <div>
        <div className="habit-title">{h.title}</div>
        <div className="habit-meta">Streak: {h.streak}</div>
      </div>
      <div>
        <button onClick={() => onToggle(h.id)}>{h.doneToday ? 'Undo' : 'Done'}</button>
      </div>
    </li>
  )
}

function HabitForm({ onAdd }) {
  const [title, setTitle] = useState('')
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New habit" style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit' }} />
      <button type="submit">Add</button>
    </form>
  )
}

export default function Habits() {
  const [list, setList] = useState(initialHabits)

  function handleToggle(id) {
    setList((l) => l.map((h) => (h.id === id ? { ...h, doneToday: !h.doneToday, streak: h.doneToday ? Math.max(0, h.streak - 1) : h.streak + 1 } : h)))
  }

  function handleAdd(title) {
    const id = Math.max(0, ...list.map((i) => i.id)) + 1
    setList((l) => [{ id, title, streak: 0, doneToday: false }, ...l])
  }

  return (
    <section style={{ padding: '1.25rem' }}>
      <h2>Habits</h2>
      <div className="stats-card" style={{ marginBottom: '1rem' }}>
        <h3>Manage habits</h3>
        <p className="stats-sub">Quickly mark a habit done or add a new one.</p>
        <HabitForm onAdd={handleAdd} />
      </div>

      <div className="habit-list">
        <ul>
          {list.map((h) => (
            <HabitItem key={h.id} h={h} onToggle={handleToggle} />
          ))}
        </ul>
      </div>
    </section>
  )
}
