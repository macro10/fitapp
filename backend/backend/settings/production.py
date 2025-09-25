from .base import *

DEBUG = False
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', '3948473294859')

# Only accept requests intended for my actual domain.
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# Only allows my domain to make API requests.
CORS_ALLOWED_ORIGINS = [
    f"https://{host}" for host in ALLOWED_HOSTS
]

# All communication should be encrypted in transit, (redirect HTTP to HTTPS).
SECURE_SSL_REDIRECT = True

# Security tokens should only be transmitted over secure channels.
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Once a user visits your site over HTTPS, their browser should never attempt HTTP again. (Prevents downgrade attacks)
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Trust Fly.io's proxy headers, but verify the headers
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True
USE_X_FORWARDED_PORT = True

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    "whitenoise.middleware.WhiteNoiseMiddleware",
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
STATIC_ROOT = BASE_DIR / "staticfiles"

REST_FRAMEWORK['DEFAULT_PERMISSION_CLASSES'] = [
    'rest_framework.permissions.IsAuthenticated'
]

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
            'formatter': 'verbose',
        },
        'rotating_file': {
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': os.path.join(BASE_DIR, 'logs/django.log'),
            'formatter': 'verbose',
            'maxBytes': 10 * 1024 * 1024,  # 10MB
            'backupCount': 5,
        },
    },
    'root': {
        'level': 'INFO',
        'handlers': ['console', 'rotating_file'],
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'rotating_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'workouts': {  # Your app-specific logs
            'handlers': ['console', 'rotating_file'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.request': {
            'handlers': ['console', 'rotating_file'],
            'level': 'WARNING',
            'propagate': False,
        },
        'django.db.backends': {  # Database query logging
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}