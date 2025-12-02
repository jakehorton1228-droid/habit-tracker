import { stats as mockStats, habits as mockHabits, goals as mockGoals, activity as mockActivity } from '../utils/mockData'
import StatsCard from '../components/dashboard/StatsCard'
import HabitList from '../components/dashboard/HabitList'
import GoalList from '../components/dashboard/GoalList'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import '../components/dashboard/dashboard.css'
import FullCalendarView from '../components/Calendar/FullCalendarView'

export default function Dashboard() {
  return (
    <div className="dashboard">
      <section>
        <h2>Dashboard</h2>
        <div className="dashboard-grid">
          <StatsCard title="Total Habits" value={mockStats.totalHabits} />
          <StatsCard title="Completed Today" value={mockStats.completedToday} />
          <StatsCard title="Best Streak" value={mockStats.streakBest} />
          <div className="stats-card">
            <h3>Quick Actions</h3>
            <p>Coming soon: add habit, mark complete, bulk edit.</p>
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <HabitList items={mockHabits} />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3>Calendar</h3>
          <FullCalendarView />
        </div>

      </section>

      <aside>
        <GoalList items={mockGoals} />
        <div style={{ height: '1rem' }} />
        <ActivityFeed items={mockActivity} />
      </aside>
    </div>
  )
}
