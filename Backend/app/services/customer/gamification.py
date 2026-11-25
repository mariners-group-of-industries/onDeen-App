import csv
import json
import re
from datetime import datetime, timedelta
from io import StringIO
from math import ceil
from zoneinfo import ZoneInfo

from sqlalchemy import func, inspect, text

from app import db
from app.models.category import Category, SubCategory
from app.models.event import Event, JourneyLevel, Language, Participant, ParticipantsAttendance
from app.models.organization import Organization
from app.models.users import Users
from app.models.gamification import (
    GamificationStreak,
    GamificationStreakMiss,
    GamificationXpLog,
    SessionFeedback,
    UserGamification,
)
from app.utils.custom_exception import ServiceError


LEVEL_THRESHOLDS = [
    (1, 100), (2, 383), (3, 903), (4, 1703), (5, 2821),
    (6, 4291), (7, 6143), (8, 8406), (9, 11106), (10, 14268),
    (11, 17916), (12, 22073), (13, 26760), (14, 31998), (15, 37807),
    (16, 44207), (17, 51216), (18, 58853), (19, 67135), (20, 76079),
    (21, 85702), (22, 96021), (23, 107051), (24, 118809), (25, 131309),
    (26, 144566), (27, 158596), (28, 173412), (29, 189029), (30, 205461),
]

TIERS = {
    "seeker": {
        "name": "Seeker",
        "arabic": "طالب",
        "transliteration": "Talib",
        "meaning": "One who seeks knowledge",
    },
    "voyager": {
        "name": "Voyager",
        "arabic": "راحل",
        "transliteration": "Rahil",
        "meaning": "One on a journey",
    },
    "pathfinder": {
        "name": "Pathfinder",
        "arabic": "دليل",
        "transliteration": "Dalil",
        "meaning": "One who has found the path and can guide others",
    },
}

RADAR_TARGET_HOURS = {
    "Knowledge": 8.0,
    "Fitness": 4.0,
    "Community": 4.0,
    "Tazkiyyah": 4.0,
}

ACTIVITY_CLASSIFICATIONS = {
    "tafsir": ("TAFSIR", "Tafsir", "Knowledge"),
    "quran tajwid technical recitation": ("QURAN_TAJWID", "Quran - Tajwid / technical recitation", "Knowledge"),
    "tajwid": ("QURAN_TAJWID", "Quran - Tajwid / technical recitation", "Knowledge"),
    "quran": ("QURAN", "Quran", "Knowledge"),
    "fiqh": ("FIQH", "Fiqh", "Knowledge"),
    "fiqh general": ("FIQH_GENERAL", "Fiqh general", "Knowledge"),
    "fiqh madhhab": ("FIQH_MADHHAB", "Fiqh madhhab", "Knowledge"),
    "arabic": ("ARABIC", "Arabic", "Knowledge"),
    "sirah": ("SIRAH", "Sirah", "Knowledge"),
    "seerah": ("SIRAH", "Sirah", "Knowledge"),
    "aqidah": ("AQIDAH", "Aqidah", "Knowledge"),
    "islamic history": ("ISLAMIC_HISTORY", "Islamic history", "Knowledge"),
    "hadith": ("HADITH_SCIENCES", "Hadith sciences", "Knowledge"),
    "hadith sciences": ("HADITH_SCIENCES", "Hadith sciences", "Knowledge"),
    "mosque tour": ("EDUCATIONAL_MOSQUE_TOUR", "Educational mosque tour", "Knowledge"),
    "educational mosque tour": ("EDUCATIONAL_MOSQUE_TOUR", "Educational mosque tour", "Knowledge"),
    "islamic conference": ("ISLAMIC_CONFERENCE", "Islamic conference", "Knowledge"),
    "islamic workshop": ("ISLAMIC_WORKSHOP", "Islamic workshop", "Knowledge"),
    "quran memorisation": ("QURAN_MEMORISATION", "Quran - memorisation and recitation", "Tazkiyyah"),
    "quran memorization": ("QURAN_MEMORISATION", "Quran - memorisation and recitation", "Tazkiyyah"),
    "quran memorisation and recitation": ("QURAN_MEMORISATION", "Quran - memorisation and recitation", "Tazkiyyah"),
    "quran tadabbur reflection": ("QURAN_TADABBUR", "Quran - tadabbur / reflection", "Tazkiyyah"),
    "hajj programme": ("HAJJ_PROGRAMME", "Hajj programme", "Tazkiyyah"),
    "umrah programme": ("UMRAH_PROGRAMME", "Umrah programme", "Tazkiyyah"),
    "ramadan programme": ("RAMADAN_PROGRAMME", "Ramadan programme", "Tazkiyyah"),
    "dhikr adhkar circle": ("DHIKR_CIRCLE", "Dhikr / adhkar circle", "Tazkiyyah"),
    "purification of the heart": ("PURIFICATION_HEART", "Purification of the heart", "Tazkiyyah"),
    "worship retreat": ("WORSHIP_RETREAT", "Worship retreat / itikaf", "Tazkiyyah"),
    "worship retreat itikaf": ("WORSHIP_RETREAT", "Worship retreat / itikaf", "Tazkiyyah"),
    "itikaf": ("WORSHIP_RETREAT", "Worship retreat / itikaf", "Tazkiyyah"),
    "cycling sports day": ("CYCLING_SPORTS_DAY", "Cycling / sports day", "Fitness"),
    "martial arts": ("MARTIAL_ARTS", "Martial arts", "Fitness"),
    "bootcamp organised exercise": ("BOOTCAMP", "Bootcamp / organised exercise", "Fitness"),
    "health and physical wellbeing retreat": ("HEALTH_RETREAT", "Health and physical-wellbeing retreat", "Fitness"),
    "community event": ("COMMUNITY_EVENT", "Community event", "Community"),
    "volunteering day": ("VOLUNTEER", "Volunteering day", "Community"),
    "community service": ("COMMUNITY_SERVICE", "Community service", "Community"),
    "community fundraiser": ("FUNDRAISER", "Fundraiser / charity gala", "Community"),
    "fundraiser charity gala": ("FUNDRAISER", "Fundraiser / charity gala", "Community"),
    "brotherhood sisterhood gathering": ("BROTHERHOOD_GATHERING", "Brotherhood / sisterhood gathering", "Community"),
    "community social family event": ("COMMUNITY_SOCIAL", "Community social / family event", "Community"),
    "youth club isoc": ("YOUTH_CLUB", "Youth club / ISOC", "Community"),
    "isoc activity": ("YOUTH_CLUB", "Youth club / ISOC", "Community"),
    "community iftar": ("COMMUNITY_IFTAR", "Community iftar", "Community"),
    "rijal club community event": ("RIJAL_CLUB", "Rijal Club-style community event", "Community"),
    "rijal club style community event": ("RIJAL_CLUB", "Rijal Club-style community event", "Community"),
}

CATEGORY_RADAR_DEFAULTS = {
    "events": "Community",
    "courses": "Knowledge",
    "mosque tours": "Knowledge",
    "retreats": "Tazkiyyah",
    "fundraisers": "Community",
    "isoc": "Community",
    "conferences": "Knowledge",
    "workshops": "Knowledge",
    "hajj umrah": "Tazkiyyah",
}

# Product-owner taxonomy from the gamification annex.  The outer keys are the
# existing listing types used by both apps; the values are the exact organiser-
# facing topic labels.  Aliases remain in ACTIVITY_CLASSIFICATIONS so legacy
# listings continue to resolve to the same immutable Radar axis.
CANONICAL_ACTIVITY_TOPICS = {
    "Events": [
        "Volunteering day",
        "Community service",
        "Brotherhood / sisterhood gathering",
        "Community social / family event",
        "Community iftar",
        "Rijal Club-style community event",
    ],
    "Courses": [
        "Tafsir",
        "Quran - Tajwid / technical recitation",
        "Fiqh general",
        "Fiqh madhhab",
        "Arabic",
        "Sirah",
        "Aqidah",
        "Islamic history",
        "Hadith sciences",
        "Quran - memorisation and recitation",
        "Quran - tadabbur / reflection",
        "Ramadan programme",
        "Dhikr / adhkar circle",
        "Purification of the heart",
    ],
    "Mosque Tours": ["Educational mosque tour"],
    "Retreats": [
        "Worship retreat / itikaf",
        "Health and physical-wellbeing retreat",
    ],
    "Fundraisers": ["Fundraiser / charity gala"],
    "ISOC": [
        "Cycling / sports day",
        "Martial arts",
        "Bootcamp / organised exercise",
        "Youth club / ISOC",
    ],
    "Conferences": [],
    "Workshops": [],
    "Hajj & Umrah": ["Hajj programme", "Umrah programme"],
}


class GamificationService:
    @staticmethod
    def ensure_storage():
        for model in (
            UserGamification,
            GamificationStreak,
            GamificationStreakMiss,
            GamificationXpLog,
            SessionFeedback,
        ):
            model.__table__.create(bind=db.engine, checkfirst=True)
        GamificationService._ensure_activity_classification_schema()
        GamificationService._ensure_organization_public_contact_schema()
        GamificationService._ensure_listing_reference_data()
        GamificationService._ensure_xp_log_schema()
        GamificationService._ensure_session_feedback_schema()

    @staticmethod
    def _ensure_listing_reference_data():
        """Idempotently add the non-payment listing dimensions from REFS.

        Existing categories, topics and events are preserved.  This routine is
        deliberately additive so it is safe for a live Railway database that
        already contains organiser-created listings.
        """
        inspector = inspect(db.engine)
        table_names = set(inspector.get_table_names())
        required_tables = {"language", "category", "subcategory", "event", "users"}
        if not required_tables.issubset(table_names):
            return

        changed = False
        languages = {}
        for title in ("English", "Arabic"):
            language = Language.query.filter(func.lower(Language.title) == title.lower()).first()
            if language is None:
                language = Language(
                    title=title,
                    ar_title=title,
                    status=1,
                    created_by=0,
                    updated_by=0,
                )
                db.session.add(language)
                db.session.flush()
                changed = True
            elif language.status != 1:
                language.status = 1
                changed = True
            languages[title] = language

        creator = Users.query.order_by(Users.id.asc()).first()
        if creator is not None:
            for category_title, topic_titles in CANONICAL_ACTIVITY_TOPICS.items():
                category = Category.query.filter(
                    func.lower(Category.title) == category_title.lower(),
                    Category.status == 1,
                ).first()
                if category is None:
                    continue

                next_position = max(
                    [subcategory.position or 0 for subcategory in category.subcategories] or [0]
                )
                existing_topics = {
                    GamificationService._normalize_classification_name(subcategory.title): subcategory
                    for subcategory in category.subcategories
                }
                for topic_title in topic_titles:
                    normalized_title = GamificationService._normalize_classification_name(topic_title)
                    classification = GamificationService.classification_for_topic(
                        topic_title,
                        category_title,
                    )
                    existing_topic = existing_topics.get(normalized_title)
                    if existing_topic is not None:
                        for field_name, value in (
                            ("status", 1),
                            ("topic_key", classification["topic_id"]),
                            ("radar_area", classification["radar_area"]),
                            ("classification_description", classification["description"]),
                        ):
                            if getattr(existing_topic, field_name) != value:
                                setattr(existing_topic, field_name, value)
                                changed = True
                        continue
                    next_position += 1
                    new_topic = SubCategory(
                        category_id=category.id,
                        title=topic_title,
                        ar_title=topic_title,
                        image=category.image,
                        topic_key=classification["topic_id"],
                        radar_area=classification["radar_area"],
                        classification_description=classification["description"],
                        position=next_position,
                        status=1,
                        created_by=creator.id,
                        updated_by=creator.id,
                    )
                    db.session.add(new_topic)
                    existing_topics[normalized_title] = new_topic
                    changed = True

        english_id = languages["English"].id
        if english_id:
            for event in Event.query.filter(Event.language_id.is_(None)).all():
                event.language_id = english_id
                changed = True
        for event in Event.query.filter((Event.gender.is_(None)) | (Event.gender == 0)).all():
            event.gender = 3
            changed = True

        # ``Suitable for all`` is an organiser-facing event suitability, never
        # a User learning preference.  Repair only customer rows left behind
        # by the old shared-field seed; organiser and speaker rows are kept.
        suitable_for_all = JourneyLevel.query.filter(
            func.lower(JourneyLevel.title) == "suitable for all",
            JourneyLevel.status == 1,
        ).first()
        beginner = JourneyLevel.query.filter(
            func.lower(JourneyLevel.title) == "beginner",
            JourneyLevel.status == 1,
        ).first()
        if suitable_for_all is not None and beginner is not None:
            repaired_users = Users.query.filter_by(
                role_type=2,
                journey_level_id=suitable_for_all.id,
            ).update(
                {Users.journey_level_id: beginner.id},
                synchronize_session=False,
            )
            changed = changed or repaired_users > 0

        if changed:
            db.session.commit()

    @staticmethod
    def _ensure_organization_public_contact_schema():
        """Add public organisation contacts without changing login identities."""
        inspector = inspect(db.engine)
        if "organizations" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("organizations")}
        column_statements = {
            "public_email_id": "ALTER TABLE organizations ADD COLUMN public_email_id VARCHAR(200)",
            "public_country_code": "ALTER TABLE organizations ADD COLUMN public_country_code VARCHAR(10)",
            "public_mobile_number": "ALTER TABLE organizations ADD COLUMN public_mobile_number VARCHAR(100)",
        }
        statements = [statement for name, statement in column_statements.items() if name not in existing_columns]
        if statements:
            with db.engine.begin() as connection:
                for statement in statements:
                    connection.execute(text(statement))

        rijal_club = Organization.query.filter(
            func.lower(Organization.organization_name) == "the rijal club"
        ).first()
        if rijal_club is None:
            return

        changed = False
        reference_contact = {
            "public_email_id": "therijalclub@gmail.com",
            "public_country_code": "+44",
            "public_mobile_number": "7392007576",
        }
        for field_name, value in reference_contact.items():
            if not getattr(rijal_club, field_name, None):
                setattr(rijal_club, field_name, value)
                changed = True
        if changed:
            db.session.commit()

    @staticmethod
    def _ensure_xp_log_schema():
        inspector = inspect(db.engine)
        if "gamification_xp_log" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("gamification_xp_log")}
        column_statements = {
            "verification_source": "ALTER TABLE gamification_xp_log ADD COLUMN verification_source VARCHAR(32)",
            "topic_id": "ALTER TABLE gamification_xp_log ADD COLUMN topic_id VARCHAR(96)",
            "topic_title": "ALTER TABLE gamification_xp_log ADD COLUMN topic_title VARCHAR(255)",
            "radar_area": "ALTER TABLE gamification_xp_log ADD COLUMN radar_area VARCHAR(32)",
            "suitability": "ALTER TABLE gamification_xp_log ADD COLUMN suitability VARCHAR(64)",
            "is_recurring": "ALTER TABLE gamification_xp_log ADD COLUMN is_recurring BOOLEAN",
        }
        statements = [statement for name, statement in column_statements.items() if name not in existing_columns]
        if not statements:
            return

        with db.engine.begin() as connection:
            for statement in statements:
                connection.execute(text(statement))

    @staticmethod
    def _normalize_classification_name(value):
        return re.sub(r"[^a-z0-9]+", " ", str(value or "").strip().lower()).strip()

    @staticmethod
    def classification_for_topic(topic_title, category_title=None):
        topic_key = GamificationService._normalize_classification_name(topic_title)
        configured = ACTIVITY_CLASSIFICATIONS.get(topic_key)
        if configured:
            stable_id, display_name, radar_area = configured
        else:
            category_key = GamificationService._normalize_classification_name(category_title)
            stable_id = GamificationService._topic_id(topic_title or category_title)
            display_name = topic_title or category_title or "Unclassified"
            radar_area = CATEGORY_RADAR_DEFAULTS.get(category_key, "Knowledge")
        return {
            "topic_id": stable_id,
            "display_name": display_name,
            "radar_area": radar_area,
            "description": f"Verified attendance contributes scheduled hours to {radar_area}.",
        }

    @staticmethod
    def _ensure_activity_classification_schema():
        inspector = inspect(db.engine)
        if "subcategory" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("subcategory")}
        column_statements = {
            "topic_key": "ALTER TABLE subcategory ADD COLUMN topic_key VARCHAR(96)",
            "radar_area": "ALTER TABLE subcategory ADD COLUMN radar_area VARCHAR(32)",
            "classification_description": "ALTER TABLE subcategory ADD COLUMN classification_description TEXT",
        }
        statements = [statement for name, statement in column_statements.items() if name not in existing_columns]
        if statements:
            with db.engine.begin() as connection:
                for statement in statements:
                    connection.execute(text(statement))

        changed = False
        for subcategory in SubCategory.query.all():
            classification = GamificationService.classification_for_topic(
                subcategory.title,
                subcategory.category.title if subcategory.category else None,
            )
            expected = {
                "topic_key": classification["topic_id"],
                "radar_area": classification["radar_area"],
                "classification_description": classification["description"],
            }
            for field_name, value in expected.items():
                if getattr(subcategory, field_name, None) != value:
                    setattr(subcategory, field_name, value)
                    changed = True
        if changed:
            db.session.commit()

    @staticmethod
    def _ensure_session_feedback_schema():
        inspector = inspect(db.engine)
        if "session_feedback" not in inspector.get_table_names():
            return

        existing_columns = {column["name"] for column in inspector.get_columns("session_feedback")}
        statements = []
        if "recommendation" not in existing_columns:
            statements.append("ALTER TABLE session_feedback ADD COLUMN recommendation BOOLEAN")
        if "great_points" not in existing_columns:
            statements.append("ALTER TABLE session_feedback ADD COLUMN great_points TEXT")

        if not statements:
            return

        with db.engine.begin() as connection:
            for statement in statements:
                connection.execute(text(statement))

    @staticmethod
    def difficulty_multiplier(journey_level):
        title = (journey_level or "").strip().lower()
        if title == "intermediate":
            return 1.3
        if title == "advanced":
            return 1.6
        return 1.0

    @staticmethod
    def _topic_id(value):
        normalized = re.sub(r"[^a-z0-9]+", "_", str(value or "").strip().lower()).strip("_")
        return normalized.upper()[:96] or "UNCLASSIFIED"

    @staticmethod
    def radar_area_for_topic(*values):
        topic_title = next((value for value in values if value), None)
        category_title = values[1] if len(values) > 1 else None
        return GamificationService.classification_for_topic(topic_title, category_title)["radar_area"]

    @staticmethod
    def verified_activity_dimensions(event, source="verified_check_in"):
        category_title = event.category.title if getattr(event, "category", None) else None
        subcategory_title = event.subcategory.title if getattr(event, "subcategory", None) else None
        topic_title = subcategory_title or category_title or event.title or "Unclassified"
        classification = GamificationService.classification_for_topic(subcategory_title, category_title)
        persisted_topic_id = getattr(event.subcategory, "topic_key", None) if getattr(event, "subcategory", None) else None
        persisted_radar_area = getattr(event.subcategory, "radar_area", None) if getattr(event, "subcategory", None) else None
        suitability = event.journey_level.title if getattr(event, "journey_level", None) else "Suitable for all"
        is_recurring = bool(
            int(getattr(event, "occusr_type", 0) or 0) in {2, 3, 4}
            or int(getattr(event, "total_no_class", 0) or 0) > 1
        )
        return {
            "verification_source": source,
            "topic_id": persisted_topic_id or classification["topic_id"],
            "topic_title": topic_title,
            "radar_area": persisted_radar_area or classification["radar_area"],
            "suitability": suitability,
            "is_recurring": is_recurring,
        }

    @staticmethod
    def radar_score(hours, target_hours):
        safe_hours = max(0.0, float(hours or 0))
        safe_target = max(0.01, float(target_hours or 0))
        return min(100, int(round(100 * safe_hours / safe_target)))

    @staticmethod
    def radar_state(score):
        if score <= 25:
            return "quiet"
        if score <= 60:
            return "building"
        return "strong"

    @staticmethod
    def completion_bonus_for_attendance(scheduled_sessions, attended_sessions):
        scheduled = max(1, int(scheduled_sessions or 0))
        attended = max(0, min(scheduled, int(attended_sessions or 0)))
        attendance_rate = attended / scheduled
        full_bonus = min(3000, scheduled * 150)
        if attendance_rate >= 0.8:
            return full_bonus
        if attendance_rate >= 0.6:
            return int(round(full_bonus * 0.5))
        return 0

    @staticmethod
    def streak_after_miss(current_count, consecutive_misses):
        count = max(0, int(current_count or 0))
        misses = max(0, int(consecutive_misses or 0))
        if count <= 0:
            return 0, "none", 1.0
        if misses == 1:
            return count, "dimmed", 1.0
        if misses == 2:
            return count, "ember", 1.0
        if misses >= 3:
            return 0, "none", 1.0
        multiplier, state = GamificationService.streak_multiplier(count)
        return count, state, multiplier

    @staticmethod
    def streak_multiplier(count):
        if count >= 8:
            return 2.0, "strong"
        if count == 7:
            return 1.75, "strong"
        if count >= 5:
            return 1.5, "strong"
        if count >= 3:
            return 1.25, "strong"
        if count >= 1:
            return 1.0, "building"
        return 1.0, "none"

    @staticmethod
    def tier_for_level(level):
        if level <= 0:
            return None, None, 0
        if level <= 10:
            return "seeker", TIERS["seeker"], level
        if level <= 20:
            return "voyager", TIERS["voyager"], level - 10
        return "pathfinder", TIERS["pathfinder"], min(level - 20, 10)

    @staticmethod
    def progression_for_xp(total_xp):
        total_xp = int(total_xp or 0)
        if total_xp <= 0:
            return {
                "level": 0,
                "tier_key": None,
                "tier_name": None,
                "tier_arabic": None,
                "tier_transliteration": None,
                "tier_meaning": None,
                "tier_sublevel": 0,
                "level_label": "No tier yet",
                "current_level_floor_xp": 0,
                "next_level_xp": LEVEL_THRESHOLDS[0][1],
                "xp_into_level": 0,
                "xp_to_next_level": LEVEL_THRESHOLDS[0][1],
                "progress_percent": 0,
                "is_max_level": False,
            }

        level = 1
        current_floor = 0
        for threshold_level, cumulative_xp in LEVEL_THRESHOLDS:
            if total_xp >= cumulative_xp:
                level = threshold_level
                current_floor = cumulative_xp
            else:
                break

        if level >= 30:
            next_level_xp = LEVEL_THRESHOLDS[-1][1]
            progress_percent = 100
            xp_into_level = max(0, total_xp - current_floor)
            xp_to_next = 0
            is_max_level = True
        else:
            next_level_xp = next(cumulative for threshold_level, cumulative in LEVEL_THRESHOLDS if threshold_level == level + 1)
            span = max(1, next_level_xp - current_floor)
            xp_into_level = max(0, total_xp - current_floor)
            xp_to_next = max(0, next_level_xp - total_xp)
            progress_percent = min(100, int((xp_into_level / span) * 100))
            is_max_level = False

        tier_key, tier, tier_sublevel = GamificationService.tier_for_level(level)
        tier_name = tier["name"] if tier else None
        return {
            "level": level,
            "tier_key": tier_key,
            "tier_name": tier_name,
            "tier_arabic": tier["arabic"] if tier else None,
            "tier_transliteration": tier["transliteration"] if tier else None,
            "tier_meaning": tier["meaning"] if tier else None,
            "tier_sublevel": tier_sublevel,
            "level_label": f"{tier_name} {tier_sublevel}" if tier_name else "No tier yet",
            "current_level_floor_xp": current_floor,
            "next_level_xp": next_level_xp,
            "xp_into_level": xp_into_level,
            "xp_to_next_level": xp_to_next,
            "progress_percent": progress_percent,
            "is_max_level": is_max_level,
        }

    @staticmethod
    def get_or_create_profile(user_id):
        GamificationService.ensure_storage()
        profile = UserGamification.query.filter_by(user_id=user_id).first()
        if profile:
            return profile
        profile = UserGamification(user_id=user_id)
        db.session.add(profile)
        db.session.flush()
        return profile

    @staticmethod
    def _session_hours(event, attendance):
        if event.duration:
            return max(0.5, float(event.duration))
        start_time = getattr(attendance.participant, "start_time", None) or event.start_time
        end_time = getattr(attendance.participant, "end_time", None) or event.end_time
        if start_time and end_time:
            start_dt = datetime.combine(attendance.attendance_date, start_time)
            end_dt = datetime.combine(attendance.attendance_date, end_time)
            seconds = (end_dt - start_dt).total_seconds()
            if seconds > 0:
                return max(0.5, seconds / 3600)
        return 1.0

    @staticmethod
    def _is_streak_eligible(event):
        return bool(event and GamificationService.verified_activity_dimensions(event)["is_recurring"])

    @staticmethod
    def _get_streak(user_id, event_id):
        streak = GamificationStreak.query.filter_by(user_id=user_id, event_id=event_id).first()
        if streak:
            return streak
        streak = GamificationStreak(user_id=user_id, event_id=event_id)
        db.session.add(streak)
        db.session.flush()
        return streak

    @staticmethod
    def _course_completion_bonus(user_id, event, attendance):
        if not event or int(event.event_type or 0) != 2:
            return 0

        already_awarded = GamificationXpLog.query.filter_by(
            user_id=user_id,
            event_id=event.id,
            participant_id=attendance.participant_id,
            xp_type="course_completion",
        ).first()
        if already_awarded:
            return 0

        attendance_rows = (
            ParticipantsAttendance.query
            .filter_by(participant_id=attendance.participant_id, event_id=event.id)
            .order_by(ParticipantsAttendance.attendance_date.asc(), ParticipantsAttendance.id.asc())
            .all()
        )
        if attendance_rows:
            final_session = attendance_rows[-1]
            if final_session.id != attendance.id:
                return 0

        scheduled_sessions = max(int(event.total_no_class or 0), len(attendance_rows), 1)

        attended_sessions = ParticipantsAttendance.query.filter_by(
            participant_id=attendance.participant_id,
            event_id=event.id,
            status=1,
        ).count()
        return GamificationService.completion_bonus_for_attendance(scheduled_sessions, attended_sessions)

    @staticmethod
    def _session_check_in_has_closed(event, attendance_date, as_of=None):
        if not attendance_date:
            return False
        timezone_name = event.time_zone or "Africa/Casablanca"
        timezone = ZoneInfo(timezone_name)
        current = as_of or datetime.now(timezone)
        if current.tzinfo is None:
            current = current.replace(tzinfo=ZoneInfo("UTC"))
        current = current.astimezone(timezone)

        start_time = event.start_time
        if not start_time and isinstance(event.start_date, datetime):
            start_time = event.start_date.time()
        start_time = start_time or datetime.min.time()
        session_start = datetime.combine(attendance_date, start_time).replace(tzinfo=timezone)

        end_time = event.end_time
        if not end_time and isinstance(event.end_date, datetime):
            end_time = event.end_date.time()
        if end_time:
            session_end = datetime.combine(attendance_date, end_time).replace(tzinfo=timezone)
            if session_end <= session_start:
                session_end += timedelta(days=1)
        else:
            try:
                duration_hours = max(0.0, float(event.duration or 0))
            except (TypeError, ValueError):
                duration_hours = 0.0
            session_end = session_start + timedelta(hours=duration_hours)
        return current > session_end + timedelta(minutes=30)

    @staticmethod
    def reconcile_missed_sessions(user_id, as_of=None):
        GamificationService.ensure_storage()
        rows = (
            db.session.query(ParticipantsAttendance, Participant, Event)
            .join(Participant, Participant.id == ParticipantsAttendance.participant_id)
            .join(Event, Event.id == ParticipantsAttendance.event_id)
            .filter(
                Participant.user_id == user_id,
                Participant.status.in_([1, 3]),
                ParticipantsAttendance.status != 1,
            )
            .order_by(ParticipantsAttendance.attendance_date.asc(), ParticipantsAttendance.id.asc())
            .all()
        )
        processed_ids = {
            row[0]
            for row in (
                db.session.query(GamificationStreakMiss.attendance_id)
                .filter(GamificationStreakMiss.user_id == user_id)
                .all()
            )
        }
        reconciled = []
        last_changed_streak = None

        for attendance, participant, event in rows:
            if attendance.id in processed_ids or not GamificationService._is_streak_eligible(event):
                continue
            if not GamificationService._session_check_in_has_closed(event, attendance.attendance_date, as_of=as_of):
                continue

            streak = GamificationStreak.query.filter_by(user_id=user_id, event_id=event.id).first()
            if streak:
                streak.missed_count = (streak.missed_count or 0) + 1
                streak.current_count, streak.state, streak.multiplier = GamificationService.streak_after_miss(
                    streak.current_count,
                    streak.missed_count,
                )
                last_changed_streak = streak
                missed_count = streak.missed_count
                resulting_count = streak.current_count
                resulting_state = streak.state
            else:
                missed_count = 0
                resulting_count = 0
                resulting_state = "none"

            db.session.add(GamificationStreakMiss(
                user_id=user_id,
                event_id=event.id,
                participant_id=participant.id,
                attendance_id=attendance.id,
                missed_date=attendance.attendance_date,
                consecutive_misses=missed_count,
                resulting_count=resulting_count,
                resulting_state=resulting_state,
            ))
            processed_ids.add(attendance.id)
            reconciled.append(attendance.id)

        if reconciled:
            profile = UserGamification.query.filter_by(user_id=user_id).first()
            if profile and last_changed_streak:
                all_streaks = GamificationStreak.query.filter_by(user_id=user_id).all()
                profile.current_streak = max((row.current_count or 0 for row in all_streaks), default=0)
                profile.longest_streak = max((row.longest_count or 0 for row in all_streaks), default=0)
                profile.streak_state = last_changed_streak.state
                profile.streak_multiplier = last_changed_streak.multiplier
            db.session.commit()
        return reconciled

    @staticmethod
    def award_due_course_completion_bonuses(user_id, as_of=None):
        GamificationService.ensure_storage()
        rows = (
            db.session.query(Participant, Event)
            .join(Event, Event.id == Participant.event_id)
            .filter(
                Participant.user_id == user_id,
                Participant.status.in_([1, 3]),
                Event.event_type == 2,
            )
            .order_by(Participant.id.asc())
            .all()
        )
        awarded_ids = []

        for participant, event in rows:
            existing = GamificationXpLog.query.filter(
                GamificationXpLog.user_id == user_id,
                GamificationXpLog.event_id == event.id,
                GamificationXpLog.participant_id == participant.id,
                GamificationXpLog.xp_type.in_(["course_completion", "course_completion_bonus"]),
            ).first()
            if existing:
                continue

            attendances = (
                ParticipantsAttendance.query
                .filter_by(participant_id=participant.id, event_id=event.id)
                .order_by(ParticipantsAttendance.attendance_date.asc(), ParticipantsAttendance.id.asc())
                .all()
            )
            if not attendances or any(
                not GamificationService._session_check_in_has_closed(
                    event,
                    attendance.attendance_date,
                    as_of=as_of,
                )
                for attendance in attendances
            ):
                continue

            scheduled_sessions = max(int(event.total_no_class or 0), len(attendances), 1)
            attended_sessions = sum(1 for attendance in attendances if attendance.status == 1)
            completion_bonus = GamificationService.completion_bonus_for_attendance(
                scheduled_sessions,
                attended_sessions,
            )
            if completion_bonus <= 0:
                continue

            verified_log = (
                GamificationXpLog.query
                .filter(
                    GamificationXpLog.user_id == user_id,
                    GamificationXpLog.event_id == event.id,
                    GamificationXpLog.participant_id == participant.id,
                    GamificationXpLog.attendance_id.isnot(None),
                )
                .order_by(GamificationXpLog.session_date.desc(), GamificationXpLog.id.desc())
                .first()
            )
            if not verified_log:
                continue

            profile = GamificationService.get_or_create_profile(user_id)
            previous_total_xp = profile.total_xp or 0
            previous_progress = GamificationService.progression_for_xp(previous_total_xp)
            first_course_milestone = not profile.first_course_awarded
            milestone_xp = completion_bonus + (250 if first_course_milestone else 0)
            new_total_xp = previous_total_xp + milestone_xp
            new_progress = GamificationService.progression_for_xp(new_total_xp)
            dimensions = GamificationService.verified_activity_dimensions(event, "course_completion")

            profile.total_xp = new_total_xp
            profile.level = new_progress["level"]
            profile.tier_key = new_progress["tier_key"]
            profile.tier_name = new_progress["tier_name"]
            profile.tier_sublevel = new_progress["tier_sublevel"]
            profile.first_course_awarded = True

            log = GamificationXpLog(
                user_id=user_id,
                event_id=event.id,
                participant_id=participant.id,
                attendance_id=None,
                xp_type="course_completion_bonus",
                event_title=event.title,
                category_title=verified_log.category_title,
                session_date=attendances[-1].attendance_date,
                session_hours=0,
                journey_level=dimensions["suitability"],
                **dimensions,
                base_xp=0,
                difficulty_multiplier=1.0,
                streak_multiplier=1.0,
                difficulty_bonus_xp=0,
                streak_bonus_xp=0,
                milestone_xp=milestone_xp,
                total_xp=milestone_xp,
                previous_total_xp=previous_total_xp,
                new_total_xp=new_total_xp,
                previous_level=previous_progress["level"],
                new_level=new_progress["level"],
                previous_tier_key=previous_progress["tier_key"],
                new_tier_key=new_progress["tier_key"],
                level_up_occurred=new_progress["level"] > previous_progress["level"],
                tier_change_occurred=bool(
                    previous_progress["tier_key"]
                    and new_progress["tier_key"] != previous_progress["tier_key"]
                ),
                first_class_milestone=False,
                streak_count=profile.current_streak or 0,
                streak_state=profile.streak_state or "none",
            )
            db.session.add(log)
            db.session.flush()
            awarded_ids.append(log.id)

        if awarded_ids:
            db.session.commit()
        return awarded_ids

    @staticmethod
    def _backfill_verified_activity_dimensions(user_id):
        logs = (
            GamificationXpLog.query
            .filter(
                GamificationXpLog.user_id == user_id,
                GamificationXpLog.radar_area.is_(None),
                GamificationXpLog.attendance_id.isnot(None),
            )
            .all()
        )
        changed = False
        for log in logs:
            event = Event.query.get(log.event_id) if log.event_id else None
            if not event:
                continue
            dimensions = GamificationService.verified_activity_dimensions(event, "legacy_verified_attendance")
            for field_name, value in dimensions.items():
                setattr(log, field_name, value)
            changed = True
        if changed:
            db.session.commit()

    @staticmethod
    def radar_payload(user_id, now=None):
        GamificationService.ensure_storage()
        GamificationService._backfill_verified_activity_dimensions(user_id)
        current = now or datetime.utcnow()
        if current.tzinfo is not None:
            current = current.astimezone(ZoneInfo("UTC")).replace(tzinfo=None)
        cutoff = current - timedelta(days=30)
        logs = (
            GamificationXpLog.query
            .filter(
                GamificationXpLog.user_id == user_id,
                GamificationXpLog.attendance_id.isnot(None),
                GamificationXpLog.xp_type == "check_in",
                GamificationXpLog.created_on >= cutoff,
            )
            .order_by(GamificationXpLog.created_on.desc(), GamificationXpLog.id.desc())
            .all()
        )
        hours_by_area = {area: 0.0 for area in RADAR_TARGET_HOURS}
        recent_by_area = {area: [] for area in RADAR_TARGET_HOURS}
        for log in logs:
            area = log.radar_area
            if area not in hours_by_area:
                continue
            hours_by_area[area] += max(0.0, float(log.session_hours or 0))
            recent_by_area[area].append({
                "activity_id": log.id,
                "event_id": log.event_id,
                "title": log.event_title,
                "session_date": log.session_date.isoformat() if log.session_date else None,
                "hours": round(float(log.session_hours or 0), 2),
                "topic_id": log.topic_id,
                "topic_title": log.topic_title,
            })

        axes = []
        for area, target_hours in RADAR_TARGET_HOURS.items():
            hours = round(hours_by_area[area], 2)
            score = GamificationService.radar_score(hours, target_hours)
            axes.append({
                "label": area,
                "value": score,
                "score": score,
                "hours": hours,
                "target_hours": target_hours,
                "state": GamificationService.radar_state(score),
                "recent_sessions": recent_by_area[area],
            })
        return axes

    @staticmethod
    def streaks_payload(user_id):
        rows = (
            db.session.query(GamificationStreak, Event)
            .join(Event, Event.id == GamificationStreak.event_id)
            .filter(GamificationStreak.user_id == user_id)
            .order_by(GamificationStreak.updated_on.desc(), GamificationStreak.id.desc())
            .all()
        )
        return [
            {
                "event_id": event.id,
                "event_title": event.title,
                "count": streak.current_count or 0,
                "longest_count": streak.longest_count or 0,
                "missed_count": streak.missed_count or 0,
                "state": streak.state or "none",
                "multiplier": streak.multiplier or 1.0,
            }
            for streak, event in rows
        ]

    @staticmethod
    def award_check_in(user_id, attendance, source="verified_check_in"):
        GamificationService.ensure_storage()
        if not isinstance(attendance, ParticipantsAttendance):
            return None

        existing = GamificationXpLog.query.filter_by(attendance_id=attendance.id).first()
        if existing:
            return GamificationService.serialize_summary(existing)

        event = Event.query.get(attendance.event_id)
        if not event:
            return None

        GamificationService.reconcile_missed_sessions(user_id)
        activity_dimensions = GamificationService.verified_activity_dimensions(event, source)

        profile = GamificationService.get_or_create_profile(user_id)
        previous_total_xp = profile.total_xp or 0
        previous_progress = GamificationService.progression_for_xp(previous_total_xp)

        journey_level = event.journey_level.title if event.journey_level else None
        difficulty_multiplier = GamificationService.difficulty_multiplier(journey_level)
        session_hours = GamificationService._session_hours(event, attendance)
        base_xp = int(round(50 * session_hours))
        difficulty_xp = int(round(base_xp * difficulty_multiplier))
        difficulty_bonus_xp = max(0, difficulty_xp - base_xp)

        streak_count_after = 0
        streak_state_after = "none"
        applied_streak_multiplier = 1.0

        if GamificationService._is_streak_eligible(event):
            streak = GamificationService._get_streak(user_id, event.id)
            applied_streak_multiplier = streak.multiplier or 1.0
            streak.missed_count = 0
            streak.current_count = (streak.current_count or 0) + 1
            streak.longest_count = max(streak.longest_count or 0, streak.current_count)
            streak.last_attendance_date = attendance.attendance_date
            streak.multiplier, streak.state = GamificationService.streak_multiplier(streak.current_count)
            streak_count_after = streak.current_count
            streak_state_after = streak.state
        else:
            streak = None

        xp_before_milestones = int(round(difficulty_xp * applied_streak_multiplier))
        streak_bonus_xp = max(0, xp_before_milestones - difficulty_xp)
        first_class_milestone = not profile.first_class_awarded
        course_completion_xp = GamificationService._course_completion_bonus(user_id, event, attendance)
        first_course_milestone = course_completion_xp > 0 and not profile.first_course_awarded
        milestone_xp = (250 if first_class_milestone else 0) + course_completion_xp + (250 if first_course_milestone else 0)
        total_xp = xp_before_milestones + milestone_xp

        new_total_xp = previous_total_xp + total_xp
        new_progress = GamificationService.progression_for_xp(new_total_xp)

        profile.total_xp = new_total_xp
        profile.level = new_progress["level"]
        profile.tier_key = new_progress["tier_key"]
        profile.tier_name = new_progress["tier_name"]
        profile.tier_sublevel = new_progress["tier_sublevel"]
        profile.total_sessions = (profile.total_sessions or 0) + 1
        profile.lifetime_hours = round((profile.lifetime_hours or 0) + session_hours, 2)
        profile.first_class_awarded = profile.first_class_awarded or first_class_milestone
        profile.first_course_awarded = profile.first_course_awarded or first_course_milestone
        profile.last_check_in_on = datetime.utcnow()
        profile.last_event_id = event.id
        if streak:
            profile.current_streak = max(profile.current_streak or 0, streak.current_count)
            profile.longest_streak = max(profile.longest_streak or 0, streak.longest_count)
            profile.streak_state = streak.state
            profile.streak_multiplier = streak.multiplier

        category_title = event.category.title.rstrip("s") if event.category and event.category.title.endswith("s") else (event.category.title if event.category else None)
        log = GamificationXpLog(
            user_id=user_id,
            event_id=event.id,
            participant_id=attendance.participant_id,
            attendance_id=attendance.id,
            xp_type="course_completion" if course_completion_xp > 0 else "check_in",
            event_title=event.title,
            category_title=category_title,
            session_date=attendance.attendance_date,
            session_hours=session_hours,
            journey_level=journey_level,
            **activity_dimensions,
            base_xp=base_xp,
            difficulty_multiplier=difficulty_multiplier,
            streak_multiplier=applied_streak_multiplier,
            difficulty_bonus_xp=difficulty_bonus_xp,
            streak_bonus_xp=streak_bonus_xp,
            milestone_xp=milestone_xp,
            total_xp=total_xp,
            previous_total_xp=previous_total_xp,
            new_total_xp=new_total_xp,
            previous_level=previous_progress["level"],
            new_level=new_progress["level"],
            previous_tier_key=previous_progress["tier_key"],
            new_tier_key=new_progress["tier_key"],
            level_up_occurred=new_progress["level"] > previous_progress["level"],
            tier_change_occurred=bool(previous_progress["tier_key"] and new_progress["tier_key"] != previous_progress["tier_key"]),
            first_class_milestone=first_class_milestone,
            streak_count=streak_count_after,
            streak_state=streak_state_after,
        )
        db.session.add(log)
        db.session.commit()
        return GamificationService.serialize_summary(log)

    @staticmethod
    def profile_payload(user_id):
        GamificationService.reconcile_missed_sessions(user_id)
        GamificationService.award_due_course_completion_bonuses(user_id)
        profile = GamificationService.get_or_create_profile(user_id)
        db.session.flush()
        progression = GamificationService.progression_for_xp(profile.total_xp)
        estimated_session_xp = max(50, int(round(100 * (profile.streak_multiplier or 1.0))))
        classes_to_next = 0 if progression["is_max_level"] else max(1, ceil(progression["xp_to_next_level"] / estimated_session_xp))
        return {
            "total_xp": profile.total_xp or 0,
            "level": progression["level"],
            "tier_key": progression["tier_key"],
            "tier_name": progression["tier_name"],
            "tier_arabic": progression["tier_arabic"],
            "tier_transliteration": progression["tier_transliteration"],
            "tier_meaning": progression["tier_meaning"],
            "tier_sublevel": progression["tier_sublevel"],
            "level_label": progression["level_label"],
            "current_level_floor_xp": progression["current_level_floor_xp"],
            "next_level_xp": progression["next_level_xp"],
            "xp_to_next_level": progression["xp_to_next_level"],
            "progress_percent": progression["progress_percent"],
            "classes_to_next_level": classes_to_next,
            "current_streak": profile.current_streak or 0,
            "longest_streak": profile.longest_streak or 0,
            "streak_state": profile.streak_state or "none",
            "streak_multiplier": profile.streak_multiplier or 1.0,
            "total_sessions": profile.total_sessions or 0,
            "lifetime_hours": profile.lifetime_hours or 0,
            "has_started": (profile.total_xp or 0) > 0,
            "is_max_level": progression["is_max_level"],
            "radar": GamificationService.radar_payload(user_id),
            "streaks": GamificationService.streaks_payload(user_id),
            "recent_activity": GamificationService.recent_activity(user_id),
        }

    @staticmethod
    def recent_activity(user_id, limit=3):
        GamificationService.ensure_storage()
        logs = (
            GamificationXpLog.query
            .filter_by(user_id=user_id)
            .order_by(GamificationXpLog.created_on.desc(), GamificationXpLog.id.desc())
            .limit(limit)
            .all()
        )
        return [
            {
                "id": log.id,
                "event_id": log.event_id,
                "participant_id": log.participant_id,
                "title": log.event_title or "OnDeen activity",
                "event_title": log.event_title,
                "category_title": log.category_title,
                "session_date": log.session_date.isoformat() if log.session_date else None,
                "session_hours": log.session_hours or 0,
                "topic_id": log.topic_id,
                "topic_title": log.topic_title,
                "radar_area": log.radar_area,
                "xp": log.total_xp or 0,
                "total_xp": log.total_xp or 0,
                "created_on": log.created_on.isoformat() if log.created_on else None,
            }
            for log in logs
        ]

    @staticmethod
    def serialize_summary(log):
        progression = GamificationService.progression_for_xp(log.new_total_xp)
        previous_progression = GamificationService.progression_for_xp(log.previous_total_xp)
        estimated_session_xp = max(50, log.total_xp or 100)
        classes_to_next = 0 if progression["is_max_level"] else max(1, ceil(progression["xp_to_next_level"] / estimated_session_xp))
        radar_axes = GamificationService.radar_payload(log.user_id)
        radar_axis = next((axis for axis in radar_axes if axis["label"] == log.radar_area), None)
        return {
            "id": log.id,
            "event": {
                "id": log.event_id,
                "title": log.event_title,
                "category_title": log.category_title,
                "session_date": log.session_date.isoformat() if log.session_date else None,
                "session_hours": log.session_hours,
                "journey_level": log.journey_level,
            },
            "xp": {
                "type": log.xp_type,
                "previous_total": log.previous_total_xp,
                "total": log.new_total_xp,
                "earned": log.total_xp,
                "base": log.base_xp,
                "difficulty_bonus": log.difficulty_bonus_xp,
                "streak_bonus": log.streak_bonus_xp,
                "milestone": log.milestone_xp,
                "difficulty_multiplier": log.difficulty_multiplier,
                "streak_multiplier": log.streak_multiplier,
            },
            "progression": {
                **progression,
                "previous_level": previous_progression["level"],
                "previous_tier_key": previous_progression["tier_key"],
                "level_up_occurred": log.level_up_occurred,
                "tier_change_occurred": log.tier_change_occurred,
                "classes_to_next_level": classes_to_next,
            },
            "streak": {
                "count": log.streak_count,
                "state": log.streak_state,
                "multiplier": log.streak_multiplier,
                "to_full_flame": max(0, 8 - (log.streak_count or 0)),
            },
            "radar": {
                "area": log.radar_area,
                "topic_id": log.topic_id,
                "topic_title": log.topic_title,
                "hours_earned": log.session_hours or 0,
                "score": radar_axis["score"] if radar_axis else 0,
                "state": radar_axis["state"] if radar_axis else "quiet",
                "target_hours": radar_axis["target_hours"] if radar_axis else None,
            },
            "copy": {
                "mode": "welcome" if log.first_class_milestone else "summary",
                "heading": "You're now a Seeker. The journey begins." if log.first_class_milestone else "Session Complete",
            },
        }

    @staticmethod
    def pending_summary(user_id):
        GamificationService.ensure_storage()
        log = (
            GamificationXpLog.query
            .filter_by(user_id=user_id, summary_seen=False)
            .order_by(GamificationXpLog.created_on.asc(), GamificationXpLog.id.asc())
            .first()
        )
        return {"summary": GamificationService.serialize_summary(log) if log else None}

    @staticmethod
    def mark_summary_seen(user_id, summary_id):
        GamificationService.ensure_storage()
        log = GamificationXpLog.query.filter_by(user_id=user_id, id=summary_id).first()
        if log:
            log.summary_seen = True
            db.session.commit()
        return {"message": "Summary updated", "summary_id": summary_id}

    @staticmethod
    def _feedback_log(user_id, summary_id):
        if not summary_id:
            raise ServiceError("summary_id is required")
        log = GamificationXpLog.query.filter_by(user_id=user_id, id=summary_id).first()
        if not log:
            raise ServiceError("Session summary not found")
        return log

    @staticmethod
    def _rating_value(value, field_name):
        try:
            rating = int(value)
        except (TypeError, ValueError):
            raise ServiceError(f"{field_name} is required")
        if rating < 1 or rating > 5:
            raise ServiceError(f"{field_name} must be between 1 and 5")
        return rating

    @staticmethod
    def _clean_suggestion(value):
        if value is None:
            return None
        suggestion = str(value).strip()
        if len(suggestion) > 500:
            raise ServiceError("Suggestion must be 500 characters or fewer")
        return suggestion or None

    @staticmethod
    def _parse_recommendation(value):
        if value is None or value == "":
            return None
        if isinstance(value, bool):
            return value
        if isinstance(value, (int, float)):
            return bool(value)
        if isinstance(value, str):
            normalized = value.strip().lower()
            if normalized in {"true", "1", "yes", "y", "recommended", "recommend"}:
                return True
            if normalized in {"false", "0", "no", "n", "not really"}:
                return False
        raise ServiceError("recommendation must be true or false")

    @staticmethod
    def _clean_great_points(value):
        if value in (None, "", [], (), set()):
            return None

        if isinstance(value, str):
            raw_value = value.strip()
            if not raw_value:
                return None
            try:
                parsed = json.loads(raw_value)
                items = parsed if isinstance(parsed, list) else [raw_value]
            except (TypeError, ValueError, json.JSONDecodeError):
                items = [part.strip() for part in raw_value.split(",")]
        elif isinstance(value, (list, tuple, set)):
            items = list(value)
        else:
            items = [value]

        cleaned = []
        for item in items:
            text_value = str(item).strip()
            if text_value and text_value not in cleaned:
                cleaned.append(text_value)

        if not cleaned:
            return None
        if len(cleaned) > 8:
            raise ServiceError("great_points must contain 8 items or fewer")

        encoded = json.dumps(cleaned, ensure_ascii=False, separators=(",", ":"))
        if len(encoded) > 1000:
            raise ServiceError("great_points is too long")
        return encoded

    @staticmethod
    def _decode_great_points(value):
        if not value:
            return []
        if isinstance(value, list):
            return value
        if isinstance(value, str):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return parsed
            except (TypeError, ValueError, json.JSONDecodeError):
                pass
            return [part.strip() for part in value.split(",") if part.strip()]
        return [str(value)]

    @staticmethod
    def _existing_feedback(log):
        return SessionFeedback.query.filter_by(gamification_xp_log_id=log.id).first()

    @staticmethod
    def _create_feedback_record(
        user_id,
        log,
        *,
        engagement_rating=None,
        delivery_rating=None,
        recommendation=None,
        great_points=None,
        suggestion=None,
        skipped=False,
    ):
        existing = GamificationService._existing_feedback(log)
        if existing:
            log.summary_seen = True
            db.session.commit()
            return existing, False

        feedback = SessionFeedback(
            user_id=user_id,
            event_id=log.event_id,
            participant_id=log.participant_id,
            attendance_id=log.attendance_id,
            gamification_xp_log_id=log.id,
            session_date=log.session_date,
            event_title=log.event_title,
            engagement_rating=engagement_rating,
            delivery_rating=delivery_rating,
            recommendation=recommendation,
            great_points=great_points,
            suggestion=suggestion,
            skipped=skipped,
        )
        db.session.add(feedback)
        log.summary_seen = True
        db.session.commit()
        return feedback, True

    @staticmethod
    def submit_feedback(user_id, request_data):
        GamificationService.ensure_storage()
        log = GamificationService._feedback_log(user_id, request_data.get("summary_id"))
        engagement_rating = GamificationService._rating_value(request_data.get("engagement_rating"), "engagement_rating")
        delivery_rating = GamificationService._rating_value(request_data.get("delivery_rating"), "delivery_rating")
        recommendation = GamificationService._parse_recommendation(request_data.get("recommendation"))
        great_points = GamificationService._clean_great_points(request_data.get("great_points"))
        suggestion = GamificationService._clean_suggestion(request_data.get("suggestion"))

        feedback, created = GamificationService._create_feedback_record(
            user_id,
            log,
            engagement_rating=engagement_rating,
            delivery_rating=delivery_rating,
            recommendation=recommendation,
            great_points=great_points,
            suggestion=suggestion,
            skipped=False,
        )
        print(
            f"[feedback] submit user_id={user_id} event_id={log.event_id} feedback_id={feedback.id} created={created}",
            flush=True,
        )

        return {
            "message": "Feedback recorded" if created else "Feedback already handled",
            "feedback_id": feedback.id,
            "summary_id": log.id,
            "created": created,
        }

    @staticmethod
    def skip_feedback(user_id, request_data):
        GamificationService.ensure_storage()
        log = GamificationService._feedback_log(user_id, request_data.get("summary_id"))
        feedback, created = GamificationService._create_feedback_record(user_id, log, skipped=True)
        return {
            "message": "Feedback skipped" if created else "Feedback already handled",
            "feedback_id": feedback.id,
            "summary_id": log.id,
            "created": created,
        }

    @staticmethod
    def feedback_aggregate(event_id):
        GamificationService.ensure_storage()
        if not event_id:
            raise ServiceError("event_id is required")

        base_query = SessionFeedback.query.filter(
            SessionFeedback.event_id == event_id,
            SessionFeedback.skipped.is_(False),
        )
        total_submitted = base_query.count()
        averages = base_query.with_entities(
            func.avg(SessionFeedback.engagement_rating),
            func.avg(SessionFeedback.delivery_rating),
        ).first()
        recommendation_yes_count = base_query.filter(SessionFeedback.recommendation.is_(True)).count()
        recommendation_no_count = base_query.filter(SessionFeedback.recommendation.is_(False)).count()
        skipped_count = SessionFeedback.query.filter_by(event_id=event_id, skipped=True).count()
        recent = (
            base_query
            .order_by(SessionFeedback.created_on.desc(), SessionFeedback.id.desc())
            .all()
        )
        print(
            f"[feedback] aggregate event_id={event_id} submitted={total_submitted} skipped={skipped_count}",
            flush=True,
        )

        return {
            "event_id": int(event_id),
            "submitted_count": total_submitted,
            "skipped_count": skipped_count,
            "average_engagement": round(float(averages[0] or 0), 2),
            "average_delivery": round(float(averages[1] or 0), 2),
            "recommendation_yes_count": recommendation_yes_count,
            "recommendation_no_count": recommendation_no_count,
            "recommendation_rate": round((recommendation_yes_count / total_submitted) * 100, 2) if total_submitted else 0,
            "responses": [
                {
                    "id": item.id,
                    "session_date": item.session_date.isoformat() if item.session_date else None,
                    "event_title": item.event_title,
                    "engagement_rating": item.engagement_rating,
                    "delivery_rating": item.delivery_rating,
                    "recommendation": item.recommendation,
                    "great_points": GamificationService._decode_great_points(item.great_points),
                    "suggestion": item.suggestion,
                    "created_on": item.created_on.isoformat() if item.created_on else None,
                }
                for item in recent
            ],
        }

    @staticmethod
    def feedback_csv(event_id):
        if not event_id:
            raise ServiceError("event_id is required")
        event_id = int(event_id)
        rows = (
            SessionFeedback.query
            .filter(
                SessionFeedback.event_id == event_id,
                SessionFeedback.skipped.is_(False),
            )
            .order_by(SessionFeedback.session_date.asc(), SessionFeedback.id.asc())
            .all()
        )
        output = StringIO()
        writer = csv.writer(output)
        writer.writerow([
            "event_id",
            "event_title",
            "session_date",
            "engagement_rating",
            "delivery_rating",
            "recommendation",
            "great_points",
            "suggestion",
            "created_on",
        ])
        for item in rows:
            great_points = GamificationService._decode_great_points(item.great_points)
            writer.writerow([
                event_id,
                item.event_title,
                item.session_date.isoformat() if item.session_date else "",
                item.engagement_rating,
                item.delivery_rating,
                "yes" if item.recommendation is True else "no" if item.recommendation is False else "",
                "; ".join(great_points),
                item.suggestion or "",
                item.created_on.isoformat() if item.created_on else "",
            ])
        return output.getvalue()
