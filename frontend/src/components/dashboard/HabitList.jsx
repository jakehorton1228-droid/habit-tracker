export default function HabitList({ items = [] }) {
  return (
    <div className="habit-list">
      <h3>Habits</h3>
      <ul>
        {items.map((h) => (
          <li key={h.id} className={h.doneToday ? 'done' : ''}>
            <div className="habit-title">{h.title}</div>
            <div className="habit-meta">Streak: {h.streak}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
