export default function Heatmap({ history, color = '#a855f7' }) {
  const days = []
  const today = new Date()
  const completedDates = new Set(history.map((h) => h.date))

  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    days.push({
      date: dateStr,
      completed: completedDates.has(dateStr),
      dayOfWeek: date.getDay(),
    })
  }

  const weeks = []
  let currentWeek = []

  const firstDayOfWeek = days[0].dayOfWeek
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push(null)
  }

  days.forEach((day) => {
    currentWeek.push(day)
    if (day.dayOfWeek === 6) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  const completionRate = Math.round((history.length / 90) * 100)

  return (
    <div
      className="p-4 rounded-lg border border-white/5"
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
      }}
    >
      <div className="flex justify-between items-center mb-3">
        <span className="font-semibold text-sm">Activity</span>
        <span className="text-xs text-muted">{completionRate}% completion rate</span>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-2">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {week.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className={`w-3 h-3 rounded-[3px] transition-transform duration-150 ${
                  !day
                    ? 'bg-transparent cursor-default'
                    : day.completed
                    ? 'cursor-pointer hover:scale-[1.3]'
                    : 'bg-white/[0.06] cursor-pointer hover:scale-[1.3]'
                }`}
                style={day?.completed ? { backgroundColor: color, boxShadow: `0 0 8px ${color}` } : undefined}
                title={day ? `${day.date}${day.completed ? ' ✓' : ''}` : ''}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[0.7rem] text-muted">
        <span>Less</span>
        <div className="flex gap-[3px]">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-white/[0.06]" />
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: color, opacity: 0.3 }} />
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: color, opacity: 0.6 }} />
          <div className="w-2.5 h-2.5 rounded-[3px]" style={{ backgroundColor: color }} />
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
