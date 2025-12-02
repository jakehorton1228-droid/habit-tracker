export default function ActivityFeed({ items = [] }) {
  return (
    <div className="activity-feed">
      <h3>Recent Activity</h3>
      <ul>
        {items.map((a) => (
          <li key={a.id}>
            <div className="activity-text">{a.text}</div>
            <div className="activity-time">{a.time}</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
