# Habit Tracker Frontend

React frontend for the Habit Tracker application.

## Tech Stack

- React 19.2
- Vite 7
- Tailwind CSS 4
- React Router 6
- Axios
- FullCalendar 6
- Day.js

## Project Structure

```
frontend/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Calendar/       # FullCalendar integration
│   │   │   └── FullCalendarView.jsx
│   │   ├── dashboard/      # Dashboard widgets
│   │   │   ├── ActivityFeed.jsx
│   │   │   ├── GoalList.jsx
│   │   │   ├── HabitList.jsx
│   │   │   └── StatsCard.jsx
│   │   ├── CompletionChart.jsx
│   │   ├── Heatmap.jsx
│   │   ├── Modal.jsx
│   │   ├── Nav.jsx
│   │   ├── ProtectedRoute.jsx
│   │   ├── Toast.jsx
│   │   └── UserMenu.jsx
│   ├── hooks/              # Custom React hooks
│   │   ├── useAuth.jsx     # Authentication state
│   │   ├── useSettings.jsx # User settings
│   │   └── useToast.jsx    # Toast notifications
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Main dashboard
│   │   ├── Goals.jsx       # Goals management
│   │   ├── Habits.jsx      # Habits tracking
│   │   ├── Journal.jsx     # Journal entries
│   │   ├── Login.jsx       # Login page
│   │   └── Register.jsx    # Registration page
│   ├── services/           # API client
│   ├── utils/              # Utilities & helpers
│   ├── App.jsx             # Root component
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── eslint.config.js        # ESLint configuration
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173/`

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## Pages

### Dashboard
Main overview page with:
- Stats cards showing streaks and completion rates
- Today's habits checklist
- Active goals with progress bars
- Recent activity feed

### Habits
Manage recurring habits:
- Create/edit/delete habits
- Log daily completions
- View completion heatmap
- Filter by category

### Goals
Track measurable objectives:
- Set target values and deadlines
- Log progress updates
- Visual progress indicators

### Journal
Daily journaling with mood tracking:
- Freeform text entries
- Prompted entries with guided questions
- Mood selection (great, good, okay, low, rough)

### Calendar
Visual calendar view:
- FullCalendar integration
- View habits and events by date

## Components

### Navigation
- `Nav.jsx` - Main navigation bar
- `UserMenu.jsx` - User dropdown menu
- `ProtectedRoute.jsx` - Auth-protected route wrapper

### Dashboard Widgets
- `StatsCard.jsx` - Displays key metrics
- `HabitList.jsx` - Today's habits with checkboxes
- `GoalList.jsx` - Active goals with progress
- `ActivityFeed.jsx` - Recent activity timeline

### Visualizations
- `Heatmap.jsx` - GitHub-style activity heatmap
- `CompletionChart.jsx` - Habit completion charts
- `FullCalendarView.jsx` - Calendar integration

### UI Components
- `Modal.jsx` - Reusable modal dialog
- `Toast.jsx` - Toast notifications

## Hooks

### useAuth
Manages authentication state:
- Login/logout functions
- Current user data
- JWT token handling

### useSettings
User preferences and settings

### useToast
Toast notification system:
- Show success/error/info messages
- Auto-dismiss functionality

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

## Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory.
