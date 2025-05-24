from rest_framework.views import exception_handler
from rest_framework.response import Response
from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from rest_framework import status

def custom_exception_handler(exc, context):
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)

    if response is not None:
        # Add custom error format
        error_data = {
            'error': {
                'code': getattr(exc, 'default_code', 'error'),
                'message': str(exc),
                'status': response.status_code
            }
        }
        return Response(error_data, status=response.status_code)

    # Handle Django's ValidationError
    if isinstance(exc, ValidationError):
        error_data = {
            'error': {
                'code': 'validation_error',
                'message': str(exc),
                'status': status.HTTP_400_BAD_REQUEST
            }
        }
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)

    # Handle Django's IntegrityError
    if isinstance(exc, IntegrityError):
        error_data = {
            'error': {
                'code': 'integrity_error',
                'message': 'Database integrity error occurred.',
                'status': status.HTTP_400_BAD_REQUEST
            }
        }
        return Response(error_data, status=status.HTTP_400_BAD_REQUEST)

    # Handle unexpected errors
    error_data = {
        'error': {
            'code': 'server_error',
            'message': 'An unexpected error occurred.',
            'status': status.HTTP_500_INTERNAL_SERVER_ERROR
        }
    }
    return Response(error_data, status=status.HTTP_500_INTERNAL_SERVER_ERROR)