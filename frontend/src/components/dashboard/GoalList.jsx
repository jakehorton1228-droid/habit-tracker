import { Link } from 'react-router-dom'

export default function GoalList({ items = [] }) {
  return (
    <div
      className="p-4 rounded-lg border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: 'var(--soft-shadow)',
      }}
    >
      <h3 className="m-0 mb-3 text-base text-accent-2">Goals</h3>
      {items.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm text-muted mb-2">No goals yet</p>
          <Link to="/goals" className="text-sm text-accent hover:underline">
            Set your first goal
          </Link>
        </div>
      ) : (
        <ul className="list-none m-0 p-0">
          {items.map((g) => {
            const progress = g.target > 0 ? Math.round((g.current / g.target) * 100) : 0
            return (
              <li
                key={g.id}
                className="flex justify-between items-center py-3 border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.02] hover:-mx-2 hover:px-2 hover:rounded-lg"
              >
                <div className="font-medium">{g.title}</div>
                <div className="text-sm text-accent">{progress}%</div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
