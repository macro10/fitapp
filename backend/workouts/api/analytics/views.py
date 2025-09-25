import logging
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from ...analytics import get_weekly_volume_data, get_top_workouts_by_volume, calculate_volume_per_set
from ...models import Workout

logger = logging.getLogger('workouts')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_volume_analytics(request):
    start_time = datetime.now()
    
    logger.info(f"Weekly volume analytics requested by user {request.user.id}", extra={
        'user_id': request.user.id,
        'endpoint': 'weekly_volume_analytics',
        'start_date': request.query_params.get('start_date'),
        'end_date': request.query_params.get('end_date')
    })
    
    try:
        # Get date range from query params if provided
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        # Parse dates if provided
        if start_date:
            start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        if end_date:
            end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

        data = get_weekly_volume_data(
            user=request.user,
            start_date=start_date,
            end_date=end_date
        )

        processing_time = (datetime.now() - start_time).total_seconds()
        
        logger.info(f"Weekly volume analytics completed successfully", extra={
            'user_id': request.user.id,
            'processing_time_seconds': processing_time,
            'data_points': len(data)
        })

        return Response({
            'weekly_volumes': data
        })
        
    except Exception as e:
        processing_time = (datetime.now() - start_time).total_seconds()
        logger.error(f"Error in weekly volume analytics", extra={
            'user_id': request.user.id,
            'error': str(e),
            'processing_time_seconds': processing_time
        }, exc_info=True)
        return Response({'error': 'Internal server error'}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def top_workouts_by_volume(request):
    limit = request.query_params.get('limit', 5)
    try:
        limit = int(limit)
    except ValueError:
        limit = 5
        
    data = get_top_workouts_by_volume(
        user=request.user,
        limit=limit
    )
    
    return Response({
        'top_workouts': data
    })
