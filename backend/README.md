# Habit Tracker Backend

Django REST Framework API for the Habit Tracker application.

## Tech Stack

- Python 3.11
- Django 5.2.8
- Django REST Framework 3.16
- SimpleJWT for authentication
- SQLite (development) / PostgreSQL (production)

## Project Structure

```
backend/
├── core/               # Django project settings
│   ├── settings.py     # Configuration
│   ├── urls.py         # Root URL routing
│   ├── wsgi.py         # WSGI entry point
│   └── asgi.py         # ASGI entry point
├── accounts/           # User authentication
│   ├── views.py        # Register, login, user endpoints
│   ├── serializers.py  # User serializers
│   └── urls.py         # Auth URL patterns
├── habits/             # Habit tracking
│   ├── models.py       # Habit, HabitLog models
│   ├── views.py        # Habit CRUD endpoints
│   ├── serializers.py  # Habit serializers
│   └── urls.py         # Habit URL patterns
├── goals/              # Goal management
│   ├── models.py       # Goal, GoalProgress models
│   ├── views.py        # Goal CRUD endpoints
│   ├── serializers.py  # Goal serializers
│   └── urls.py         # Goal URL patterns
├── journal/            # Journaling feature
│   ├── models.py       # JournalEntry model
│   ├── views.py        # Journal CRUD endpoints
│   ├── serializers.py  # Journal serializers
│   └── urls.py         # Journal URL patterns
├── manage.py           # Django CLI
└── requirements.txt    # Python dependencies
```

## Setup

1. Create and activate a conda environment:
   ```bash
   conda create -n habit-tracker python=3.11
   conda activate habit-tracker
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install djangorestframework-simplejwt
   ```

3. Create a `.env` file:
   ```env
   SECRET_KEY=your-secret-key-here
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   ```

4. Run migrations:
   ```bash
   python manage.py migrate
   ```

5. Start the development server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/api/`

## API Endpoints

### Authentication

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register/` | POST | Register new user |
| `/api/auth/login/` | POST | Get JWT tokens |
| `/api/auth/token/refresh/` | POST | Refresh access token |
| `/api/auth/user/` | GET | Get current user |

### Habits

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/habits/` | GET | List user's habits |
| `/api/habits/` | POST | Create a new habit |
| `/api/habits/<id>/` | GET | Get habit details |
| `/api/habits/<id>/` | PUT/PATCH | Update habit |
| `/api/habits/<id>/` | DELETE | Delete habit |
| `/api/habits/logs/` | GET | List habit logs |
| `/api/habits/logs/` | POST | Log habit completion |

### Goals

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/goals/` | GET | List user's goals |
| `/api/goals/` | POST | Create a new goal |
| `/api/goals/<id>/` | GET | Get goal details |
| `/api/goals/<id>/` | PUT/PATCH | Update goal |
| `/api/goals/<id>/` | DELETE | Delete goal |
| `/api/goals/progress/` | GET | List progress entries |
| `/api/goals/progress/` | POST | Add progress entry |

### Journal

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/journal/` | GET | List journal entries |
| `/api/journal/` | POST | Create journal entry |
| `/api/journal/<id>/` | GET | Get entry details |
| `/api/journal/<id>/` | PUT/PATCH | Update entry |
| `/api/journal/<id>/` | DELETE | Delete entry |

## Models

### Habit
- `name` - Display name (max 100 chars)
- `category` - One of: health, productivity, learning, mindfulness, social
- `frequency` - daily, weekly, or monthly

### HabitLog
- `habit` - Foreign key to Habit
- `date` - Completion date
- `note` - Optional notes

### Goal
- `name` - Display name
- `description` - Optional description
- `unit` - Unit of measurement (e.g., pages, dollars, hours)
- `target_value` - Target amount to achieve
- `current_value` - Current progress
- `start_date` / `end_date` - Optional date range

### GoalProgress
- `goal` - Foreign key to Goal
- `date` - Progress date
- `amount` - Progress amount
- `note` - Optional notes

### JournalEntry
- `date` / `time` - When entry was written
- `entry_type` - freeform or prompted
- `mood` - great, good, okay, low, or rough
- `content` - Free-text content (freeform entries)
- `responses` - JSON object (prompted entries)

## Running Tests

```bash
python manage.py test
```

## Admin Interface

Access the Django admin at `http://localhost:8000/admin/`

Create a superuser:
```bash
python manage.py createsuperuser
```
