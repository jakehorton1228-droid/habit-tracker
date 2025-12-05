# Habit Tracker

A full-stack habit tracking application built with Django REST Framework and React.

## Features

- **Habit Tracking** - Create and track daily habits with completion history
- **Goal Management** - Set goals with progress tracking and deadlines
- **Journal** - Daily journaling with mood tracking and prompts
- **Calendar View** - Visual calendar with FullCalendar integration
- **Dashboard** - Overview of stats, streaks, and recent activity

## Tech Stack

### Backend
- Python 3.x
- Django 5.2
- Django REST Framework
- SimpleJWT for authentication
- SQLite (development) / PostgreSQL (production)

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- React Router
- Axios
- FullCalendar
- Day.js

## Project Structure

```
habit-tracker/
├── backend/                 # Django API
│   ├── accounts/           # User auth & registration
│   ├── habits/             # Habit tracking
│   ├── goals/              # Goal management
│   └── habit_tracker/      # Django settings
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API client
│   │   └── utils/          # Utilities & mock data
│   └── public/
└── README.md
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file (see [Environment Variables](#environment-variables))

5. Run migrations:
   ```bash
   python manage.py migrate
   ```

6. Start the development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:5173/`

## Environment Variables

### Backend (`backend/.env`)

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:8000/api
```

## API Endpoints

See [API Documentation](docs/API.md) for detailed endpoint reference.

### Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Get JWT tokens |
| `/api/auth/token/refresh/` | POST | Refresh access token |
| `/api/auth/user/` | GET | Get current user |
| `/api/habits/` | GET, POST | List/create habits |
| `/api/habits/<id>/` | GET, PUT, DELETE | Habit details |
| `/api/habits/logs/` | GET, POST | Habit completion logs |
| `/api/goals/` | GET, POST | List/create goals |
| `/api/goals/<id>/` | GET, PUT, DELETE | Goal details |
| `/api/goals/progress/` | GET, POST | Goal progress entries |

## Development

### Running Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend
npm run lint
```

### Building for Production

```bash
# Frontend
cd frontend
npm run build
```

## Current Status

This project is in active development. The frontend currently uses mock data while API integration is being completed.

## License

MIT
