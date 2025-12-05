// Categories with colors
export const categories = [
  { id: 'health', name: 'Health', color: '#ff6b6b' },
  { id: 'learning', name: 'Learning', color: '#a855f7' },
  { id: 'mindfulness', name: 'Mindfulness', color: '#22c55e' },
  { id: 'productivity', name: 'Productivity', color: '#3b82f6' },
  { id: 'social', name: 'Social', color: '#fbbf24' },
]

// Generate completion history for heatmap (last 90 days)
function generateCompletionHistory(habitId, completionRate = 0.7) {
  const history = []
  const today = new Date()
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().slice(0, 10)
    const completed = Math.random() < completionRate
    if (completed) {
      history.push({
        date: dateStr,
        note: i % 7 === 0 ? 'Great session today!' : null,
      })
    }
  }
  return history
}

// Calculate streak from history
function calculateStreak(history) {
  const today = new Date().toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
  const dates = new Set(history.map(h => h.date))

  // Check if streak is active (completed today or yesterday)
  if (!dates.has(today) && !dates.has(yesterday)) return 0

  let streak = 0
  let checkDate = new Date()
  if (!dates.has(today)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  while (dates.has(checkDate.toISOString().slice(0, 10))) {
    streak++
    checkDate.setDate(checkDate.getDate() - 1)
  }
  return streak
}

// Calculate best streak from history
function calculateBestStreak(history) {
  const dates = history.map(h => h.date).sort()
  let best = 0
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1])
    const curr = new Date(dates[i])
    const diffDays = (curr - prev) / 86400000

    if (diffDays === 1) {
      current++
    } else {
      best = Math.max(best, current)
      current = 1
    }
  }
  return Math.max(best, current)
}

const habit1History = generateCompletionHistory(1, 0.85)
const habit2History = generateCompletionHistory(2, 0.6)
const habit3History = generateCompletionHistory(3, 0.75)

export const habits = [
  {
    id: 1,
    title: 'Morning Run',
    category: 'health',
    streak: calculateStreak(habit1History),
    bestStreak: calculateBestStreak(habit1History),
    doneToday: habit1History.some(h => h.date === new Date().toISOString().slice(0, 10)),
    history: habit1History,
  },
  {
    id: 2,
    title: 'Read 30 mins',
    category: 'learning',
    streak: calculateStreak(habit2History),
    bestStreak: calculateBestStreak(habit2History),
    doneToday: habit2History.some(h => h.date === new Date().toISOString().slice(0, 10)),
    history: habit2History,
  },
  {
    id: 3,
    title: 'Meditate',
    category: 'mindfulness',
    streak: calculateStreak(habit3History),
    bestStreak: calculateBestStreak(habit3History),
    doneToday: habit3History.some(h => h.date === new Date().toISOString().slice(0, 10)),
    history: habit3History,
  },
]

export const stats = {
  totalHabits: habits.length,
  completedToday: habits.filter(h => h.doneToday).length,
  streakBest: Math.max(...habits.map(h => h.bestStreak)),
}

// Goal categories
export const goalCategories = [
  { id: 'fitness', name: 'Fitness', color: '#ff6b6b', icon: '💪' },
  { id: 'learning', name: 'Learning', color: '#a855f7', icon: '📚' },
  { id: 'finance', name: 'Finance', color: '#22c55e', icon: '💰' },
  { id: 'career', name: 'Career', color: '#3b82f6', icon: '💼' },
  { id: 'personal', name: 'Personal', color: '#fbbf24', icon: '⭐' },
]

const today = new Date()
const futureDate = (days) => {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

export const goals = [
  {
    id: 1,
    title: 'Run 100 miles',
    description: 'Complete 100 miles of running this quarter to improve cardio fitness.',
    category: 'fitness',
    current: 42,
    target: 100,
    unit: 'miles',
    deadline: futureDate(45),
    createdAt: futureDate(-30),
    milestones: [
      { id: 1, title: 'First 25 miles', target: 25, completed: true },
      { id: 2, title: 'Halfway there', target: 50, completed: false },
      { id: 3, title: '75 miles', target: 75, completed: false },
      { id: 4, title: 'Goal complete!', target: 100, completed: false },
    ],
  },
  {
    id: 2,
    title: 'Read 12 books',
    description: 'Read one book per month to expand knowledge and maintain reading habit.',
    category: 'learning',
    current: 7,
    target: 12,
    unit: 'books',
    deadline: futureDate(120),
    createdAt: futureDate(-90),
    milestones: [
      { id: 1, title: 'First book done', target: 1, completed: true },
      { id: 2, title: 'Quarter way', target: 3, completed: true },
      { id: 3, title: 'Halfway', target: 6, completed: true },
      { id: 4, title: 'Three quarters', target: 9, completed: false },
      { id: 5, title: 'All 12 books!', target: 12, completed: false },
    ],
  },
  {
    id: 3,
    title: 'Save $5,000',
    description: 'Build emergency fund for unexpected expenses.',
    category: 'finance',
    current: 3200,
    target: 5000,
    unit: 'dollars',
    deadline: null,
    createdAt: futureDate(-60),
    milestones: [
      { id: 1, title: 'First $1,000', target: 1000, completed: true },
      { id: 2, title: '$2,500 saved', target: 2500, completed: true },
      { id: 3, title: 'Goal reached!', target: 5000, completed: false },
    ],
  },
  {
    id: 4,
    title: 'Learn Spanish basics',
    description: 'Complete beginner Spanish course and hold basic conversations.',
    category: 'learning',
    current: 15,
    target: 30,
    unit: 'lessons',
    deadline: futureDate(60),
    createdAt: futureDate(-14),
    milestones: [
      { id: 1, title: 'First 10 lessons', target: 10, completed: true },
      { id: 2, title: 'Halfway', target: 15, completed: true },
      { id: 3, title: 'Course complete', target: 30, completed: false },
    ],
  },
]

export const activity = [
  { id: 1, text: 'Completed Morning Run', time: '2h ago', type: 'complete', undoable: true },
  { id: 2, text: 'Added new goal: Read 12 books', time: '1d ago', type: 'create', undoable: false },
]

export const calendarEvents = [
  { id: 'e1', title: 'Morning Run', start: new Date().toISOString().slice(0,10) },
  { id: 'e2', title: 'Read - 30 mins', start: new Date(new Date().setDate(new Date().getDate()+1)).toISOString().slice(0,10) },
  { id: 'e3', title: 'Meditation', start: new Date(new Date().setDate(new Date().getDate()-2)).toISOString().slice(0,10) },
]

// Journal prompts for structured entries
export const journalPrompts = [
  { id: 'wins', label: 'What went well today?', icon: '✨' },
  { id: 'challenges', label: 'What challenges did you face?', icon: '🎯' },
  { id: 'grateful', label: 'What are you grateful for?', icon: '🙏' },
  { id: 'tomorrow', label: 'What will you focus on tomorrow?', icon: '🚀' },
]

// Generate some sample journal entries
const journalToday = new Date()
const formatDate = (d) => d.toISOString().slice(0, 10)
const formatTime = (d) => d.toTimeString().slice(0, 5)

export const journalEntries = [
  {
    id: 1,
    date: formatDate(journalToday),
    time: '08:30',
    type: 'prompted',
    mood: 'great',
    responses: {
      wins: 'Completed my morning run and hit a new personal best!',
      challenges: 'Struggled to focus during the afternoon meetings.',
      grateful: 'My supportive team and good weather for running.',
      tomorrow: 'Finish the project proposal and prepare for the presentation.',
    },
  },
  {
    id: 2,
    date: formatDate(new Date(journalToday.getTime() - 86400000)),
    time: '21:15',
    type: 'freeform',
    mood: 'good',
    content: 'Today was productive overall. Made good progress on my reading goal - finished another chapter of the book I\'ve been working through. The meditation session this morning helped me stay calm during a stressful meeting. Need to remember to take more breaks tomorrow.',
  },
  {
    id: 3,
    date: formatDate(new Date(journalToday.getTime() - 86400000)),
    time: '07:45',
    type: 'prompted',
    mood: 'okay',
    responses: {
      wins: 'Woke up early and meditated for 15 minutes.',
      grateful: 'A warm cup of coffee and quiet mornings.',
    },
  },
  {
    id: 4,
    date: formatDate(new Date(journalToday.getTime() - 2 * 86400000)),
    time: '20:00',
    type: 'freeform',
    mood: 'great',
    content: 'What an amazing day! Everything just clicked. Hit all my habit goals and even had time for some creative work in the evening. Feeling motivated and ready for the week ahead.',
  },
]

export const moodOptions = [
  { id: 'great', label: 'Great', emoji: '😊', color: '#22c55e' },
  { id: 'good', label: 'Good', emoji: '🙂', color: '#3b82f6' },
  { id: 'okay', label: 'Okay', emoji: '😐', color: '#fbbf24' },
  { id: 'low', label: 'Low', emoji: '😔', color: '#f97316' },
  { id: 'rough', label: 'Rough', emoji: '😢', color: '#ef4444' },
]

export default { stats, habits, goals, activity, calendarEvents, categories, journalEntries, journalPrompts, moodOptions }
