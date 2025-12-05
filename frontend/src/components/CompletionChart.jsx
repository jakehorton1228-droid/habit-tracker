export default function CompletionChart({ habits }) {
  const weeks = []
  const today = new Date()

  for (let w = 7; w >= 0; w--) {
    const weekStart = new Date(today)
    weekStart.setDate(weekStart.getDate() - (w * 7) - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    let totalPossible = 0
    let totalCompleted = 0

    habits.forEach((habit) => {
      const completedDates = new Set(habit.history.map((h) => h.date))
      for (let d = 0; d < 7; d++) {
        const checkDate = new Date(weekStart)
        checkDate.setDate(checkDate.getDate() + d)
        const dateStr = checkDate.toISOString().slice(0, 10)
        if (checkDate <= today) {
          totalPossible++
          if (completedDates.has(dateStr)) {
            totalCompleted++
          }
        }
      }
    })

    const rate = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0
    weeks.push({
      label: `W${8 - w}`,
      rate,
      startDate: weekStart.toISOString().slice(5, 10),
    })
  }

  const maxRate = Math.max(...weeks.map((w) => w.rate), 1)

  const habitStats = habits.map((habit) => {
    const total = habit.history.length
    const rate = Math.round((total / 90) * 100)
    return {
      id: habit.id,
      title: habit.title,
      completions: total,
      rate,
    }
  }).sort((a, b) => b.rate - a.rate)

  return (
    <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
      <div
        className="p-4 rounded-lg border border-white/5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        <h4 className="m-0 mb-4 text-sm text-accent-2 font-semibold">Weekly Completion Rate</h4>
        <div className="flex items-end gap-2 h-[140px]">
          {weeks.map((week, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full h-[120px] flex items-end justify-center">
                <div
                  className="w-full max-w-8 rounded-t min-h-1 relative transition-all duration-300 hover:brightness-[1.2] group"
                  style={{
                    height: `${(week.rate / maxRate) * 100}%`,
                    background: 'linear-gradient(180deg, var(--accent) 0%, var(--accent-2) 100%)',
                  }}
                >
                  <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[0.7rem] font-semibold text-text opacity-0 group-hover:opacity-100 transition-opacity duration-150 whitespace-nowrap">
                    {week.rate}%
                  </span>
                </div>
              </div>
              <span className="text-[0.65rem] text-muted">{week.startDate}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        className="p-4 rounded-lg border border-white/5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
        }}
      >
        <h4 className="m-0 mb-4 text-sm text-accent-2 font-semibold">Habit Performance (90 days)</h4>
        <div className="flex flex-col gap-3">
          {habitStats.map((habit) => (
            <div key={habit.id} className="flex items-center gap-3">
              <span className="w-[100px] text-sm whitespace-nowrap overflow-hidden text-ellipsis">
                {habit.title}
              </span>
              <div className="flex-1 h-2 bg-white/[0.06] rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-300"
                  style={{
                    width: `${habit.rate}%`,
                    background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-2) 100%)',
                  }}
                />
              </div>
              <span className="w-10 text-right text-sm font-semibold text-accent">
                {habit.rate}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
