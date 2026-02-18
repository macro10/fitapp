#!/bin/bash
# compact-context.sh
# Re-injects project context after conversation compaction.
# Used as a SessionStart hook with "compact" matcher.

cat <<'CONTEXT'
Project: fitapp - Full-stack fitness tracking application

Architecture:
- Backend: Django 5.2 + Django REST Framework (backend/)
- Frontend: React 18 + Vite + Tailwind CSS + Shadcn UI (frontend/)
- Database: PostgreSQL
- Auth: JWT via djangorestframework-simplejwt
- Deployment: Docker + Fly.io

Key conventions:
- Backend uses a service layer pattern (workouts/services/)
- API views are in workouts/views.py and workouts/api/
- Frontend state management uses React Context (contexts/)
- Custom React hooks are in frontend/src/hooks/
- UI components use Shadcn UI (frontend/src/components/ui/)
- Run backend with: python manage.py runserver (from backend/)
- Run frontend with: npm start (from frontend/)
- Backend tests: python manage.py test (from backend/)
- Frontend tests: npm test (from frontend/)
CONTEXT

exit 0
