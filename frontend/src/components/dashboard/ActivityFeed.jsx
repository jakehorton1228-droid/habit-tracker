export default function ActivityFeed({ items = [] }) {
  return (
    <div
      className="p-4 rounded-lg border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: 'var(--soft-shadow)',
      }}
    >
      <h3 className="m-0 mb-3 text-base text-accent-2">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted py-4 text-center">
          No activity yet. Complete a habit to see it here!
        </p>
      ) : (
        <ul className="list-none m-0 p-0">
          {items.map((a) => (
            <li
              key={a.id}
              className="flex justify-between items-center py-3 border-b border-white/5 last:border-0"
            >
              <div className="text-sm">{a.text}</div>
              <div className="text-xs text-muted">{a.time}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
