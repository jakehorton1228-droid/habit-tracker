export const stats = {
  totalHabits: 12,
  completedToday: 5,
  streakBest: 14,
}

export const habits = [
  { id: 1, title: 'Morning Run', streak: 7, doneToday: true },
  { id: 2, title: 'Read 30 mins', streak: 3, doneToday: false },
  { id: 3, title: 'Meditate', streak: 10, doneToday: true },
]

export const goals = [
  { id: 1, title: 'Run 100 miles', progress: 42 },
  { id: 2, title: 'Read 12 books', progress: 58 },
]

export const activity = [
  { id: 1, text: 'Completed Morning Run', time: '2h ago' },
  { id: 2, text: 'Added new goal: Read 12 books', time: '1d ago' },
]

export const calendarEvents = [
  { id: 'e1', title: 'Morning Run', start: new Date().toISOString().slice(0,10) },
  { id: 'e2', title: 'Read - 30 mins', start: new Date(new Date().setDate(new Date().getDate()+1)).toISOString().slice(0,10) },
  { id: 'e3', title: 'Meditation', start: new Date(new Date().setDate(new Date().getDate()-2)).toISOString().slice(0,10) },
]

export default { stats, habits, goals, activity, calendarEvents }
