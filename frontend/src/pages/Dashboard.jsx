import { useState, useEffect } from 'react'
import { habitsAPI, goalsAPI } from '../services/api'
import StatsCard from '../components/dashboard/StatsCard'
import HabitList from '../components/dashboard/HabitList'
import GoalList from '../components/dashboard/GoalList'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import FullCalendarView from '../components/Calendar/FullCalendarView'

export default function Dashboard() {
  const [habits, setHabits] = useState([])
  const [habitLogs, setHabitLogs] = useState([])
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [habitsRes, logsRes, goalsRes] = await Promise.all([
        habitsAPI.list(),
        habitsAPI.listLogs(),
        goalsAPI.list(),
      ])
      setHabits(habitsRes.data.results || habitsRes.data || [])
      setHabitLogs(logsRes.data.results || logsRes.data || [])
      setGoals(goalsRes.data.results || goalsRes.data || [])
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Calculate stats
  const today = new Date().toISOString().slice(0, 10)
  const completedToday = habitLogs.filter((log) => log.date === today).length

  // Calculate best streak (simplified - just count consecutive days with any log)
  const logDates = [...new Set(habitLogs.map((l) => l.date))].sort().reverse()
  let bestStreak = 0
  let currentStreak = 0
  const checkDate = new Date()
  for (const date of logDates) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (date === dateStr) {
      currentStreak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  bestStreak = Math.max(bestStreak, currentStreak)

  // Build habits with doneToday for display
  const habitsForDisplay = habits.map((habit) => {
    const doneToday = habitLogs.some((log) => log.habit === habit.id && log.date === today)
    return {
      ...habit,
      title: habit.name,
      doneToday,
    }
  })

  // Build goals for display
  const goalsForDisplay = goals.map((goal) => ({
    ...goal,
    title: goal.name,
    current: Number(goal.current_value),
    target: Number(goal.target_value),
  }))

  // Build activity from recent logs
  const recentActivity = habitLogs
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10)
    .map((log) => {
      const habit = habits.find((h) => h.id === log.habit)
      return {
        id: log.id,
        type: 'habit',
        text: `Completed "${habit?.name || 'habit'}"`,
        time: new Date(log.created_at).toLocaleString(),
      }
    })

  // Build calendar events from logs
  const calendarEvents = habitLogs.map((log) => {
    const habit = habits.find((h) => h.id === log.habit)
    return {
      id: log.id,
      title: habit?.name || 'Habit',
      date: log.date,
    }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-60px)]">
        <div className="text-muted">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-[1fr_320px] grid-rows-[auto_1fr] gap-6 p-6 min-h-[calc(100vh-60px)] max-md:grid-cols-1">
      <section className="col-span-2 max-md:col-span-1">
        <FullCalendarView events={calendarEvents} />
      </section>

      <section className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <StatsCard title="Total Habits" value={habits.length} />
          <StatsCard title="Completed Today" value={completedToday} />
          <StatsCard title="Current Streak" value={bestStreak} />
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <HabitList items={habitsForDisplay} />
          <GoalList items={goalsForDisplay} />
        </div>
      </section>

      <aside>
        <ActivityFeed items={recentActivity} />
      </aside>
    </div>
  )
}
