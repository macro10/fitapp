#!/usr/bin/env python3
import re
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import sys

def analyze_logs(log_file_path):
    """Analyze Django logs for performance and error patterns"""
    
    # Track request patterns
    request_patterns = defaultdict(int)
    error_counts = Counter()
    slow_requests = []
    
    # Track user activity
    user_activity = Counter()
    
    with open(log_file_path, 'r') as f:
        for line in f:
            try:
                # Parse verbose format logs
                # Format: LEVEL TIMESTAMP MODULE MESSAGE
                # Example: INFO 2025-09-25 14:30:15 analytics.views weekly_volume_analytics requested by user 123
                parts = line.strip().split(' ', 3)
                if len(parts) < 4:
                    continue
                    
                level = parts[0]
                timestamp = parts[1]
                module = parts[2]
                message = parts[3]
                
                # Track request patterns
                if 'requested by user' in message:
                    # Extract endpoint from message
                    if 'weekly_volume_analytics' in message:
                        request_patterns['weekly_volume_analytics'] += 1
                    elif 'top_workouts_by_volume' in message:
                        request_patterns['top_workouts_by_volume'] += 1
                
                # Track user activity
                user_match = re.search(r'user (\d+)', message)
                if user_match:
                    user_id = user_match.group(1)
                    user_activity[user_id] += 1
                
                # Track performance
                processing_match = re.search(r'(\d+\.\d+)s', message)
                if processing_match and 'completed successfully' in message:
                    processing_time = float(processing_match.group(1))
                    if processing_time > 5.0:  # 5 seconds threshold
                        slow_requests.append({
                            'timestamp': timestamp,
                            'user_id': user_match.group(1) if user_match else 'unknown',
                            'endpoint': 'unknown',
                            'processing_time': processing_time
                        })
            
            except Exception as e:
                # Log parsing errors but continue processing
                print(f"Warning: Failed to parse line: {line.strip()[:100]}... Error: {e}")
                continue
    
    # Print analysis
    print("=== LOG ANALYSIS REPORT ===")
    print(f"Total requests: {sum(request_patterns.values())}")
    print(f"Active users: {len(user_activity)}")
    print(f"Slow requests (>5s): {len(slow_requests)}")
    
    # Count all log levels for error analysis
    error_levels = ['ERROR', 'CRITICAL', 'WARNING']
    error_count = sum(1 for line in open(log_file_path, 'r') if any(level in line for level in error_levels))
    
    print(f"Error count: {error_count}")
    
    print("\n=== TOP ENDPOINTS ===")
    for endpoint, count in sorted(request_patterns.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"{endpoint}: {count} requests")
    
    print("\n=== TOP USERS ===")
    for user_id, count in sorted(user_activity.items(), key=lambda x: x[1], reverse=True)[:5]:
        print(f"User {user_id}: {count} requests")
    
    if slow_requests:
        print("\n=== SLOWEST REQUESTS ===")
        for req in sorted(slow_requests, key=lambda x: x['processing_time'], reverse=True)[:5]:
            print(f"{req['endpoint']} - {req['processing_time']:.2f}s - User {req['user_id']}")

if __name__ == "__main__":
    log_file = "/app/logs/django.log"  # Adjust path as needed
    analyze_logs(log_file)