from flask import Blueprint, jsonify, request
from flask_login import login_required, current_user
from app import db
from app.models import StudySession
from datetime import datetime, timedelta, timezone

api_bp = Blueprint('api', __name__)

@api_bp.route('/sessions', methods=['GET'])
@login_required
def get_sessions():
    sessions = current_user.sessions.order_by(StudySession.start_time.desc()).limit(50).all()
    return jsonify([session.to_dict() for session in sessions])

@api_bp.route('/sessions', methods=['POST'])
@login_required
def create_session():
    data = request.get_json()
    if not data or 'start_time' not in data or 'end_time' not in data or 'duration_seconds' not in data:
        return jsonify({'error': 'Bad request'}), 400
        
    try:
        start_time = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        end_time = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
        
    session = StudySession(
        user_id=current_user.id,
        start_time=start_time,
        end_time=end_time,
        duration_seconds=data['duration_seconds'],
        date=start_time.date()
    )
    db.session.add(session)
    db.session.commit()
    
    return jsonify(session.to_dict()), 201

@api_bp.route('/sessions/<int:id>', methods=['DELETE'])
@login_required
def delete_session(id):
    session = current_user.sessions.filter_by(id=id).first()
    if session is None:
        return jsonify({'error': 'Not found'}), 404
        
    db.session.delete(session)
    db.session.commit()
    return '', 204

@api_bp.route('/stats', methods=['GET'])
@login_required
def get_stats():
    # Calculate streak, total hours, and weekly data
    today = datetime.now(timezone.utc).date()
    
    # Total hours
    all_sessions = current_user.sessions.all()
    total_seconds = sum(session.duration_seconds for session in all_sessions)
    total_hours = total_seconds / 3600
    
    # Today's hours
    today_sessions = [s for s in all_sessions if s.date == today]
    today_seconds = sum(session.duration_seconds for session in today_sessions)
    today_hours = today_seconds / 3600
    
    # Weekly data (last 7 days)
    weekly_data = []
    weekly_labels = []
    
    for i in range(6, -1, -1):
        d = today - timedelta(days=i)
        weekly_labels.append(d.strftime('%a'))
        day_sessions = [s for s in all_sessions if s.date == d]
        day_seconds = sum(session.duration_seconds for session in day_sessions)
        weekly_data.append(day_seconds / 3600)  # Convert to hours for graph
        
    # Streak calculation
    streak = 0
    current_date = today
    
    # Check if user studied today
    studied_today = any(s.date == today for s in all_sessions)
    if studied_today:
        streak = 1
        current_date = today - timedelta(days=1)
    else:
        # If haven't studied today, check if studied yesterday to keep streak active
        studied_yesterday = any(s.date == (today - timedelta(days=1)) for s in all_sessions)
        if studied_yesterday:
            current_date = today - timedelta(days=1)
        else:
            streak = 0
            
    if streak > 0 or studied_yesterday:
        while True:
            if any(s.date == current_date for s in all_sessions):
                if current_date != today and not (current_date == today - timedelta(days=1) and not studied_today):
                    # We already counted today, and yesterday is only counted if we didn't study today
                    # Wait, simple loop:
                    pass
            
            # Re-evaluating streak calculation properly:
            break # Let's rewrite the streak logic below cleanly
            
    # Clean streak logic
    unique_study_dates = sorted(list(set(s.date for s in all_sessions)), reverse=True)
    streak = 0
    if unique_study_dates:
        # Start checking from today
        check_date = today
        if check_date in unique_study_dates:
            streak += 1
            check_date -= timedelta(days=1)
        elif (check_date - timedelta(days=1)) in unique_study_dates:
            # Haven't studied today yet, but studied yesterday (streak still alive)
            check_date -= timedelta(days=1)
        else:
            streak = 0
            
        if streak > 0 or (check_date == today - timedelta(days=1)):
            while check_date in unique_study_dates:
                streak += 1
                check_date -= timedelta(days=1)
                

    return jsonify({
        'total_hours': round(total_hours, 1),
        'today_hours': round(today_hours, 2),
        'daily_goal': current_user.daily_goal_hours,
        'streak': streak,
        'weekly_labels': weekly_labels,
        'weekly_data': [round(h, 2) for h in weekly_data]
    })
