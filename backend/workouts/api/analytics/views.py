from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from datetime import datetime
from ...analytics import get_weekly_volume_data, get_top_workouts_by_volume, calculate_volume_per_set
from ...models import Workout

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def weekly_volume_analytics(request):
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

    return Response({
        'weekly_volumes': data
    })

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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def muscle_groups_summary(request):
    try:
        weeks = int(request.query_params.get('weeks', 12))
    except (TypeError, ValueError):
        weeks = 12
    try:
        current_window = int(request.query_params.get('currentWindow', 2))
    except (TypeError, ValueError):
        current_window = 2
    try:
        threshold = float(request.query_params.get('threshold', 0.2))
    except (TypeError, ValueError):
        threshold = 0.2

    from ...analytics import muscle_groups_summary as compute_summary
    data = compute_summary(
        user=request.user,
        weeks=weeks,
        current_window=current_window,
        threshold=threshold
    )
    return Response(data)