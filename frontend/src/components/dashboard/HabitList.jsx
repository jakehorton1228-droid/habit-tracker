export default function HabitList({ items = [] }) {
  return (
    <div
      className="p-4 rounded-lg border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: 'var(--soft-shadow)',
      }}
    >
      <h3 className="m-0 mb-3 text-base text-accent-2">Habits</h3>
      <ul className="list-none m-0 p-0">
        {items.map((h) => (
          <li
            key={h.id}
            className={`flex justify-between items-center py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02] hover:-mx-2 hover:px-2 hover:rounded-lg ${
              h.doneToday ? 'opacity-60' : ''
            }`}
          >
            <div className={`font-medium ${h.doneToday ? 'line-through' : ''}`}>{h.title}</div>
            <div className="text-sm text-muted">Streak: {h.streak}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
