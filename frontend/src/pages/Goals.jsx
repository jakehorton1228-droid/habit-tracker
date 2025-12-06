import { useState, useEffect, useRef } from 'react'
import { goalsAPI } from '../services/api'
import { goalCategories } from '../utils/constants'
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

function GoalCard({ goal, category, progress, onAddProgress, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const current = Number(goal.current_value)
  const target = Number(goal.target_value)
  const percent = target > 0 ? Math.round((current / target) * 100) : 0

  const daysLeft = goal.end_date
    ? Math.ceil((new Date(goal.end_date) - new Date()) / 86400000)
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
            <h4 className="m-0 font-semibold text-base">{goal.name}</h4>
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

      <ProgressBar current={current} target={target} color={category?.color || '#a855f7'} />

      <div className="flex items-center justify-between mt-3">
        <div className="text-sm text-muted">
          {current} / {target} {goal.unit}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onAddProgress(goal.id, -1)}
            className="w-8 h-8 rounded-lg bg-white/5 border-white/10 text-muted hover:bg-white/10 hover:text-text text-sm"
          >
            −
          </button>
          <button
            onClick={() => onAddProgress(goal.id, 1)}
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
        {expanded ? '▲ Hide details' : `▼ Show details (${progress.length} entries)`}
      </button>

      {expanded && (
        <>
          <div className="space-y-2 mt-4">
            <div className="text-xs text-muted uppercase tracking-wide mb-2">Progress History</div>
            {progress.length === 0 ? (
              <p className="text-sm text-muted">No progress entries yet</p>
            ) : (
              progress.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5"
                >
                  <span className="text-sm">{p.note || 'Progress update'}</span>
                  <span className="text-xs text-muted">+{p.amount} on {p.date}</span>
                </div>
              ))
            )}
          </div>
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

function GoalForm({ onAdd, onCancel, loading }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('personal')
  const [targetValue, setTargetValue] = useState('')
  const [unit, setUnit] = useState('')
  const [endDate, setEndDate] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !targetValue) return

    onAdd({
      name: name.trim(),
      description: description.trim(),
      target_value: targetValue,
      unit: unit.trim() || 'units',
      end_date: endDate || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-muted mb-1.5">Goal title *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
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
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 text-text focus:outline-none focus:border-accent-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-muted mb-1.5">Target value *</label>
          <input
            type="number"
            value={targetValue}
            onChange={(e) => setTargetValue(e.target.value)}
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

      <div className="flex gap-2 justify-end pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-transparent border-white/10 text-muted hover:bg-white/5 hover:text-text"
        >
          Cancel
        </button>
        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Goal'}
        </button>
      </div>
    </form>
  )
}

export default function Goals() {
  const [goals, setGoals] = useState([])
  const [progress, setProgress] = useState([])
  const [loading, setLoading] = useState(true)
  const [formLoading, setFormLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const toast = useToast()
  const previousState = useRef(null)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [goalsRes, progressRes] = await Promise.all([
        goalsAPI.list(),
        goalsAPI.listProgress(),
      ])
      setGoals(goalsRes.data || [])
      setProgress(progressRes.data || [])
      setError(null)
    } catch (err) {
      console.error('Failed to load goals:', err.response?.data || err.message || err)
      setError('Failed to load goals')
      toast.error('Failed to load goals')
    } finally {
      setLoading(false)
    }
  }

  async function handleAddProgress(goalId, amount) {
    const goal = goals.find(g => g.id === goalId)
    const newValue = Math.max(0, Math.min(Number(goal.target_value), Number(goal.current_value) + amount))

    if (newValue === Number(goal.current_value)) return

    previousState.current = { goals: [...goals], progress: [...progress] }

    try {
      // Create progress entry
      const progressRes = await goalsAPI.createProgress({
        goal: goalId,
        amount: String(Math.abs(amount)),
        note: amount > 0 ? 'Added progress' : 'Removed progress',
      })

      // Update goal current value
      await goalsAPI.update(goalId, { ...goal, current_value: String(newValue) })

      setGoals(goals.map(g => g.id === goalId ? { ...g, current_value: String(newValue) } : g))
      setProgress([...progress, progressRes.data])

      const message = amount > 0
        ? `+${amount} ${goal.unit} added to "${goal.name}"`
        : `${amount} ${goal.unit} from "${goal.name}"`

      toast.success(message, {
        onUndo: async () => {
          await goalsAPI.deleteProgress(progressRes.data.id)
          await goalsAPI.update(goalId, { ...goal, current_value: goal.current_value })
          loadData()
          toast.info('Change undone')
        },
      })
    } catch (err) {
      toast.error('Failed to update progress')
    }
  }

  async function handleAdd(goalData) {
    setFormLoading(true)
    try {
      const response = await goalsAPI.create(goalData)
      setGoals([response.data, ...goals])
      setShowForm(false)
      toast.success(`Goal "${goalData.name}" created`, {
        onUndo: async () => {
          await goalsAPI.delete(response.data.id)
          setGoals(g => g.filter(goal => goal.id !== response.data.id))
          toast.info('Goal removed')
        },
      })
    } catch (err) {
      toast.error('Failed to create goal')
    } finally {
      setFormLoading(false)
    }
  }

  async function handleDelete(goalId) {
    const goal = goals.find(g => g.id === goalId)
    try {
      await goalsAPI.delete(goalId)
      setGoals(goals.filter(g => g.id !== goalId))
      setProgress(progress.filter(p => p.goal !== goalId))
      toast.success(`Goal "${goal.name}" deleted`)
    } catch (err) {
      toast.error('Failed to delete goal')
    }
  }

  const completedGoals = goals.filter(g => Number(g.current_value) >= Number(g.target_value)).length
  const totalProgress = goals.length > 0
    ? Math.round(goals.reduce((sum, g) => sum + (Number(g.current_value) / Number(g.target_value)) * 100, 0) / goals.length)
    : 0

  if (loading) {
    return (
      <section className="p-6 max-w-[900px] mx-auto">
        <div className="text-center text-muted">Loading goals...</div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="p-6 max-w-[900px] mx-auto">
        <div className="text-center text-error">{error}</div>
        <button onClick={loadData} className="mt-4 mx-auto block">
          Retry
        </button>
      </section>
    )
  }

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
          const goalProgress = progress.filter(p => p.goal === goal.id)
          return (
            <GoalCard
              key={goal.id}
              goal={goal}
              category={category}
              progress={goalProgress}
              onAddProgress={handleAddProgress}
              onDelete={handleDelete}
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
        <GoalForm onAdd={handleAdd} onCancel={() => setShowForm(false)} loading={formLoading} />
      </Modal>
    </section>
  )
}
