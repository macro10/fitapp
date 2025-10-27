# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a full-stack fitness tracking application that allows users to log workouts, track exercises, and view analytics about their training. The application consists of a Django REST Framework backend with PostgreSQL database and a React frontend with Tailwind CSS.

## Architecture

### Backend (Django REST Framework)
- **Location**: `/backend`
- **Framework**: Django 5.2 with Django REST Framework
- **Database**: PostgreSQL (production), SQLite (legacy/dev fallback)
- **Authentication**: JWT tokens via `djangorestframework-simplejwt`

#### Key Backend Structure
- **Main app**: `workouts/` - Contains all workout-related models, views, and business logic
- **Models** (`workouts/models.py`):
  - `Exercise` - Exercise definitions with muscle groups, equipment, difficulty levels. Supports both system exercises and user-custom exercises (via `is_custom` and `owner` fields)
  - `Workout` - User's workout sessions with date, name, and precomputed `total_volume`
  - `PerformedExercise` - Links exercises to workouts with sets/reps/weights data stored as JSON arrays
- **Services** (`workouts/services/`): Business logic layer that encapsulates model operations
  - `exercise_service.py` - Exercise retrieval and filtering
  - `workout_service.py` - Workout CRUD operations
  - `performed_exercise_service.py` - Performed exercise operations
- **Analytics** (`workouts/analytics.py`): Complex analytics calculations including:
  - Weekly volume aggregation by muscle group
  - Current vs last week comparisons
  - Balance scores (undertrained/overemphasized muscle groups)
  - Recency tracking (days since last training per muscle group)
- **API Routes** (`workouts/api/analytics/`): Analytics endpoints exposed as REST API
- **Permissions** (`workouts/permissions/`): Custom DRF permissions like `IsOwnerOfWorkout`
- **Exceptions** (`workouts/exceptions/`): Custom exception handlers

#### Database Connection
- Uses environment variables for PostgreSQL connection (see `.env` in backend)
- Configured for connection pooling with health checks and disabled server-side cursors
- `DATABASE_URL` environment variable takes precedence for production

### Frontend (React)
- **Location**: `/frontend`
- **Framework**: React 18 with React Router v6
- **Styling**: Tailwind CSS with custom theme configuration
- **UI Components**: Radix UI primitives + custom components in `src/components/ui/`
- **State Management**: React Context API (no Redux/Zustand)

#### Key Frontend Structure
- **Contexts** (`src/contexts/`):
  - `AuthContext.jsx` - Authentication state and token management
  - `WorkoutContext.jsx` - Workout data and operations
  - `ExerciseContext.jsx` - Exercise library management
- **API Layer**:
  - `src/apiClient.js` - Axios instance with JWT interceptor for automatic token refresh
  - `src/api.js` - API method wrappers (getExercises, createWorkout, analytics endpoints, etc.)
- **Custom Hooks** (`src/hooks/`):
  - `useWorkoutLogger.js` - Workout logging state machine
  - `useExerciseHistory.js` - Previous exercise data for prefilling
  - `useExerciseRecency.js` - Days since exercise was last performed
  - `useCancelWorkout.js` - Workout cancellation with confirmation
  - `use-toast.js` - Toast notifications
- **Routes**:
  - `/` - Workout list (protected)
  - `/analytics` - Analytics dashboard (protected)
  - `/log` - Workout logger (protected)
  - `/workout/exercise-selector` - Exercise selection modal (protected)
  - `/auth` - Login/registration (public)

#### API Communication
- Base URL configured via `REACT_APP_API_URL` environment variable (`.env.development` and `.env.production`)
- All requests include JWT token in Authorization header
- Automatic token refresh on 401 responses with request queuing during refresh

## Development Commands

### Backend Development
```bash
cd backend

# Install dependencies (first time)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run development server (uses backend.settings.development by default)
python manage.py runserver

# Create migrations after model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser for admin access
python manage.py createsuperuser

# Access Django admin
# http://127.0.0.1:8000/admin/

# Access API documentation (Swagger)
# http://127.0.0.1:8000/api/docs/
```

### Frontend Development
```bash
cd frontend

# Install dependencies (first time)
npm install

# Run development server
npm start
# Opens http://localhost:3000

# Run tests
npm test

# Build for production
npm run build

# Build for production with production environment variables
npm run build:prod
```

### Database Management
The backend requires PostgreSQL for production but can fall back to SQLite. Set these environment variables in `backend/.env`:
- `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`
- Or use `DATABASE_URL` for a single connection string

## Code Patterns and Conventions

### Backend Patterns
1. **ViewSets over Function Views**: Use DRF ModelViewSets for CRUD operations (see `workouts/views.py`)
2. **Service Layer**: Business logic goes in `services/` directory, not in views or serializers
3. **Permission Classes**: Always specify `permission_classes` on viewsets. Use `IsAuthenticated` for protected endpoints
4. **User Filtering**: Always filter querysets by `request.user` in `get_queryset()` to ensure users only see their own data
5. **Analytics Functions**: New analytics should go in `workouts/analytics.py` and be exposed via `workouts/api/analytics/`

### Frontend Patterns
1. **Contexts for Global State**: Use React Context for cross-cutting concerns (auth, exercises, workouts)
2. **Custom Hooks for Logic**: Extract complex stateful logic into custom hooks
3. **API Abstraction**: Never use axios directly in components - always add methods to `src/api.js`
4. **Protected Routes**: Wrap authenticated routes with `<RequireAuth>` component
5. **Shadcn/ui Components**: UI components in `src/components/ui/` follow shadcn/ui patterns - copy/paste customizable components

### Analytics Implementation Pattern
When adding new analytics:
1. Add calculation function to `backend/workouts/analytics.py`
2. Create view function in `backend/workouts/api/analytics/views.py` that wraps the calculation
3. Add URL route in `backend/workouts/api/analytics/urls.py`
4. Add API method in `frontend/src/api.js`
5. Create card component in `frontend/src/components/analytics/cards/`
6. Use the card in `frontend/src/components/analytics/AnalyticsPage.jsx`

## Important Implementation Details

### Authentication Flow
1. User logs in via `/api/login/` endpoint (Django SimpleJWT)
2. Frontend stores `access` token and `refresh` token in localStorage
3. API client intercepts 401 responses and attempts token refresh
4. If refresh fails, user is redirected to `/auth` page

### Workout Logging Flow
1. User creates a workout session via `/log` route
2. Exercises are added one-by-one with sets/reps/weights
3. Volume is precomputed on frontend and sent with workout creation
4. `PerformedExercise` records are created via separate API calls
5. Frontend uses `useWorkoutLogger` hook to manage the multi-step state

### Volume Calculation
- Volume = Σ(reps × weight) across all sets
- Stored in `Workout.total_volume` field (precomputed)
- Also calculated on-the-fly in analytics for muscle-group breakdowns
- Weight can be null/0 for bodyweight exercises

### Muscle Groups
- Canonical list defined in `Exercise.MUSCLE_GROUPS`: chest, back, shoulders, arms, legs, core
- Used throughout analytics for grouping and balance calculations
- Analytics tracks volume, session count, and recency per muscle group

## Common Tasks

### Adding a New Exercise Field
1. Add field to `Exercise` model in `backend/workouts/models.py`
2. Create and run migration: `python manage.py makemigrations && python manage.py migrate`
3. Add field to `ExerciseSerializer` in `backend/workouts/serializers.py`
4. Update frontend exercise display components as needed

### Adding a New Analytics Metric
1. Implement calculation function in `backend/workouts/analytics.py`
2. Add view in `backend/workouts/api/analytics/views.py`
3. Register URL in `backend/workouts/api/analytics/urls.py`
4. Add API method in `frontend/src/api.js`
5. Create visualization component in `frontend/src/components/analytics/`

### Modifying API Response Format
1. Update serializer in `backend/workouts/serializers.py`
2. Test via Django admin or `/api/docs/` Swagger UI
3. Update TypeScript/JSDoc types in frontend if used
4. Update components that consume the data

## Environment Variables

### Backend (`backend/.env`)
```
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=<password>
DB_HOST=<host>
DB_PORT=6543
DATABASE_URL=<full connection string>  # Takes precedence over above
```

### Frontend
- `.env.development`: `REACT_APP_API_URL=http://127.0.0.1:8000`
- `.env.production`: `REACT_APP_API_URL=<production URL>`

## Testing
- Backend: No test suite currently configured. Tests would go in `workouts/tests.py`
- Frontend: Jest configured via Create React App. Run with `npm test`

## Deployment
- Backend is configured for deployment with Gunicorn (see `requirements.txt`)
- Static files collected via `python manage.py collectstatic` into `backend/staticfiles/`
- Frontend builds to `frontend/build/` directory
- See `backend/Dockerfile` and `backend/fly.toml` for deployment configuration
