# FitApp - Fitness Tracking Application

A comprehensive full-stack fitness tracking application that allows users to log workouts, track exercises, and gain insights into their training through advanced analytics.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.9+-blue.svg)
![Django](https://img.shields.io/badge/django-5.2-green.svg)
![React](https://img.shields.io/badge/react-18.2-blue.svg)

## Features

### Workout Logging
- **Create and track workouts** with customizable names and dates
- **Log exercises** with sets, reps, and weights per set
- **Exercise library** with 700+ pre-defined exercises across all major muscle groups
- **Custom exercises** - Create your own exercises with specific muscle group targeting
- **Exercise history** - Automatically prefill weights and reps from your previous sessions
- **Recency tracking** - See how many days since you last performed each exercise

### Analytics Dashboard
- **Weekly Volume Tracking** - Visualize your total training volume over time
- **Weekly Frequency** - Track how many workouts you complete each week
- **Muscle Group Analysis**:
  - Volume distribution by muscle group (chest, back, shoulders, arms, legs, core)
  - Current week vs. last week comparisons
  - Balance scores to identify undertrained or overemphasized muscle groups
  - Recency indicators showing days since each muscle group was last trained
- **Top Workouts** - See your highest volume training sessions
- **Interactive charts** powered by Recharts with week-by-week breakdowns

### User Management
- **Secure authentication** with JWT tokens
- **Automatic token refresh** for seamless user experience
- **User-specific data isolation** - Each user only sees their own workouts and exercises

## Tech Stack

### Backend
- **Django 5.2** - Python web framework
- **Django REST Framework** - RESTful API
- **PostgreSQL** - Production database
- **djangorestframework-simplejwt** - JWT authentication
- **drf-spectacular** - OpenAPI/Swagger documentation
- **Gunicorn** - WSGI HTTP server for production

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **Recharts** - Data visualization
- **Axios** - HTTP client with request/response interceptors
- **date-fns** - Date manipulation
- **Framer Motion** - Animations
- **React Hook Form + Zod** - Form validation

## Getting Started

### Prerequisites
- **Python 3.9+**
- **Node.js 16+** and npm
- **PostgreSQL** (for production) or SQLite (for development)

### Backend Setup

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Create a virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**:
   Create a `.env` file in the `backend` directory:
   ```env
   # PostgreSQL Configuration
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432

   # Or use a single DATABASE_URL (takes precedence)
   # DATABASE_URL=postgresql://user:password@host:port/database
   ```

5. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

6. **Create a superuser** (optional, for admin access):
   ```bash
   python manage.py createsuperuser
   ```

7. **Load initial exercise data** (optional):
   ```bash
   # If you have a fixture file with exercises
   python manage.py loaddata exercises
   ```

8. **Start the development server**:
   ```bash
   python manage.py runserver
   ```

   The API will be available at `http://127.0.0.1:8000/api/`

### Frontend Setup

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create `.env.development` in the `frontend` directory:
   ```env
   REACT_APP_API_URL=http://127.0.0.1:8000
   ```

4. **Start the development server**:
   ```bash
   npm start
   ```

   The application will open at `http://localhost:3000`

## Development

### Backend Development

#### Running the Development Server
```bash
cd backend
python manage.py runserver
```

#### Creating Migrations
After modifying models in `workouts/models.py`:
```bash
python manage.py makemigrations
python manage.py migrate
```

#### Accessing the Admin Panel
Navigate to `http://127.0.0.1:8000/admin/` and log in with your superuser credentials.

#### API Documentation
Interactive API documentation is available at:
- **Swagger UI**: `http://127.0.0.1:8000/api/docs/`
- **OpenAPI Schema**: `http://127.0.0.1:8000/api/schema/`

#### Running Tests
```bash
python manage.py test
```

### Frontend Development

#### Development Server
```bash
cd frontend
npm start
```

#### Running Tests
```bash
npm test
```

#### Building for Production
```bash
npm run build
# Or with production environment variables
npm run build:prod
```

#### Linting
The project uses ESLint (configured via react-scripts):
```bash
npm run lint
```

## Project Structure

```
fitapp/
├── backend/
│   ├── backend/
│   │   ├── settings.py          # Django settings
│   │   ├── urls.py               # Root URL configuration
│   │   └── wsgi.py               # WSGI entry point
│   ├── workouts/
│   │   ├── models.py             # Data models (Exercise, Workout, PerformedExercise)
│   │   ├── views.py              # DRF ViewSets
│   │   ├── serializers.py        # DRF Serializers
│   │   ├── analytics.py          # Analytics calculation functions
│   │   ├── services/             # Business logic layer
│   │   ├── permissions/          # Custom DRF permissions
│   │   ├── exceptions/           # Custom exception handlers
│   │   └── api/
│   │       └── analytics/        # Analytics API endpoints
│   ├── manage.py
│   └── requirements.txt
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── analytics/        # Analytics dashboard components
│   │   │   ├── workoutLogger/    # Workout logging components
│   │   │   └── ui/               # Reusable UI components (shadcn/ui)
│   │   ├── contexts/             # React Context providers
│   │   ├── hooks/                # Custom React hooks
│   │   ├── api.js                # API client methods
│   │   ├── apiClient.js          # Axios instance with interceptors
│   │   └── App.jsx               # Root component
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/login/` - Obtain JWT tokens
- `POST /api/login/refresh/` - Refresh access token
- `POST /api/register/` - Register new user

### Workouts
- `GET /api/workouts/` - List user's workouts
- `POST /api/workouts/` - Create new workout
- `GET /api/workouts/{id}/` - Get workout details
- `PATCH /api/workouts/{id}/` - Update workout
- `DELETE /api/workouts/{id}/` - Delete workout

### Exercises
- `GET /api/exercises/` - List available exercises (system + user custom)
- `POST /api/exercises/` - Create custom exercise
- `GET /api/exercises/{id}/` - Get exercise details
- `PATCH /api/exercises/{id}/` - Update exercise
- `DELETE /api/exercises/{id}/` - Delete custom exercise

### Performed Exercises
- `GET /api/performed-exercises/` - List performed exercises
- `POST /api/performed-exercises/` - Add exercise to workout
- `PATCH /api/performed-exercises/{id}/` - Update performed exercise
- `DELETE /api/performed-exercises/{id}/` - Remove exercise from workout

### Analytics
- `GET /api/analytics/weekly-volume/` - Weekly volume data
- `GET /api/analytics/weekly-frequency/` - Weekly workout frequency
- `GET /api/analytics/top-workouts/` - Top workouts by volume
- `GET /api/analytics/muscle-groups/summary/` - Comprehensive muscle group analysis

## Key Features Explained

### Volume Calculation
Volume is calculated as: **Volume = Σ(reps × weight)** across all sets

For example, if you performed:
- Set 1: 10 reps @ 135 lbs = 1,350 lbs
- Set 2: 8 reps @ 135 lbs = 1,080 lbs
- Set 3: 8 reps @ 135 lbs = 1,080 lbs

Total volume = 3,510 lbs

Volume is precomputed on the frontend and stored in the `Workout.total_volume` field.

### Muscle Group Analytics
The application tracks six primary muscle groups:
- **Chest** - Presses, flyes, etc.
- **Back** - Rows, pull-ups, deadlifts, etc.
- **Shoulders** - Overhead presses, lateral raises, etc.
- **Arms** - Bicep curls, tricep extensions, etc.
- **Legs** - Squats, leg press, lunges, etc.
- **Core** - Planks, crunches, etc.

Analytics include:
- **Volume Distribution**: See what percentage of your training volume goes to each muscle group
- **Balance Score**: Identifies if you're overemphasizing or undertraining specific muscle groups
- **Recency**: Days since each muscle group was last trained
- **Weekly Trends**: Track changes in muscle group volume over time

### Authentication Flow
1. User logs in with username/password
2. Backend returns `access` token (short-lived) and `refresh` token (long-lived)
3. Frontend stores both tokens in localStorage
4. API client includes access token in Authorization header for all requests
5. On 401 response, client automatically attempts to refresh the token
6. If refresh succeeds, original request is retried with new token
7. If refresh fails, user is redirected to login page

## Database Schema

### Exercise Model
- `name` - Exercise name
- `muscle_group` - Primary muscle group (chest/back/shoulders/arms/legs/core)
- `is_custom` - Boolean flag for user-created exercises
- `owner` - Foreign key to User (for custom exercises)
- `force`, `level`, `mechanic`, `equipment` - Exercise metadata
- `primaryMuscles`, `secondaryMuscles` - JSON arrays
- `instructions` - JSON array of instruction steps
- `images` - JSON array of image URLs

### Workout Model
- `user` - Foreign key to User
- `date` - DateTime of workout
- `name` - Workout name
- `total_volume` - Precomputed total volume

### PerformedExercise Model
- `workout` - Foreign key to Workout
- `exercise` - Foreign key to Exercise
- `sets` - Number of sets
- `reps_per_set` - JSON array of reps (e.g., `[10, 8, 8]`)
- `weights_per_set` - JSON array of weights (e.g., `[135, 135, 135]`)

## Deployment

### Backend Deployment
1. Set environment variables for production database
2. Set `DEBUG=False` in settings
3. Configure `ALLOWED_HOSTS`
4. Collect static files: `python manage.py collectstatic`
5. Run with Gunicorn: `gunicorn backend.wsgi:application`

See `backend/Dockerfile` and `backend/fly.toml` for containerized deployment configuration.

### Frontend Deployment
1. Build the production bundle: `npm run build:prod`
2. Serve the `build/` directory with a static file server
3. Ensure the backend API URL is correctly configured in `.env.production`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Exercise data sourced from [free-exercise-db](https://github.com/yuhonas/free-exercise-db)
- UI components based on [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide React](https://lucide.dev/)
