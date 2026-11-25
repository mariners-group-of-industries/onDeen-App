from datetime import datetime

from sqlalchemy import UniqueConstraint

from .. import db


class UserGamification(db.Model):
    __tablename__ = "user_gamification"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, unique=True, index=True)
    total_xp = db.Column(db.Integer, nullable=False, default=0)
    level = db.Column(db.Integer, nullable=False, default=0)
    tier_key = db.Column(db.String(32), nullable=True)
    tier_name = db.Column(db.String(64), nullable=True)
    tier_sublevel = db.Column(db.Integer, nullable=False, default=0)
    current_streak = db.Column(db.Integer, nullable=False, default=0)
    longest_streak = db.Column(db.Integer, nullable=False, default=0)
    streak_state = db.Column(db.String(32), nullable=False, default="none")
    streak_multiplier = db.Column(db.Float, nullable=False, default=1.0)
    total_sessions = db.Column(db.Integer, nullable=False, default=0)
    lifetime_hours = db.Column(db.Float, nullable=False, default=0.0)
    first_class_awarded = db.Column(db.Boolean, nullable=False, default=False)
    first_course_awarded = db.Column(db.Boolean, nullable=False, default=False)
    first_review_awarded = db.Column(db.Boolean, nullable=False, default=False)
    last_check_in_on = db.Column(db.DateTime, nullable=True)
    last_event_id = db.Column(db.Integer, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)


class GamificationStreak(db.Model):
    __tablename__ = "gamification_streak"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    current_count = db.Column(db.Integer, nullable=False, default=0)
    longest_count = db.Column(db.Integer, nullable=False, default=0)
    missed_count = db.Column(db.Integer, nullable=False, default=0)
    state = db.Column(db.String(32), nullable=False, default="none")
    multiplier = db.Column(db.Float, nullable=False, default=1.0)
    last_attendance_date = db.Column(db.Date, nullable=True)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "event_id", name="uq_gamification_streak_user_event"),
    )


class GamificationXpLog(db.Model):
    __tablename__ = "gamification_xp_log"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=True, index=True)
    participant_id = db.Column(db.Integer, db.ForeignKey("participant.id"), nullable=True, index=True)
    attendance_id = db.Column(db.Integer, db.ForeignKey("participants_attendance.id"), nullable=True, unique=True, index=True)
    xp_type = db.Column(db.String(32), nullable=False, default="check_in")
    event_title = db.Column(db.String(255), nullable=True)
    category_title = db.Column(db.String(255), nullable=True)
    session_date = db.Column(db.Date, nullable=True)
    session_hours = db.Column(db.Float, nullable=False, default=0.0)
    journey_level = db.Column(db.String(64), nullable=True)
    verification_source = db.Column(db.String(32), nullable=True)
    topic_id = db.Column(db.String(96), nullable=True)
    topic_title = db.Column(db.String(255), nullable=True)
    radar_area = db.Column(db.String(32), nullable=True, index=True)
    suitability = db.Column(db.String(64), nullable=True)
    is_recurring = db.Column(db.Boolean, nullable=True)
    base_xp = db.Column(db.Integer, nullable=False, default=0)
    difficulty_multiplier = db.Column(db.Float, nullable=False, default=1.0)
    streak_multiplier = db.Column(db.Float, nullable=False, default=1.0)
    difficulty_bonus_xp = db.Column(db.Integer, nullable=False, default=0)
    streak_bonus_xp = db.Column(db.Integer, nullable=False, default=0)
    milestone_xp = db.Column(db.Integer, nullable=False, default=0)
    total_xp = db.Column(db.Integer, nullable=False, default=0)
    previous_total_xp = db.Column(db.Integer, nullable=False, default=0)
    new_total_xp = db.Column(db.Integer, nullable=False, default=0)
    previous_level = db.Column(db.Integer, nullable=False, default=0)
    new_level = db.Column(db.Integer, nullable=False, default=0)
    previous_tier_key = db.Column(db.String(32), nullable=True)
    new_tier_key = db.Column(db.String(32), nullable=True)
    level_up_occurred = db.Column(db.Boolean, nullable=False, default=False)
    tier_change_occurred = db.Column(db.Boolean, nullable=False, default=False)
    first_class_milestone = db.Column(db.Boolean, nullable=False, default=False)
    streak_count = db.Column(db.Integer, nullable=False, default=0)
    streak_state = db.Column(db.String(32), nullable=False, default="none")
    summary_seen = db.Column(db.Boolean, nullable=False, default=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class GamificationStreakMiss(db.Model):
    __tablename__ = "gamification_streak_miss"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=False, index=True)
    participant_id = db.Column(db.Integer, db.ForeignKey("participant.id"), nullable=False, index=True)
    attendance_id = db.Column(
        db.Integer,
        db.ForeignKey("participants_attendance.id"),
        nullable=False,
        unique=True,
        index=True,
    )
    missed_date = db.Column(db.Date, nullable=False, index=True)
    consecutive_misses = db.Column(db.Integer, nullable=False, default=0)
    resulting_count = db.Column(db.Integer, nullable=False, default=0)
    resulting_state = db.Column(db.String(32), nullable=False, default="none")
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class SessionFeedback(db.Model):
    __tablename__ = "session_feedback"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False, index=True)
    event_id = db.Column(db.Integer, db.ForeignKey("event.id"), nullable=True, index=True)
    participant_id = db.Column(db.Integer, db.ForeignKey("participant.id"), nullable=True, index=True)
    attendance_id = db.Column(db.Integer, db.ForeignKey("participants_attendance.id"), nullable=True, index=True)
    gamification_xp_log_id = db.Column(db.Integer, db.ForeignKey("gamification_xp_log.id"), nullable=False, unique=True, index=True)
    session_date = db.Column(db.Date, nullable=True, index=True)
    event_title = db.Column(db.String(255), nullable=True)
    engagement_rating = db.Column(db.Integer, nullable=True)
    delivery_rating = db.Column(db.Integer, nullable=True)
    recommendation = db.Column(db.Boolean, nullable=True)
    great_points = db.Column(db.Text, nullable=True)
    suggestion = db.Column(db.Text, nullable=True)
    skipped = db.Column(db.Boolean, nullable=False, default=False)
    created_on = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "gamification_xp_log_id", name="uq_session_feedback_user_summary"),
    )
