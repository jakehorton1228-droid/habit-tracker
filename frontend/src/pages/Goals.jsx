import { useState } from 'react'
import '../components/dashboard/dashboard.css'
import { goals as initialGoals } from '../utils/mockData'

function GoalItem({ g, onUpdate }) {
  function inc(delta) {
    onUpdate(g.id, Math.max(0, Math.min(100, g.progress + delta)))
  }
  return (
    <li>
      <div>
        <div className="goal-title">{g.title}</div>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <div className="goal-meta">{g.progress}%</div>
        <button onClick={() => inc(5)}>+5</button>
      </div>
    </li>
  )
}

function GoalForm({ onAdd }) {
  const [title, setTitle] = useState('')
  function submit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd(title.trim())
    setTitle('')
  }
  return (
    <form onSubmit={submit} style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New goal" style={{ flex: 1, padding: '0.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)', background: 'transparent', color: 'inherit' }} />
      <button type="submit">Add</button>
    </form>
  )
}

export default function Goals() {
  const [list, setList] = useState(initialGoals)

  function handleUpdate(id, progress) {
    setList((l) => l.map((g) => (g.id === id ? { ...g, progress } : g)))
  }

  function handleAdd(title) {
    const id = Math.max(0, ...list.map((i) => i.id)) + 1
    setList((l) => [{ id, title, progress: 0 }, ...l])
  }

  return (
    <section style={{ padding: '1.25rem' }}>
      <h2>Goals</h2>
      <div className="stats-card" style={{ marginBottom: '1rem' }}>
        <h3>Your goals</h3>
        <p className="stats-sub">Progress is kept locally for now.</p>
        <GoalForm onAdd={handleAdd} />
      </div>

      <div className="goal-list">
        <ul>
          {list.map((g) => (
            <GoalItem key={g.id} g={g} onUpdate={handleUpdate} />
          ))}
        </ul>
      </div>
    </section>
  )
}
