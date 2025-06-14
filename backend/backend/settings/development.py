from .base import *

DEBUG = True
SECRET_KEY = 'django-insecure-5&3zc_@lt9kbcn_w=%!eg-6ly*1o^bhhg&$g2_-md$&+yruxbj'
ALLOWED_HOSTS = ['localhost', '127.0.0.1']

# Development-specific settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8000",
    "http://127.0.0.1:8000",
    "http://localhost:3000",  # React development server
]

REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
    'rest_framework.permissions.AllowAny'
]
