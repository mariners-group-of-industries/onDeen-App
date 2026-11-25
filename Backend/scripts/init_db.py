import importlib
import os
import pkgutil
import shutil
import sys
from pathlib import Path
from urllib.parse import unquote, urlparse

from dotenv import load_dotenv


def sync_reference_materials(root):
    """Add the sacred event-material fixtures without resetting live data."""
    from app import db
    from app.models.event import Event, EventDocuments, EventDocumentsFiles, EventImages

    knowledge = Event.query.filter_by(id=1, title="The Knowledge Class", status=1).first()
    if not knowledge:
        return {"synced": False, "reason": "reference event absent"}

    cover = EventImages.query.filter_by(event_id=knowledge.id, status=1).order_by(EventImages.id).first()
    cover_url = getattr(cover, "cropped_image", None) if cover else None
    if not cover_url or "/uploads/" not in cover_url:
        return {"synced": False, "reason": "reference cover URL absent"}

    parsed_cover_path = unquote(urlparse(cover_url).path)
    relative_cover_path = parsed_cover_path.split("/uploads/", 1)[1]
    target_dir = Path(os.getenv("UPLOAD_ROOT", "/data/uploads")) / Path(relative_cover_path).parent
    target_dir.mkdir(parents=True, exist_ok=True)

    asset_names = (
        "knowledge-class-pre-read.pdf",
        "knowledge-class-audio-recap.mp3",
    )
    source_dir = root / "seed_assets" / "refs"
    for asset_name in asset_names:
        source = source_dir / asset_name
        if not source.is_file():
            raise RuntimeError(f"Missing reference material asset: {source}")
        shutil.copy2(source, target_dir / asset_name)

    public_parent = cover_url.rsplit("/", 1)[0]
    pre_read_url = f"{public_parent}/knowledge-class-pre-read.pdf"
    audio_url = f"{public_parent}/knowledge-class-audio-recap.mp3"

    info_document = EventDocuments.query.filter_by(
        event_id=knowledge.id,
        document_name="Info",
        status=1,
    ).first()
    if not info_document:
        info_document = EventDocuments(
            event_id=knowledge.id,
            document_name="Info",
            ar_document_name="Info",
            status=1,
            created_by=knowledge.user_id,
            updated_by=knowledge.user_id,
        )
        db.session.add(info_document)
        db.session.flush()

    summary_copy = "Post-session summary · Review your notes and prepare one question for the next class."
    recap_document = EventDocuments.query.filter_by(
        event_id=knowledge.id,
        document_name=summary_copy,
        status=1,
    ).first()
    if not recap_document:
        recap_document = EventDocuments(
            event_id=knowledge.id,
            document_name=summary_copy,
            ar_document_name="Post-session summary",
            status=1,
            created_by=knowledge.user_id,
            updated_by=knowledge.user_id,
        )
        db.session.add(recap_document)
        db.session.flush()

    material_specs = (
        (info_document.id, pre_read_url),
        (info_document.id, cover_url),
        (recap_document.id, audio_url),
    )
    for document_id, file_path in material_specs:
        if not EventDocumentsFiles.query.filter_by(
            event_document_id=document_id,
            file_path=file_path,
            status=1,
        ).first():
            db.session.add(EventDocumentsFiles(
                event_document_id=document_id,
                file_path=file_path,
                status=1,
                created_by=knowledge.user_id,
                updated_by=knowledge.user_id,
            ))

    db.session.commit()
    return {"synced": True, "documents": 2, "files": 3}


def import_model_modules():
    import app.models as models_package

    for module_info in pkgutil.iter_modules(models_package.__path__):
        if module_info.name.startswith("_"):
            continue
        importlib.import_module(f"app.models.{module_info.name}")


def main():
    root = Path(__file__).resolve().parents[1]
    sys.path.insert(0, str(root))
    load_dotenv(root / ".env")
    if os.getenv("ONDEEN_DOTENV"):
        load_dotenv(os.getenv("ONDEEN_DOTENV"), override=True)

    # Schema bootstrap must not start background jobs.
    os.environ["ENABLE_SCHEDULER"] = "false"

    from app import db, on_deen

    app = on_deen()
    import_model_modules()

    with app.app_context():
        db.create_all()
        # db.create_all() does not add columns to existing Railway tables. Run
        # the additive P0 schema bootstrap before gunicorn starts so every
        # worker sees the same activity-classification and gamification shape.
        from app.services.customer.gamification import GamificationService
        from app.services.one_to_one import OneToOneService
        from app.services.notification_preference_storage import ensure_notification_preference_storage
        from app.services.organizer_application_storage import ensure_organizer_application_storage
        from app.services.payment import PaymentService

        GamificationService.ensure_storage()
        OneToOneService.ensure_storage()
        ensure_notification_preference_storage()
        ensure_organizer_application_storage()
        PaymentService.ensure_storage()
        material_result = sync_reference_materials(root)
        app.logger.info("Reference material sync: %s", material_result)
        app.logger.info("Database schema bootstrap complete.")


if __name__ == "__main__":
    main()
