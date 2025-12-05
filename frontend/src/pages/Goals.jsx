import { useState, useRef } from 'react'
import { goals as initialGoals, goalCategories } from '../utils/mockData'
import { useToast } from '../hooks/useToast'
import Modal from '../components/Modal'

function ProgressBar({ current, target, color }) {
  const percent = Math.min(100, Math.round((current / target) * 100))
  return (
    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{
          width: `${percent}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          boxShadow: `0 0 10px ${color}50`,
        }}
      />
    </div>
  )
}

function MilestoneList({ milestones, current, onToggle, color }) {
  return (
    <div className="space-y-2 mt-4">
      <div className="text-xs text-muted uppercase tracking-wide mb-2">Milestones</div>
      {milestones.map((m) => {
        const reached = current >= m.target
        return (
          <div
            key={m.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
              reached ? 'bg-white/5' : 'opacity-60'
            }`}
          >
            <button
              onClick={() => onToggle(m.id)}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                m.completed
                  ? 'border-transparent text-white text-xs'
                  : 'border-white/30 hover:border-white/50'
              }`}
              style={m.completed ? { background: color } : undefined}
            >
              {m.completed && '✓'}
            </button>
            <span className={`text-sm flex-1 ${m.completed ? 'line-through opacity-70' : ''}`}>
              {m.title}
            </span>
            <span className="text-xs text-muted">{m.target}</span>
          </div>
        )
      })}
    </div>
  )
}

function GoalCard({ goal, category, onUpdate, onDelete, onUpdateMilestone }) {
  const [expanded, setExpanded] = useState(false)
  const percent = Math.round((goal.current / goal.target) * 100)

  const daysLeft = goal.deadline
    ? Math.ceil((new Date(goal.deadline) - new Date()) / 86400000)
    : null

  return (
    <div
      className="p-5 rounded-xl border border-white/5 transition-all duration-200 hover:border-white/10"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <span
            className="w-10 h-10 rounded-lg flex items-center justify-center text-lg"
            style={{ background: `${category?.color}20` }}
          >
            {category?.icon}
          </span>
          <div>
            <h4 className="m-0 font-semibold text-base">{goal.title}</h4>
            <span className="text-xs text-muted">{category?.name}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold" style={{ color: category?.color }}>
            {percent}%
          </div>
          {daysLeft !== null && (
            <div className={`text-xs ${daysLeft < 7 ? 'text-warning' : 'text-muted'}`}>
              {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today' : 'Overdue'}
            </div>
          )}
        </div>
      </div>

      <ProgressBar current={goal.current} target={goal.target} color={category?.color || '#a855f7'} />

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-muted">
          {goal.current} / {goal.target} {goal.unit}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(goal.id, Math.max(0, goal.current - 1))}
            className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:text-text text-sm"
          >
            −
          </button>
          <button
            onClick={() => onUpdate(goal.id, Math.min(goal.target, goal.current + 1))}
            className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:text-text text-sm"
          >
            +
          </button>
        </div>
      </div>

      {goal.description && (
        <p className="text-sm text-muted mt-3 leading-relaxed">{goal.description}</p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-3 py-2 text-xs text-muted bg-transparent border-0 hover:text-text"
      >
        {expanded ? '▲ Hide milestones' : `▼ Show milestones (${goal.milestones.filter(m => m.completed).length}/${goal.milestones.length})`}
      </button>

      {expanded && (
        <>
          <MilestoneList
            milestones={goal.milestones}
            current={goal.current}
            onToggle={(milestoneId) => onUpdateMilestone(goal.id, milestoneId)}
            color={category?.color || '#a855f7'}
          />
          <div className="flex justify-end mt-4 pt-3 border-t border-white/5">
            <button
              onClick={() => onDelete(goal.id)}
              className="px-3 py-1.5 text-xs bg-transparent border-white/10 text-error hover:bg-error/20"
            >
              Delete Goal
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function GoalForm({ onAdd, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [target, setTarget] = useState('')
  const [unit, setUnit] = useState('')
  const [deadline, setDeadline] = useState('')
  const [milestones, setMilestones] = useState([])
  const [newMilestone, setNewMilestone] = useState({ title: '', target: '' })

  function addMilestone() {
    if (!newMilestone.title.trim() || !newMilestone.target) return
    setMilestones([...milestones, {
      id: Date.now(),
      title: newMilestone.title.trim(),
      target: Number(newMilestone.target),
      completed: false,
    }])
    setNewMilestone({ title: '', target: '' })
  }

  function removeMilestone(id) {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim() || !target) return

    const goal = {
      id: Date.now(),
      title: title.trim(),
      description: description.trim(),
      category,
      current: 0,
      target: Number(target),
      unit: unit.trim() || 'units',
      deadline: deadline || null,
      createdAt: new Date().toISOString().slice(0, 10),
      milestones: milestones.length > 0 ? milestones : [
        { id: 1, title: 'Goal complete!', target: Number(target), completed: false }
      ],
    }

    onAdd(goal)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-muted mb-1.5">Goal title *</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you want to achieve?"
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text focus:outline-none focus:border-accent-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm text-muted mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Why is this goal important to you?"
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text resize-none focus:outline-none focus:border-accent-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 text-text cursor-pointer focus:outline-none focus:border-accent-2"
            style={{ background: 'rgba(15,10,24,0.95)' }}
          >
            {goalCategories.map((c) => (
              <option key={c.id} value={c.id} style={{ background: '#1a1025' }}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Deadline (optional)</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text focus:outline-none focus:border-accent-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1.5">Target value *</label>
          <input
            type="number"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            placeholder="e.g. 100"
            min="1"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text focus:outline-none focus:border-accent-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm text-muted mb-1.5">Unit</label>
          <input
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            placeholder="e.g. miles, books, dollars"
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text focus:outline-none focus:border-accent-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-muted mb-1.5">Milestones (optional)</label>
        <div className="space-y-2">
          {milestones.map((m) => (
            <div key={m.id} className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
              <span className="flex-1 text-sm">{m.title}</span>
              <span className="text-xs text-muted">{m.target}</span>
              <button
                type="button"
                onClick={() => removeMilestone(m.id)}
                className="w-6 h-6 rounded bg-transparent border-0 text-muted hover:text-error text-sm"
              >
                ×
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <input
              value={newMilestone.title}
              onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
              placeholder="Milestone name"
              className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-text text-sm focus:outline-none focus:border-accent-2"
            />
            <input
              type="number"
              value={newMilestone.target}
              onChange={(e) => setNewMilestone({ ...newMilestone, target: e.target.value })}
              placeholder="At"
              min="1"
              className="w-20 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-text text-sm focus:outline-none focus:border-accent-2"
            />
            <button
              type="button"
              onClick={addMilestone}
              className="px-3 py-2 text-sm bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:text-text"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text"
        >
          Cancel
        </button>
        <button type="submit">Create Goal</button>
      </div>
    </form>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals)
  const [showForm, setShowForm] = useState(false)
  const toast = useToast()
  const previousState = useRef(null)

  function handleUpdate(id, newCurrent) {
    const goal = goals.find(g => g.id === id)
    previousState.current = [...goals]

    setGoals(goals.map(g => {
      if (g.id !== id) return g
      const updatedMilestones = g.milestones.map(m => ({
        ...m,
        completed: newCurrent >= m.target,
      }))
      return { ...g, current: newCurrent, milestones: updatedMilestones }
    }))

    const delta = newCurrent - goal.current
    const message = delta > 0
      ? `+${delta} ${goal.unit} added to "${goal.title}"`
      : `${delta} ${goal.unit} from "${goal.title}"`

    toast.success(message, {
      onUndo: () => {
        if (previousState.current) {
          setGoals(previousState.current)
          toast.info('Change undone')
        }
      },
    })
  }

  function handleAdd(goal) {
    previousState.current = [...goals]
    setGoals([goal, ...goals])
    setShowForm(false)
    toast.success(`Goal "${goal.title}" created`, {
      onUndo: () => {
        if (previousState.current) {
          setGoals(previousState.current)
          toast.info('Goal removed')
        }
      },
    })
  }

  function handleDelete(id) {
    const goal = goals.find(g => g.id === id)
    previousState.current = [...goals]
    setGoals(goals.filter(g => g.id !== id))
    toast.success(`Goal "${goal.title}" deleted`, {
      onUndo: () => {
        if (previousState.current) {
          setGoals(previousState.current)
          toast.info('Goal restored')
        }
      },
    })
  }

  function handleUpdateMilestone(goalId, milestoneId) {
    previousState.current = [...goals]
    setGoals(goals.map(g => {
      if (g.id !== goalId) return g
      return {
        ...g,
        milestones: g.milestones.map(m =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        ),
      }
    }))
  }

  const completedGoals = goals.filter(g => g.current >= g.target).length
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (g.current / g.target) * 100, 0) / goals.length)
    : 0

  return (
    <section className="p-6 max-w-[900px] mx-auto">
      <div
        className="p-5 rounded-lg border border-white/[0.06] backdrop-blur-[10px] mb-6"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
          boxShadow: 'var(--soft-shadow), var(--card-glow)',
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="m-0 mb-1 text-base text-accent-2">Your Goals</h3>
            <p className="text-muted m-0 text-sm">
              {goals.length} goals · {completedGoals} completed · {totalProgress}% average progress
            </p>
          </div>
          <button onClick={() => setShowForm(true)}>New Goal</button>
        </div>

        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <div className="text-2xl font-bold text-accent">{goals.length}</div>
            <div className="text-xs text-muted">Total Goals</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <div className="text-2xl font-bold text-success">{completedGoals}</div>
            <div className="text-xs text-muted">Completed</div>
          </div>
          <div className="p-4 rounded-lg bg-white/5 text-center">
            <div className="text-2xl font-bold text-accent-2">{totalProgress}%</div>
            <div className="text-xs text-muted">Avg Progress</div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {goals.map((goal) => {
          const category = goalCategories.find(c => c.id === goal.category)
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              category={category}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onUpdateMilestone={handleUpdateMilestone}
            />
          )
        })}
      </div>

      {goals.length === 0 && (
        <div className="text-center py-12 text-muted">
          <p className="text-lg mb-2">No goals yet</p>
          <p className="text-sm">Create your first goal to start tracking progress.</p>
        </div>
      )}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Create New Goal">
        <GoalForm onAdd={handleAdd} onCancel={() => setShowForm(false)} />
      </Modal>
    </section>
  )
}
