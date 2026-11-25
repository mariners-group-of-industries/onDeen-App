#!/usr/bin/env python3
"""Fail fast when the local REFS seed drifts from the reference dataset."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from wsgi import app
from app.models.category import Category
from app.models.event import Event, EventDocuments, EventDocumentsFiles, EventSpeakers, Participant, PaymentTransaction
from app.models.organization import Organization
from app.models.speakers import Expertise, SpeakerExpertise
from app.models.users import Users
from app.services.customer.event import EventService


def require(condition, message):
    if not condition:
        raise AssertionError(message)


with app.app_context():
    knowledge = Event.query.filter_by(title="The Knowledge Class").one()
    habib = Users.query.filter_by(first_name="Sheikh Habib", last_name="Hassan", role_type=4).one()
    muhammad = Users.query.filter_by(first_name="Muhammad", last_name="Zulfikar", role_type=2).one()
    uzair = Users.query.filter_by(first_name="Uzair", last_name="k", role_type=2).one()
    organiser = Users.query.filter_by(email_id="org@gmail.com", role_type=3).one()

    require(Category.query.count() == 9, "Expected the nine backend REFS categories")
    require(Organization.query.count() == 3, "Expected the three observed organisations")
    require(Users.query.filter_by(role_type=2).count() == 11, "Expected eleven customer profiles")
    require(Users.query.filter_by(role_type=4).count() == 7, "Expected seven speakers")
    require(Event.query.count() == 7, "Expected seven reference listings")
    require(PaymentTransaction.query.count() == 0, "Payment data must stay deferred")
    require(organiser.organizations[0].organization_name == "The Rijal Club", "Demo organiser login drifted")

    participant_ids = {
        row.user_id for row in Participant.query.filter_by(event_id=knowledge.id, status=1).all()
    }
    require(participant_ids == {muhammad.id, uzair.id}, "Knowledge Class participants drifted")
    require(
        EventSpeakers.query.filter_by(event_id=knowledge.id, user_id=habib.id, status=1).count() == 1,
        "Sheikh Habib Hassan must teach The Knowledge Class",
    )

    expertise = {
        row.expertise.title
        for row in SpeakerExpertise.query.filter_by(user_id=habib.id, status=1).all()
    }
    require(
        expertise == {
            "Fiqh (Shafi)",
            "Hadith",
            "Marriage Counselling",
            "Family Disputes",
            "Quran",
            "Fiqh (Hanbali)",
            "Seerah",
        },
        "Sheikh Habib Hassan expertise drifted",
    )
    require(Expertise.query.count() == 10, "Expected all observed expertise labels")
    require("/refs/" in knowledge.images[0].cropped_image, "Knowledge cover is not a REFS asset")
    require("/refs/" in habib.profile_image, "Speaker avatar is not a REFS asset")
    require("/refs/" in muhammad.profile_image, "Participant avatar is not a REFS asset")
    material_documents = EventDocuments.query.filter_by(event_id=knowledge.id, status=1).all()
    require(len(material_documents) == 2, "Knowledge Class material document groups drifted")
    material_files = EventDocumentsFiles.query.filter(
        EventDocumentsFiles.event_document_id.in_([row.id for row in material_documents]),
        EventDocumentsFiles.status == 1,
    ).all()
    require(len(material_files) == 3, "Knowledge Class PDF/image/audio material set drifted")
    require(
        any((row.file_path or "").endswith("knowledge-class-pre-read.pdf") for row in material_files),
        "Knowledge Class pre-read PDF is missing",
    )
    require(
        any((row.file_path or "").endswith("knowledge-class-audio-recap.mp3") for row in material_files),
        "Knowledge Class audio recap is missing",
    )

    participants = EventService.participant_list(muhammad.id, {"event_id": knowledge.id})
    require(
        [(item["first_name"], item["last_name"]) for item in participants]
        == [("Muhammad", "Zulfikar"), ("Uzair", "k")],
        "Knowledge Class participant response drifted",
    )

    client = app.test_client()
    token_response = client.get("/generate_token")
    require(token_response.status_code == 200, "generate_token failed")
    auth_token = token_response.get_json().get("access_token")
    require(auth_token, "generate_token returned no access token")
    headers = {"auth-token": auth_token, "Timezone": "Europe/London"}

    user_login = client.post(
        "/customer_app/users/login",
        headers=headers,
        json={"email_id": "user@gmail.com", "password": "123456"},
    )
    require(user_login.status_code == 200, "User demo login endpoint failed")
    require(user_login.get_json().get("status") is True, "User demo credentials drifted")
    user_bearer = user_login.get_json()["response"]["access_token"]

    guest_detail = client.get(
        f"/customer_app/event/event_id?id={knowledge.id}",
        headers=headers,
    )
    require(guest_detail.status_code == 200, "Guest event detail failed")
    require(guest_detail.get_json()["response"]["documents"] == [], "Guest received booked-only material")

    booked_detail = client.get(
        f"/customer_app/event/event_id?id={knowledge.id}",
        headers={**headers, "Authorization": f"Bearer {user_bearer}"},
    )
    require(booked_detail.status_code == 200, "Booked event detail failed")
    booked_documents = booked_detail.get_json()["response"]["documents"]
    require(len(booked_documents) == 2, "Booked User did not receive material groups")
    booked_file_types = {
        file_data["file_type"]
        for document in booked_documents
        for file_data in document["files"]
    }
    require(booked_file_types == {"pdf", "png", "mp3"}, "Booked material types drifted")

    organiser_login = client.post(
        "/organizer_app/login/login_password",
        headers=headers,
        json={"email_id": "org@gmail.com", "password": "123456"},
    )
    require(organiser_login.status_code == 200, "Organiser demo login endpoint failed")
    require(organiser_login.get_json().get("status") is True, "Organiser demo credentials drifted")

    otp_send = client.post(
        "/organizer_app/login/email_send_otp",
        headers=headers,
        json={"email_id": "org@gmail.com"},
    )
    require(otp_send.status_code == 200, "Organiser OTP send endpoint failed")
    require(otp_send.get_json().get("status") is True, "Organiser OTP send failed")
    otp_verify = client.post(
        "/organizer_app/login/email_verify_otp",
        headers=headers,
        json={"email_id": "org@gmail.com", "otp": "123456"},
    )
    require(otp_verify.status_code == 200, "Organiser OTP verify endpoint failed")
    require(otp_verify.get_json().get("status") is True, "Test OTP 123456 drifted")

    home_response = client.get("/customer_app/home/home", headers=headers)
    require(home_response.status_code == 200, "Customer Home endpoint failed")
    home_payload = home_response.get_json()
    require(home_payload.get("status") is True, "Customer Home response failed")
    home_events = home_payload["response"]["banner"]["events"]
    require(
        [event["title"] for event in home_events[:3]]
        == ["The Knowledge Class", "Friday Weekly Circle", "Tafsir ul-Quran"],
        "Customer Home reference ordering drifted",
    )
    require(
        all("/refs/" in event["primary_image"] for event in home_events[:3]),
        "Customer Home is not serving REFS artwork",
    )

    speaker_response = client.get(
        f"/customer_app/speaker/speaker_id?id={habib.id}",
        headers=headers,
    )
    require(speaker_response.status_code == 200, "Speaker profile endpoint failed")
    speaker_payload = speaker_response.get_json()
    require(speaker_payload.get("status") is True, "Speaker profile response failed")
    require(
        speaker_payload["response"]["user_first_name"] == "Sheikh Habib"
        and speaker_payload["response"]["user_last_name"] == "Hassan",
        "Speaker profile name drifted",
    )
    require(
        [event["title"] for event in speaker_payload["response"]["event_list"]["events"]]
        == ["The Knowledge Class"],
        "Speaker profile event list drifted",
    )

    print("REFS_SEED_VALIDATION_OK")
    print(
        f"categories=9 organisations=3 users=11 speakers=7 events=7 "
        f"knowledge_participants=2 payments=0"
    )
