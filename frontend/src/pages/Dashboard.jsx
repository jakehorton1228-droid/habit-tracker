import { stats as mockStats, habits as mockHabits, goals as mockGoals, activity as mockActivity } from '../utils/mockData'
import StatsCard from '../components/dashboard/StatsCard'
import HabitList from '../components/dashboard/HabitList'
import GoalList from '../components/dashboard/GoalList'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import FullCalendarView from '../components/Calendar/FullCalendarView'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-[1fr_320px] grid-rows-[auto_1fr] gap-6 p-6 min-h-[calc(100vh-60px)] max-md:grid-cols-1">
      <section className="col-span-2 max-md:col-span-1">
        <FullCalendarView />
      </section>

      <section className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
          <StatsCard title="Total Habits" value={mockStats.totalHabits} />
          <StatsCard title="Completed Today" value={mockStats.completedToday} />
          <StatsCard title="Best Streak" value={mockStats.streakBest} />
        </div>

        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <HabitList items={mockHabits} />
          <GoalList items={mockGoals} />
        </div>
      </section>

      <aside>
        <ActivityFeed items={mockActivity} />
      </aside>
    </div>
  )
}
