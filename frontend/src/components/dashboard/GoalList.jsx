export default function GoalList({ items = [] }) {
  return (
    <div className="goal-list">
      <h3>Goals</h3>
      <ul>
        {items.map((g) => (
          <li key={g.id}>
            <div className="goal-title">{g.title}</div>
            <div className="goal-meta">{g.progress}%</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
