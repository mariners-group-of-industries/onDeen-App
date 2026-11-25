"""Seed the backend with the product-owner reference dataset.

This module is intentionally limited to data already observed in REFS. Payment
records are not created: the paid flow remains documented but deferred.
"""

import os
import shutil
from datetime import date, datetime, time, timedelta
from pathlib import Path

from werkzeug.security import generate_password_hash

from app import db
from app.models.category import Category, SubCategory
from app.models.event import (
    Event,
    EventAnnouncements,
    EventDate,
    EventDateTime,
    EventDocuments,
    EventDocumentsFiles,
    EventFacilities,
    EventGuestBookingSetting,
    EventImages,
    EventSpeakers,
    EventTags,
    EventTicket,
    Event_note,
    Facilities,
    JourneyLevel,
    Language,
    Participant,
    ParticipantsAttendance,
    Request_buddy,
    Tag,
)
from app.models.online_checkin import OnlineSessionCheckInCode
from app.models.organization import (
    Organization,
    OrganizationType,
    OrganizerCategory,
    OrganizerSubCategory,
    SchoolOfThought,
    SectType,
)
from app.models.speakers import (
    Expertise,
    Speaker,
    SpeakerAvailabilityDate,
    SpeakerAvailabilityTime,
    SpeakerExpertise,
    SpeakerSchoolOfThought,
    SpeakerSectType,
)
from app.models.users import Notification_History, Users
from app.services.customer.gamification import CANONICAL_ACTIVITY_TOPICS, GamificationService


REFERENCE_ASSETS = {
    "category_events": "category-events.png",
    "category_courses": "category-courses.png",
    "category_mosque_tours": "category-mosque-tours.png",
    "category_community": "category-community.png",
    "category_seminars": "category-seminars.png",
    "weekly_knowledge_class_cover": "weekly-knowledge-class-reference-crop.png",
    "friday_weekly_circle_cover": "friday-weekly-circle-reference-crop.png",
    "tafsir_ul_quran_cover": "tafsir-ul-quran-reference-crop.png",
    "disease_and_cure_cover": "disease-and-cure-reference-crop.png",
    "deen_over_dunya_cover": "deen-over-dunya-reference-crop.png",
    "aqidah_al_salaf_cover": "aqidah-al-salaf-reference-crop.png",
    "rijal_club_logo": "rijal-club-reference-crop.png",
    "sheikh_habib_hassan": "sheikh-habib-hassan-reference-crop.png",
    "sheikh_sajid_umar": "sheikh-sajid-umar-reference-crop.png",
    "ust_hamza_tzortzis": "ust-hamza-tzortzis-reference-crop.png",
    "muhammad_zulfikar": "muhammad-zulfikar-reference-crop.png",
    "default_user": "default-user-reference-crop.png",
    "knowledge_pre_read": "knowledge-class-pre-read.pdf",
    "knowledge_audio_recap": "knowledge-class-audio-recap.mp3",
}


def add(obj):
    db.session.add(obj)
    db.session.flush()
    return obj


def copy_reference_assets(base_url, upload_dir, upload_public_path):
    source_dir = Path.cwd() / "seed_assets" / "refs"
    target_dir = Path(upload_dir) / "refs"
    target_dir.mkdir(parents=True, exist_ok=True)
    urls = {}

    for key, filename in REFERENCE_ASSETS.items():
        source = source_dir / filename
        if not source.is_file():
            raise RuntimeError(f"Missing REFS seed asset: {source}")
        target = target_dir / filename
        shutil.copyfile(source, target)
        urls[key] = f"{base_url}/{upload_public_path}/refs/{filename}"

    return urls


def seed_reference_tables(asset_urls):
    sect = add(SectType(title="Sunni", ar_title="Sunni", position=1, status=1))
    school = add(SchoolOfThought(title="Shafi", ar_title="Shafi", position=1, status=1))
    add(OrganizationType(
        title="Community Organisation",
        ar_title="Community Organisation",
        position=1,
        status=1,
    ))

    levels = {}
    for position, title in enumerate(
        ["Suitable for all", "New Muslim", "Beginner", "Intermediate", "Advanced"],
        start=1,
    ):
        levels[title] = add(JourneyLevel(
            title=title,
            ar_title=title,
            sub_title=f"{title} journey level",
            ar_sub_title=f"{title} journey level",
            status=1,
            created_by=0,
            updated_by=0,
        ))

    languages = {}
    for title in ("English", "Arabic"):
        languages[title] = add(Language(
            title=title,
            ar_title=title,
            status=1,
            created_by=0,
            updated_by=0,
        ))

    tags = {}
    for position, title in enumerate(
        ["Free", "Tafsir", "Unisex", "In person", "Online", "Weekly", "Brothers"],
        start=1,
    ):
        tags[title] = add(Tag(
            title=title,
            ar_title=title,
            position=position,
            status=1,
        ))

    facilities = {}
    for position, title in enumerate(
        ["Prayer Space", "Wheelchair Access", "Parking", "Refreshments"],
        start=1,
    ):
        facilities[title] = add(Facilities(
            title=title,
            ar_title=title,
            position=position,
            status=1,
        ))

    legacy_topics = {
        "Events": ["Community Event"],
        "Courses": ["Quran", "Fiqh", "Seerah"],
        "Mosque Tours": ["Mosque Tour"],
        "Retreats": ["Worship Retreat"],
        "Fundraisers": ["Community Fundraiser"],
        "ISOC": ["ISOC Activity"],
        "Conferences": ["Islamic Conference"],
        "Workshops": ["Islamic Workshop"],
        "Hajj & Umrah": ["Hajj Programme", "Umrah Programme"],
    }
    category_assets = {
        "Events": "category_events",
        "Courses": "category_courses",
        "Mosque Tours": "category_mosque_tours",
        "Retreats": "category_community",
        "Fundraisers": "category_community",
        "ISOC": "category_community",
        "Conferences": "category_seminars",
        "Workshops": "category_seminars",
        "Hajj & Umrah": "category_mosque_tours",
    }
    category_specs = []
    for category_id, title in enumerate(category_assets, start=1):
        topics = []
        seen_topics = set()
        for topic in CANONICAL_ACTIVITY_TOPICS.get(title, []) + legacy_topics[title]:
            normalized_topic = GamificationService._normalize_classification_name(topic)
            if normalized_topic not in seen_topics:
                topics.append(topic)
                seen_topics.add(normalized_topic)
        category_specs.append((category_id, title, topics, category_assets[title]))
    categories = {}
    for category_id, title, _, asset_key in category_specs:
        categories[title] = add(Category(
            id=category_id,
            title=title,
            ar_title=title,
            image=asset_urls[asset_key],
            position=category_id,
            status=1,
            home_view=True,
            is_material=1,
            is_speaker=1,
            is_curriculum=1,
            is_itinerary=1,
            is_tourslot=1,
        ))

    expertise = {}
    expertise_titles = [
        "Fiqh (Shafi)",
        "Hadith",
        "Marriage Counselling",
        "Family Disputes",
        "Quran",
        "Fiqh (Hanbali)",
        "Seerah",
        "Purification of the Heart",
        "Revert Support",
        "Youth Mentor",
    ]
    for position, title in enumerate(expertise_titles, start=1):
        expertise[title] = add(Expertise(
            title=title,
            ar_title=title,
            position=position,
            status=1,
        ))

    return sect, school, levels, languages, tags, facilities, categories, category_specs, expertise


def new_user(
    *,
    role_type,
    first_name,
    last_name="",
    email,
    mobile,
    image,
    journey_level_id,
    created_on=None,
    parent_id=None,
    privacy=None,
):
    privacy = privacy or {}
    return add(Users(
        parent_id=parent_id,
        role_type=role_type,
        first_name=first_name,
        last_name=last_name,
        country_code="+44",
        mobile_number=mobile,
        email_id=email,
        password=generate_password_hash("123456", method="pbkdf2:sha256"),
        status=1,
        profile_image=image,
        journey_level_id=journey_level_id,
        time_zone="Europe/London",
        created_on=created_on or datetime.utcnow(),
        show_events=privacy.get("show_events", 0),
        show_course=privacy.get("show_course", 0),
        show_reviews=privacy.get("show_reviews", 0),
        show_journeylevel=privacy.get("show_journeylevel", 0),
        show_mobile_number=privacy.get("show_mobile_number", 0),
    ))


def seed_people_and_organisations(sect, school, levels, asset_urls):
    suitable = levels["Suitable for all"].id
    beginner = levels["Beginner"].id
    intermediate = levels["Intermediate"].id

    organiser_specs = [
        (
            "rijal",
            "The Rijal Club Organiser",
            "org@gmail.com",
            "7392007576",
            "The Rijal Club",
            "Brotherhood · Knowledge · Rujulah",
            asset_urls["rijal_club_logo"],
            "565A High Rd, London N17 6SN, UK",
            "N17 6SN",
        ),
        (
            "finsbury",
            "Finsbury Park Mosque Organiser",
            "finsbury.reference@ondeen.test",
            "700000011",
            "Finsbury Park Mosque",
            "Community mosque in Greater London.",
            asset_urls["friday_weekly_circle_cover"],
            "Finsbury Park, London, UK",
            "N4",
        ),
        (
            "tarbiyah",
            "Masjid Al-Tarbiyah Organiser",
            "tarbiyah.reference@ondeen.test",
            "700000012",
            "Masjid Al-Tarbiyah",
            "Islamic learning and community activities.",
            asset_urls["tafsir_ul_quran_cover"],
            "49-51 Leswin Rd, London N16 7NX, UK",
            "N16 7NX",
        ),
    ]
    organisers = {}
    for key, display_name, email, mobile, org_name, about, image, location, postcode in organiser_specs:
        organiser = new_user(
            role_type=3,
            first_name=display_name,
            email=email,
            mobile=mobile,
            image=image,
            journey_level_id=suitable,
        )
        add(Organization(
            user_id=organiser.id,
            organization_name=org_name,
            manager_name=display_name,
            public_email_id="therijalclub@gmail.com" if key == "rijal" else email,
            public_country_code="+44",
            public_mobile_number=mobile,
            location=location,
            latitude=51.5882,
            longitude=-0.0730,
            foundation_date=date(2024, 1, 1),
            post_code=postcode,
            sect_representation=sect.id,
            school_thought=school.id,
            charity_registered=False,
            charity_no="",
            status=1,
            verify_event=1,
            created_by=organiser.id,
            updated_by=organiser.id,
            about_us=about,
        ))
        organisers[key] = organiser

    main_user = new_user(
        role_type=2,
        first_name="Muhammad",
        last_name="Zulfikar",
        email="user@gmail.com",
        mobile="7392007576",
        image=asset_urls["muhammad_zulfikar"],
        journey_level_id=intermediate,
        created_on=datetime(2025, 6, 4, 12, 0),
        privacy={
            "show_events": 1,
            "show_course": 1,
            "show_reviews": 1,
            "show_journeylevel": 1,
            "show_mobile_number": 0,
        },
    )

    user_specs = [
        ("uzair", "Uzair", "k", datetime(2026, 1, 27, 12, 0)),
        ("zubair", "Zubair Hamid", "Johnstone", datetime(2025, 8, 1, 12, 0)),
        ("azeez", "Azeez", "Nauzer", datetime(2025, 8, 2, 12, 0)),
        ("hamza", "Hamza", "Baptiste", datetime(2025, 8, 3, 12, 0)),
        ("hakan", "Hakan", "Tekcan", datetime(2025, 8, 4, 12, 0)),
        ("tilal", "Tilal", "H", datetime(2025, 8, 5, 12, 0)),
        ("taseen", "MD Abdul Taseen", "Huda", datetime(2025, 8, 6, 12, 0)),
        ("raees", "Raees", "Dilloo", datetime(2025, 8, 7, 12, 0)),
        ("abdul_malik", "Abdul-malik", "ayewa", datetime(2025, 8, 8, 12, 0)),
        ("cicek", "Cicek", "C", datetime(2025, 8, 9, 12, 0)),
    ]
    customers = {"muhammad": main_user}
    for index, (key, first_name, last_name, joined) in enumerate(user_specs, start=1):
        customers[key] = new_user(
            role_type=2,
            first_name=first_name,
            last_name=last_name,
            email=f"{key}.reference@ondeen.test",
            mobile=f"700001{index:03d}",
            image=asset_urls["default_user"],
            journey_level_id=beginner,
            created_on=joined,
        )

    buddy = new_user(
        role_type=5,
        first_name="Muhammad",
        last_name="Zulfikar",
        email="buddy.muhammad.reference@ondeen.test",
        mobile="7392007576",
        image=asset_urls["muhammad_zulfikar"],
        journey_level_id=intermediate,
        parent_id=organisers["rijal"].id,
    )

    return organisers, customers, buddy


def seed_subcategories_and_access(organisers, categories, category_specs):
    subcategories = {}
    creator = organisers["rijal"]
    for _, title, sub_titles, _ in category_specs:
        category = categories[title]
        for position, sub_title in enumerate(sub_titles, start=1):
            classification = GamificationService.classification_for_topic(sub_title, title)
            subcategories[(title, sub_title)] = add(SubCategory(
                category_id=category.id,
                title=sub_title,
                ar_title=sub_title,
                image=category.image,
                topic_key=classification["topic_id"],
                radar_area=classification["radar_area"],
                classification_description=classification["description"],
                position=position,
                status=1,
                created_by=creator.id,
                updated_by=creator.id,
            ))

    for organiser in organisers.values():
        for category in categories.values():
            link = add(OrganizerCategory(
                user_id=organiser.id,
                category_id=category.id,
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
            ))
            for subcategory in SubCategory.query.filter_by(category_id=category.id, status=1).all():
                add(OrganizerSubCategory(
                    organizer_category_id=link.id,
                    subcategory_id=subcategory.id,
                    status=1,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ))
    return subcategories


def seed_speakers(sect, school, levels, expertise, asset_urls):
    specs = [
        (
            "habib",
            "Sheikh Habib",
            "Hassan",
            "habib.hassan.reference@ondeen.test",
            asset_urls["sheikh_habib_hassan"],
            "One of the founders and the Chairman of Assunnah. He is a student of Dr Sheikh Ahmed Dahir and has been actively involved in Islamic education.",
            ["Fiqh (Shafi)", "Hadith", "Marriage Counselling", "Family Disputes", "Quran", "Fiqh (Hanbali)", "Seerah"],
        ),
        (
            "sajid",
            "Sheikh Sajid",
            "Umar",
            "sajid.umar.reference@ondeen.test",
            asset_urls["sheikh_sajid_umar"],
            "Teacher of The Disease & the Cure and purification of the heart.",
            ["Purification of the Heart"],
        ),
        (
            "hamza_tzortzis",
            "Ust Hamza",
            "Tzortzis",
            "hamza.tzortzis.reference@ondeen.test",
            asset_urls["ust_hamza_tzortzis"],
            "An author, public speaker,",
            ["Revert Support", "Youth Mentor"],
        ),
        ("muhammad_unais", "Muhammad", "Unais", "m.unais.reference@ondeen.test", asset_urls["default_user"], "", []),
        ("abdul_lateef", "Ust Abdul Lateef", "Muawhid", "a.muawhid.reference@ondeen.test", asset_urls["default_user"], "", []),
        ("ibrahim", "Ust Ibrahim", "Al-Zahrani", "i.zahrani.reference@ondeen.test", asset_urls["default_user"], "", []),
        ("khidir", "Imam Khidir", "Hussein", "k.hussein.reference@ondeen.test", asset_urls["default_user"], "", []),
    ]
    speaker_users = {}
    for index, (key, first_name, last_name, email, image, biography, expertise_titles) in enumerate(specs, start=1):
        user = new_user(
            role_type=4,
            first_name=first_name,
            last_name=last_name,
            email=email,
            mobile=f"700002{index:03d}",
            image=image,
            journey_level_id=levels["Suitable for all"].id,
        )
        add(Speaker(
            user_id=user.id,
            country_of_residence="United Kingdom",
            about_us=biography,
            status=1,
            created_by=user.id,
            updated_by=user.id,
            qualification="Islamic studies" if key in ("habib", "sajid") else "",
        ))
        add(SpeakerSectType(
            user_id=user.id,
            sect_type_id=sect.id,
            status=1,
            created_by=user.id,
            updated_by=user.id,
        ))
        add(SpeakerSchoolOfThought(
            user_id=user.id,
            school_of_thought_id=school.id,
            status=1,
            created_by=user.id,
            updated_by=user.id,
        ))
        for title in expertise_titles:
            add(SpeakerExpertise(
                user_id=user.id,
                expertise_id=expertise[title].id,
                status=1,
                created_by=user.id,
                updated_by=user.id,
            ))
        speaker_users[key] = user

    availability = add(SpeakerAvailabilityDate(
        user_id=speaker_users["habib"].id,
        weekday=5,
        status=1,
        created_by=speaker_users["habib"].id,
        updated_by=speaker_users["habib"].id,
    ))
    add(SpeakerAvailabilityTime(
        availability_date_id=availability.id,
        start_time=time(17, 0),
        end_time=time(18, 0),
        status=1,
        created_by=speaker_users["habib"].id,
        updated_by=speaker_users["habib"].id,
    ))
    return speaker_users


def add_event_dates(event_obj, start_day, count, interval_days, start_clock, end_clock):
    for offset in range(count):
        session_day = start_day + timedelta(days=offset * interval_days)
        event_date = add(EventDate(
            event_id=event_obj.id,
            date=session_day,
            status=1,
            created_by=event_obj.user_id,
            updated_by=event_obj.user_id,
        ))
        add(EventDateTime(
            event_date_id=event_date.id,
            start_time=start_clock,
            end_time=end_clock,
            available=event_obj.available,
            booked=event_obj.booked,
            status=1,
            created_by=event_obj.user_id,
            updated_by=event_obj.user_id,
        ))


def seed_events(organisers, levels, languages, categories, subcategories, tags, facilities, asset_urls, speaker_users):
    specs = [
        {
            "key": "knowledge",
            "title": "The Knowledge Class",
            "organiser": "rijal",
            "start": date(2026, 1, 28),
            "end": date(2026, 12, 31),
            "time": (time(19, 30), time(20, 30)),
            "sessions": 49,
            "interval": 7,
            "location": "565A High Rd, London N17 6SN, UK",
            "online": False,
            "level": "Intermediate",
            "image": "weekly_knowledge_class_cover",
            "description": "A relaxed, welcoming weekly Islamic learning circle covering essentials of faith, character and everyday practice.",
            "speakers": ["habib"],
            "status": 1,
        },
        {
            "key": "friday_circle",
            "title": "Friday Weekly Circle",
            "organiser": "finsbury",
            "start": date(2026, 7, 24),
            "end": date(2027, 12, 31),
            "time": (time(19, 0), time(20, 0)),
            "sessions": 76,
            "interval": 7,
            "location": "Finsbury Park Mosque, London, UK",
            "online": False,
            "level": "Suitable for all",
            "image": "friday_weekly_circle_cover",
            "description": "Friday Weekly Circle with reminders, youth club and refreshments.",
            "speakers": [],
            "status": 1,
        },
        {
            "key": "tafsir",
            "title": "Tafsir ul-Quran",
            "organiser": "tarbiyah",
            "start": date(2026, 1, 24),
            "end": date(2027, 12, 30),
            "time": (time(19, 30), time(21, 0)),
            "sessions": 101,
            "interval": 7,
            "location": "49-51 Leswin Rd, London N16 7NX, UK",
            "online": False,
            "level": "Suitable for all",
            "image": "tafsir_ul_quran_cover",
            "description": "Weekly Tafsir ul-Quran course at Masjid Al-Tarbiyah.",
            "speakers": [],
            "status": 1,
        },
        {
            "key": "disease",
            "title": "The Disease & the Cure — Ibn al-Qayyim",
            "organiser": "rijal",
            "start": date(2025, 11, 10),
            "end": date(2026, 1, 9),
            "time": (time(20, 0), time(21, 0)),
            "sessions": 9,
            "interval": 7,
            "location": "Online",
            "online": True,
            "level": "Suitable for all",
            "image": "disease_and_cure_cover",
            "description": "Join Steps to Jannah for a deep dive into Ibn al-Qayyim’s The Diseases and the Cure, taught by Sheikh Dr Sajid Umar. It’s a journey into the purification of the heart confronting lust, ego, and the desires that harden the heart. Real change starts from within, and this course is a chance to work on the part of us that matters most. #StepsToJannah #PurificationOfTheHeart",
            "speakers": ["sajid"],
            "status": 1,
        },
        {
            "key": "tafseer_series",
            "title": "8-Week Tafseer Series - Understanding The Quran",
            "organiser": "rijal",
            "start": date(2025, 10, 23),
            "end": date(2025, 12, 11),
            "time": (time(19, 0), time(20, 0)),
            "sessions": 8,
            "interval": 7,
            "location": "London, UK",
            "online": False,
            "level": "Suitable for all",
            "image": "weekly_knowledge_class_cover",
            "description": "8-Week Tafseer Series.",
            "speakers": [],
            "status": 1,
        },
        {
            "key": "deen_over_dunya",
            "title": "Deen Over Dunya: The Firm Believer",
            "organiser": "rijal",
            "start": date(2025, 10, 17),
            "end": date(2025, 10, 17),
            "time": (time(19, 0), time(21, 0)),
            "sessions": 1,
            "interval": 1,
            "location": "London, UK",
            "online": False,
            "level": "Suitable for all",
            "image": "deen_over_dunya_cover",
            "description": "Deen Over Dunya: The Firm Believer.",
            "speakers": [],
            "status": 1,
        },
        {
            "key": "aqidah",
            "title": "Aqidah Al-Salaf - Ibn Abi Zayd Qayrawani",
            "organiser": "rijal",
            "start": date(2025, 8, 27),
            "end": date(2025, 8, 27),
            "time": (time(19, 0), time(21, 0)),
            "sessions": 1,
            "interval": 1,
            "location": "London, UK",
            "online": False,
            "level": "Suitable for all",
            "image": "aqidah_al_salaf_cover",
            "description": "Aqidah Al-Salaf by Ibn Abi Zayd Qayrawani.",
            "speakers": [],
            "status": 1,
        },
    ]

    events = {}
    category = categories["Courses"]
    subcategory = subcategories[("Courses", "Tafsir")]
    for event_index, spec in enumerate(specs):
        organiser = organisers[spec["organiser"]]
        start_clock, end_clock = spec["time"]
        created_on = (
            datetime.utcnow() - timedelta(minutes=event_index)
            if event_index < 3
            else datetime.utcnow() - timedelta(days=30, minutes=event_index)
        )
        event_obj = add(Event(
            user_id=organiser.id,
            title=spec["title"],
            ar_title=spec["title"],
            category_id=category.id,
            sub_category_id=subcategory.id,
            description=spec["description"],
            ar_description=spec["description"],
            start_date=datetime.combine(spec["start"], time.min),
            end_date=datetime.combine(spec["end"], time.min),
            start_time=start_clock,
            end_time=end_clock,
            event_type=2,
            location=spec["location"],
            latitude=0 if spec["online"] else 51.5882,
            longitude=0 if spec["online"] else -0.0730,
            price_type=0,
            price=0,
            journey_level_id=levels[spec["level"]].id,
            language_id=languages["English"].id,
            gender=3,
            total_no_class=spec["sessions"],
            call_per_week=1,
            location_type=0 if spec["online"] else 1,
            meet_link="https://us06web.zoom.us/j/89507975778" if spec["online"] else None,
            duration=max(1, int((datetime.combine(date.today(), end_clock) - datetime.combine(date.today(), start_clock)).total_seconds() // 3600)),
            available=300,
            booked=0,
            quantity_per_user=4,
            qrcode_type=0,
            ticket_type=0,
            occusr_type=3 if spec["sessions"] > 1 else 1,
            occusr_weekday=str(spec["start"].weekday()),
            rule="Please arrive on time and follow organiser guidance.",
            ar_rule="Please arrive on time and follow organiser guidance.",
            eligibility="Open to the community.",
            ar_eligibility="Open to the community.",
            cancellation_policy="Cancel from the app if you can no longer attend.",
            ar_cancellation_policy="Cancel from the app if you can no longer attend.",
            terms_condition="Respect the venue and other attendees.",
            ar_terms_condition="Respect the venue and other attendees.",
            status=spec["status"],
            created_by=organiser.id,
            updated_by=organiser.id,
            created_on=created_on,
            updated_on=created_on,
            time_zone="Europe/London",
        ))
        event_obj.share_url = f"{os.environ['ONDEEN_SEED_BASE_URL'].rstrip('/')}/open?id={event_obj.id}"
        image_url = asset_urls[spec["image"]]
        add(EventImages(
            event_id=event_obj.id,
            cropped_image=image_url,
            full_screen_image=image_url,
            status=1,
            created_by=organiser.id,
            updated_by=organiser.id,
        ))
        add(EventGuestBookingSetting(
            event_id=event_obj.id,
            enabled=True,
            created_by=organiser.id,
            updated_by=organiser.id,
        ))
        for tag in (tags["Free"], tags["Tafsir"], tags["Unisex"], tags["Online" if spec["online"] else "In person"]):
            add(EventTags(
                event_id=event_obj.id,
                tag_id=tag.id,
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
            ))
        if not spec["online"]:
            for facility in list(facilities.values())[:2]:
                add(EventFacilities(
                    event_id=event_obj.id,
                    facilities_id=facility.id,
                    status=1,
                    created_by=organiser.id,
                    updated_by=organiser.id,
                ))
        for speaker_key in spec["speakers"]:
            speaker = speaker_users[speaker_key]
            add(EventSpeakers(
                event_id=event_obj.id,
                user_id=speaker.id,
                status=1,
                created_by=organiser.id,
                updated_by=organiser.id,
                first_name=speaker.first_name,
                last_name=speaker.last_name,
                image=speaker.profile_image,
            ))
        add_event_dates(
            event_obj,
            spec["start"],
            spec["sessions"],
            spec["interval"],
            start_clock,
            end_clock,
        )
        events[spec["key"]] = event_obj

    return events


def add_participant(event_obj, user, status=1, created_on=None, ticket_title="General Admission"):
    ticket = EventTicket.query.filter_by(event_id=event_obj.id, title=ticket_title).first()
    if ticket is None:
        ticket = add(EventTicket(
            event_id=event_obj.id,
            title=ticket_title,
            price=0,
            available=event_obj.available,
            booked=0,
            status=1,
            created_by=event_obj.user_id,
            updated_by=event_obj.user_id,
        ))
    first_date = EventDate.query.filter_by(event_id=event_obj.id).order_by(EventDate.date.asc()).first()
    participant = add(Participant(
        event_id=event_obj.id,
        user_id=user.id,
        paid_amount=0,
        created_on=created_on or datetime.utcnow(),
        created_by=user.id,
        qrcode=f"ondeen://ticket/{event_obj.id}/{user.id}",
        ticket=f"{event_obj.title} · {ticket_title}",
        date=first_date.date if first_date else event_obj.start_date.date(),
        start_time=event_obj.start_time,
        end_time=event_obj.end_time,
        quantity=1,
        ticket_id=ticket.id,
        status=status,
    ))
    ticket.booked = (ticket.booked or 0) + 1
    event_obj.booked = (event_obj.booked or 0) + 1
    return participant


def seed_bookings_and_social_data(events, customers, buddy, speaker_users):
    main_user = customers["muhammad"]
    knowledge_main = add_participant(events["knowledge"], main_user, created_on=datetime(2026, 7, 22, 18, 0))
    add_participant(events["knowledge"], customers["uzair"], created_on=datetime(2026, 1, 28, 18, 0))
    add_participant(events["tafsir"], main_user, created_on=datetime(2026, 1, 24, 18, 0))

    completed_users = [
        customers["zubair"],
        customers["azeez"],
        customers["hamza"],
        customers["hakan"],
        customers["tilal"],
        customers["taseen"],
        customers["raees"],
        customers["abdul_malik"],
        customers["cicek"],
        main_user,
    ]
    disease_participants = []
    for index, user in enumerate(completed_users):
        disease_participants.append(add_participant(
            events["disease"],
            user,
            created_on=datetime(2025, 11, 10, 19, 0) + timedelta(minutes=index),
            ticket_title="Online Admission",
        ))

    add_participant(events["tafseer_series"], main_user, status=2, created_on=datetime(2025, 10, 23, 18, 0))
    add_participant(events["deen_over_dunya"], main_user, created_on=datetime(2025, 10, 17, 18, 0))
    add_participant(events["aqidah"], main_user, created_on=datetime(2025, 8, 27, 18, 0))

    attendance_dates = [date(2026, 7, 22)] + [date(2025, 11, 10) + timedelta(days=7 * i) for i in range(7)]
    add(ParticipantsAttendance(
        participant_id=knowledge_main.id,
        event_id=events["knowledge"].id,
        attendance_date=attendance_dates[0],
        status=1,
    ))
    for attendance_day in attendance_dates[1:]:
        add(ParticipantsAttendance(
            participant_id=disease_participants[-1].id,
            event_id=events["disease"].id,
            attendance_date=attendance_day,
            status=1,
        ))

    add(Request_buddy(
        event_id=events["knowledge"].id,
        user_id=main_user.id,
        status=1,
        type=1,
        buddy_id=buddy.id,
        created_by=main_user.id,
        updated_by=main_user.id,
        user_comment="Reference buddy request",
        time_zone="Europe/London",
    ))

    next_saturday = date.today() + timedelta(days=(5 - date.today().weekday()) % 7 or 7)
    session_dates = [next_saturday, date(2025, 11, 22), date(2025, 11, 12)]
    session_times = [time(16, 0), time(16, 0), time(11, 30)]
    for index, (session_date, session_time) in enumerate(zip(session_dates, session_times), start=1):
        add(Request_buddy(
            event_id=events["knowledge"].id,
            user_id=main_user.id,
            status=1 if index == 1 else 6,
            type=2,
            buddy_id=0,
            date=session_date,
            time=session_time,
            meet_link=None,
            speaker_id=speaker_users["habib"].id,
            user_comment="Reference one-to-one session" if index == 1 else "Completed reference session",
            time_zone="Europe/London",
            completed_on=(
                datetime.combine(session_date, session_time)
                if index > 1
                else None
            ),
            created_by=main_user.id,
            updated_by=main_user.id,
        ))

    return knowledge_main


def seed_materials_notes_notifications(events, main_user, asset_urls):
    info_document = add(EventDocuments(
        event_id=events["knowledge"].id,
        document_name="Info",
        ar_document_name="Info",
        file_path=None,
        status=1,
        created_by=events["knowledge"].user_id,
        updated_by=events["knowledge"].user_id,
    ))
    add(EventDocumentsFiles(
        event_document_id=info_document.id,
        file_path=asset_urls["knowledge_pre_read"],
        status=1,
        created_by=events["knowledge"].user_id,
        updated_by=events["knowledge"].user_id,
    ))
    add(EventDocumentsFiles(
        event_document_id=info_document.id,
        file_path=asset_urls["weekly_knowledge_class_cover"],
        status=1,
        created_by=events["knowledge"].user_id,
        updated_by=events["knowledge"].user_id,
    ))
    recap_document = add(EventDocuments(
        event_id=events["knowledge"].id,
        document_name="Post-session summary · Review your notes and prepare one question for the next class.",
        ar_document_name="Post-session summary",
        file_path=None,
        status=1,
        created_by=events["knowledge"].user_id,
        updated_by=events["knowledge"].user_id,
    ))
    add(EventDocumentsFiles(
        event_document_id=recap_document.id,
        file_path=asset_urls["knowledge_audio_recap"],
        status=1,
        created_by=events["knowledge"].user_id,
        updated_by=events["knowledge"].user_id,
    ))

    note_specs = [
        (events["knowledge"], "z", "Session o w", datetime(2026, 7, 23, 7, 38)),
        (events["disease"], "Revision Dua's chances", "- the last", datetime(2025, 12, 1, 20, 10)),
        (
            events["disease"],
            "Lesson 3",
            "Dua when faced with calamity has three situations: 1. When the dua is more powerful than the affliction it drives it away. 2. Lessens its impact. 3. If they are equal then the dua will repel the calamity from overcoming the person.",
            datetime(2025, 11, 24, 20, 18),
        ),
        (
            events["disease"],
            "Ruqyah",
            "The effectiveness of ruqyah: heart receptive; hope in Allah; patience; strong resolve; intention.",
            datetime(2025, 11, 10, 20, 40),
        ),
    ]
    for event_obj, title, body, created_on in note_specs:
        add(Event_note(
            event_id=event_obj.id,
            user_id=main_user.id,
            title=title,
            notes=body,
            status=1,
            created_on=created_on,
            updated_on=created_on,
            created_by=main_user.id,
            updated_by=main_user.id,
        ))

    announcement_specs = [
        (events["knowledge"], "Room update", "Reference room or venue update"),
        (events["disease"], "Online check-in", "Your six-digit online check-in code is 482913"),
    ]
    for event_obj, title, message in announcement_specs:
        add(EventAnnouncements(
            event_id=event_obj.id,
            title=title,
            message=message,
            status=1,
            created_by=event_obj.user_id,
            updated_by=event_obj.user_id,
        ))

    notification_specs = [
        (5, events["knowledge"], "Booking confirmed", "Your booking for The Knowledge Class is confirmed."),
        (3, events["knowledge"], "Buddy requested", "Your buddy request has been received."),
        (7, events["disease"], "Meeting link updated", "Open your online booking: ondeen://booking/disease-and-cure"),
        (7, events["knowledge"], "Material uploaded", "Info is now available in Event Material."),
        (7, events["knowledge"], "Booking reminder", "The Knowledge Class starts in 24 hours."),
        (7, events["knowledge"], "Booking reminder", "The Knowledge Class starts in 30 minutes."),
    ]
    for index, (notification_type, event_obj, title, message) in enumerate(notification_specs, start=1):
        add(Notification_History(
            participant_id=0,
            event_id=event_obj.id,
            push=True,
            sms=False,
            email=False,
            type=notification_type,
            title=title,
            message=message,
            send_to=2,
            task_id=f"refs-notification-{index}",
            user_id=main_user.id,
            seen=0 if index <= 2 else 1,
            status=1,
            created_on=datetime.utcnow() - timedelta(minutes=index),
        ))

    add(OnlineSessionCheckInCode(
        event_id=events["disease"].id,
        session_date=date(2025, 11, 24),
        code="482913",
        status=1,
        created_by=events["disease"].user_id,
        updated_by=events["disease"].user_id,
    ))


def run_refs_seed(base_url, upload_dir, upload_public_path):
    """Seed REFS into an already reset, empty database and return a summary."""
    asset_urls = copy_reference_assets(base_url, upload_dir, upload_public_path)
    sect, school, levels, languages, tags, facilities, categories, category_specs, expertise = seed_reference_tables(asset_urls)
    organisers, customers, buddy = seed_people_and_organisations(sect, school, levels, asset_urls)
    subcategories = seed_subcategories_and_access(organisers, categories, category_specs)
    speaker_users = seed_speakers(sect, school, levels, expertise, asset_urls)
    events = seed_events(
        organisers,
        levels,
        languages,
        categories,
        subcategories,
        tags,
        facilities,
        asset_urls,
        speaker_users,
    )
    knowledge_participant = seed_bookings_and_social_data(events, customers, buddy, speaker_users)
    seed_materials_notes_notifications(events, customers["muhammad"], asset_urls)
    db.session.commit()

    return {
        "categories": len(categories),
        "organisations": len(organisers),
        "users": len(customers),
        "speakers": len(speaker_users),
        "events": len(events),
        "knowledge_event_id": events["knowledge"].id,
        "knowledge_participant_id": knowledge_participant.id,
        "main_user_id": customers["muhammad"].id,
        "habib_user_id": speaker_users["habib"].id,
        "payment_records": 0,
    }
