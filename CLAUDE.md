# CLAUDE.md - FitApp Project Guide

## Project Overview

FitApp is a full-stack fitness tracking application for logging workouts, tracking exercises, and viewing training analytics. Users can log exercises with sets, reps, and weights, then view progress through charts and statistics.

**Live at:** `localhost:3000` (frontend) and `localhost:8000` (backend API)

## Tech Stack

### Backend
- **Django 5.2** with Django REST Framework
- **PostgreSQL** (production) / SQLite (development)
- **JWT authentication** via `djangorestframework-simplejwt`
- Python 3.9+

### Frontend
- **React 18** with React Router v6
- **Tailwind CSS** for styling
- **Radix UI** primitives (via shadcn/ui pattern)
- **Recharts** for data visualization
- **Axios** for API calls with JWT interceptors

## Quick Commands

```bash
# Backend (from /backend directory)
source venv/bin/activate
python manage.py runserver          # Start dev server on :8000
python manage.py test               # Run tests
python manage.py makemigrations     # Create migrations
python manage.py migrate            # Apply migrations

# Frontend (from /frontend directory)
npm start                           # Start dev server on :3000
npm test                            # Run tests
npm run build                       # Production build
```

## Project Structure

```
fitapp/
├── backend/
│   ├── backend/
│   │   ├── settings/              # Split settings (development.py)
│   │   ├── urls.py                # Root URL config
│   │   └── views.py               # Auth views (login, register)
│   └── workouts/
│       ├── models.py              # Exercise, Workout, PerformedExercise
│       ├── views.py               # DRF ViewSets
│       ├── serializers.py         # DRF Serializers
│       ├── analytics.py           # Analytics calculation functions
│       ├── services/              # Business logic layer
│       ├── permissions/           # Custom DRF permissions
│       ├── exceptions/            # Custom exception handlers
│       └── api/analytics/         # Analytics API endpoints
│
├── frontend/src/
│   ├── components/
│   │   ├── analytics/             # Analytics dashboard
│   │   │   ├── cards/             # CurrentWeekCard, TopWorkoutsCard, etc.
│   │   │   ├── charts/            # WeeklyVolumeChart, WeeklyFrequencyChart
│   │   │   └── tabs/              # OverallProgressTab, MuscleGroupsTab
│   │   ├── workoutLogger/         # Workout creation flow
│   │   │   ├── ExerciseSelectorPage.jsx
│   │   │   ├── SetLogger.jsx      # Reps/weight wheel pickers
│   │   │   ├── ReviewStep.jsx
│   │   │   └── WorkoutLoggerPage.jsx
│   │   └── ui/                    # Reusable components (shadcn/ui style)
│   ├── contexts/                  # AuthContext, WorkoutContext, ExerciseContext
│   ├── hooks/                     # useWorkoutLogger, useExerciseHistory, etc.
│   ├── api.js                     # API endpoint functions
│   └── apiClient.js               # Axios instance with JWT interceptors
```

## Data Models

### Exercise
- `name`, `muscle_group` (chest/back/shoulders/arms/legs/core)
- `is_custom`, `owner` (for user-created exercises)
- Extended metadata: `force`, `level`, `mechanic`, `equipment`, `primaryMuscles`, `secondaryMuscles`, `instructions`, `images` (JSON fields)

### Workout
- `user`, `date`, `name` (auto-generated from muscle groups)
- `total_volume` (precomputed: Σ reps × weight)

### PerformedExercise
- `workout`, `exercise`, `sets`
- `reps_per_set` (JSON array, e.g., `[10, 8, 8]`)
- `weights_per_set` (JSON array, e.g., `[135, 135, 135]`)

## Key Features & UX Patterns

### Workout Logging Flow
1. User taps "+" → ExerciseSelectorPage (filter by muscle group, search)
2. Select exercise → SetLogger (wheel pickers for reps/weight, rest timer)
3. Add sets → ReviewStep (confirm/delete sets)
4. Complete exercise → Back to workout summary
5. Finish workout → Saved with auto-generated name

### Auto-Naming
Workouts are automatically named based on muscle groups of exercises:
- Single group: "Chest Workout"
- Multiple groups: "Chest and Back Workout"
- Logic is in frontend workout context

### Analytics
- **Weekly Volume**: Line chart of total volume over time
- **Weekly Sessions**: Bar chart of workouts per week
- **Top Workouts**: Leaderboard of highest-volume sessions
- **Current Week**: Summary card with comparisons to last week

## API Endpoints

```
# Auth
POST /api/login/              # Get JWT tokens
POST /api/login/refresh/      # Refresh access token
POST /api/register/           # Create account

# Resources
GET/POST    /api/workouts/
GET/PATCH/DELETE /api/workouts/{id}/
GET/POST    /api/exercises/
GET/POST    /api/performed-exercises/

# Analytics
GET /api/analytics/weekly-volume/?start_date=&end_date=
GET /api/analytics/weekly-frequency/?start_date=&end_date=
GET /api/analytics/top-workouts/?limit=5
```

## Code Conventions

### Frontend
- Components use `.jsx` extension
- UI primitives in `components/ui/` follow shadcn/ui patterns
- Feature components organized by domain (`analytics/`, `workoutLogger/`)
- Custom hooks in `hooks/` for reusable logic
- Context providers for global state (Auth, Workout, Exercise)

### Backend
- ViewSets in `views.py`, business logic in `services/`
- Custom permissions in `permissions/`
- Analytics calculations in `analytics.py`
- JWT tokens stored in localStorage on frontend

## Development Notes

### Environment Variables
```bash
# Backend (.env)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Frontend (.env.development)
REACT_APP_API_URL=http://127.0.0.1:8000
```

### Common Tasks

**Adding a new exercise field:**
1. Update `Exercise` model in `backend/workouts/models.py`
2. Create migration: `python manage.py makemigrations`
3. Update serializer in `serializers.py`
4. Update frontend types/API calls as needed

**Adding a new analytics endpoint:**
1. Add calculation function in `backend/workouts/analytics.py`
2. Create view in `backend/workouts/api/analytics/`
3. Add URL route
4. Create frontend API function in `api.js`
5. Create chart/card component in `components/analytics/`

**Modifying the workout logger flow:**
- Main orchestration: `hooks/useWorkoutLogger.js`
- Set input UI: `components/workoutLogger/SetLogger.jsx`
- Exercise selection: `components/workoutLogger/ExerciseSelectorPage.jsx`

## Known Limitations / TODOs

- **Muscle group analytics** (volume distribution, balance scores, recency) documented in README but not yet implemented in UI
- **Weight picker UX**: Scrolling in 2.5 lb increments is slow for heavy lifts (consider tap-to-edit or quick-jump buttons)
- **No edit mode**: Can't modify completed workouts or individual sets after saving
- **Exercise details**: Exercise images/instructions exist in data model but aren't displayed in UI

## Testing

```bash
# Backend
python manage.py test

# Frontend
npm test
```

## Useful Debugging

- API docs: `http://localhost:8000/api/docs/` (Swagger UI)
- Django admin: `http://localhost:8000/admin/`
- Frontend stores JWT in `localStorage` as `access` and `refresh` keys
