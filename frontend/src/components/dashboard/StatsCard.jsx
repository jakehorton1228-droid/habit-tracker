/**
 * Dashboard stat card with gradient value display.
 * @param {Object} props
 * @param {string} props.title - Stat label
 * @param {string|number} props.value - Stat value to display
 */
export default function StatsCard({ title, value }) {
  return (
    <div
      className="p-5 rounded-lg border border-white/5 backdrop-blur-lg transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)',
        boxShadow: 'var(--soft-shadow), var(--card-glow)',
      }}
    >
      <div className="text-muted text-sm uppercase tracking-wider">{title}</div>
      <div
        className="text-3xl mt-2 font-bold bg-clip-text text-transparent"
        style={{ backgroundImage: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-3) 100%)' }}
      >
        {value}
      </div>
    </div>
  )
}
