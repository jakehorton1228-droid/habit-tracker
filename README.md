# Habit Tracker

A full-stack habit tracking application built with Django REST Framework and React.

## Features

- **Habit Tracking** - Create and track daily habits with completion history
- **Goal Management** - Set goals with progress tracking and deadlines
- **Journal** - Daily journaling with mood tracking
- **Calendar View** - Visual calendar with FullCalendar integration
- **Dashboard** - Overview of stats, streaks, and recent activity

## Tech Stack

### Backend
- Python 3.11
- Django 5.2.8
- Django REST Framework 3.16
- SimpleJWT for authentication
- SQLite (development) / PostgreSQL (production)

### Frontend
- React 19.2
- Vite 7
- Tailwind CSS 4
- React Router 6
- Axios
- FullCalendar 6
- Day.js

## Project Structure

```
habit-tracker/
├── backend/                 # Django API
│   ├── accounts/           # User auth & registration
│   ├── habits/             # Habit tracking
│   ├── goals/              # Goal management
│   ├── journal/            # Journal entries
│   └── core/               # Django settings
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

- Python 3.11+
- Node.js 18+
- npm or yarn
- Conda (recommended) or virtualenv

### Backend Setup

1. Create and activate a conda environment:
   ```bash
   conda create -n habit-tracker python=3.11
   conda activate habit-tracker
   ```

   Or use a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

3. Create a `.env` file (see [Environment Variables](#environment-variables))

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
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
| `/api/journal/` | GET, POST | List/create journal entries |
| `/api/journal/<id>/` | GET, PUT, DELETE | Journal entry details |

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

## License

MIT
