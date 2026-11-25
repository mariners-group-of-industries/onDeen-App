"""Regression tests for the critical security fixes (admin gate, token contents,
utility endpoints, upload restrictions, CORS)."""
import base64
import json
import os
import tempfile
import unittest

os.environ["ONDEEN_LOCAL"] = "1"
os.environ["ENABLE_SCHEDULER"] = "false"
os.environ["DATABASE_URL"] = "sqlite:///:memory:"
os.environ["RATELIMIT_STORAGE_URI"] = "memory://"
os.environ.setdefault("SECRET_KEY", "local-test-secret")
os.environ.setdefault("JWT_SECRET_KEY", "local-test-jwt-secret")

from werkzeug.security import generate_password_hash  # noqa: E402

from app import on_deen  # noqa: E402
from app import db  # noqa: E402
from app.models.users import Users  # noqa: E402
from app.repositories.user import user as user_repo  # noqa: E402

PNG = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
    "/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


def _claims(token):
    payload = token.split(".")[1]
    payload += "=" * (-len(payload) % 4)
    return json.loads(base64.urlsafe_b64decode(payload))


class SecurityCriticalTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.upload_root = tempfile.TemporaryDirectory()
        os.environ["UPLOAD_ROOT"] = cls.upload_root.name
        os.environ["UPLOAD_PUBLIC_BASE_URL"] = "http://local.test"
        cls.app = on_deen()
        cls.client = cls.app.test_client()
        with cls.app.app_context():
            db.create_all()
            cls.admin_token = cls._make_user(91001, role_type=1, email="sec-admin@local.test")
            cls.customer_token = cls._make_user(91002, role_type=2, email="sec-customer@local.test")
            cls.organiser_token = cls._make_user(91003, role_type=3, email="sec-org@local.test")

    @classmethod
    def tearDownClass(cls):
        cls.upload_root.cleanup()

    @classmethod
    def _make_user(cls, user_id, role_type, email):
        account = Users(
            id=user_id,
            role_type=role_type,
            first_name="Security",
            last_name="Test",
            country_code="+44",
            mobile_number=str(770000000 + user_id),
            email_id=email,
            password=generate_password_hash("correct horse", method="pbkdf2:sha256"),
            status=1,
        )
        db.session.add(account)
        db.session.commit()
        return user_repo.generate_token(account, role_type)

    def _bearer(self, token):
        return {"Authorization": f"Bearer {token}"}

    # Admin API -----------------------------------------------------------

    def test_admin_routes_reject_anonymous_requests(self):
        for path in (
            "/admin_app/customer/get_by_id",
            "/admin_app/customer/delete",
            "/admin_app/organizer/delete",
            "/admin_app/customer/get_all",
        ):
            response = self.client.post(path, json={"id": 91002})
            self.assertEqual(response.status_code, 403, path)

    def test_admin_routes_reject_customer_and_organiser_tokens(self):
        for token in (self.customer_token, self.organiser_token):
            response = self.client.post(
                "/admin_app/customer/get_all", json={"page": 1}, headers=self._bearer(token)
            )
            self.assertEqual(response.status_code, 403)

    def test_admin_routes_accept_admin_token(self):
        response = self.client.post(
            "/admin_app/customer/get_by_id", json={"id": 91002}, headers=self._bearer(self.admin_token)
        )
        self.assertEqual(response.status_code, 200)
        self.assertTrue(response.get_json()["status"])

    def test_admin_login_stays_public(self):
        response = self.client.post(
            "/admin_app/admin/login", json={"email_id": "nobody@local.test", "password": "wrong-pass"}
        )
        self.assertNotEqual(response.status_code, 403)

    # Token contents ------------------------------------------------------

    def test_login_token_does_not_contain_password_hash(self):
        claims = _claims(self.customer_token)
        self.assertNotIn("password", claims)
        self.assertNotIn("pbkdf2", json.dumps(claims))
        self.assertIn("pwd_fp", claims)

    def test_password_change_invalidates_existing_token(self):
        with self.app.app_context():
            account = Users(
                id=91004, role_type=1, first_name="Rotate", last_name="Admin", country_code="+44",
                mobile_number="770091004", email_id="sec-rotate@local.test",
                password=generate_password_hash("first", method="pbkdf2:sha256"), status=1,
            )
            db.session.add(account)
            db.session.commit()
            token = user_repo.generate_token(account, 1)
            ok = self.client.post("/admin_app/customer/get_by_id", json={"id": 91002}, headers=self._bearer(token))
            self.assertEqual(ok.status_code, 200)
            account.password = generate_password_hash("second", method="pbkdf2:sha256")
            db.session.commit()
            stale = self.client.post("/admin_app/customer/get_by_id", json={"id": 91002}, headers=self._bearer(token))
            self.assertEqual(stale.status_code, 403)

    def test_tokens_without_fingerprint_are_rejected(self):
        from flask_jwt_extended import create_access_token
        from app.utils.crypto_utils import encrypt_value

        with self.app.app_context():
            forged = create_access_token(
                identity="x",
                additional_claims={"token_type": "login", "status": 1, "role_type": 1,
                                   "custom_claims": encrypt_value(91001)},
            )
        response = self.client.post("/admin_app/customer/get_all", json={}, headers=self._bearer(forged))
        self.assertEqual(response.status_code, 403)

    # Utility endpoints ---------------------------------------------------

    def test_push_and_cache_endpoints_require_admin(self):
        for method, path in (
            ("post", "/push_notification"),
            ("post", "/push_notification_user"),
            ("post", "/push_notification_org"),
            ("get", "/delete_all_ondeen_keys"),
        ):
            anonymous = getattr(self.client, method)(path, json={})
            self.assertEqual(anonymous.status_code, 403, path)
            customer = getattr(self.client, method)(path, json={}, headers=self._bearer(self.customer_token))
            self.assertEqual(customer.status_code, 403, path)

    def test_uploads_require_a_token(self):
        body = {"module": "profile", "filename": "a.png", "data": base64.b64encode(PNG).decode()}
        self.assertEqual(self.client.post("/upload_file", json=body).status_code, 403)
        image_body = {"module": "profile", "file": base64.b64encode(PNG).decode()}
        self.assertEqual(self.client.post("/image_upload", json=image_body).status_code, 403)

    def test_uploads_reject_unknown_modules(self):
        app_token = self.client.get("/generate_token").get_json()["access_token"]
        headers = {"Auth-Token": app_token}
        body = {"module": "../../app", "filename": "a.png", "data": base64.b64encode(PNG).decode()}
        self.assertEqual(self.client.post("/upload_file", json=body, headers=headers).status_code, 400)
        image_body = {"module": "static", "file": base64.b64encode(PNG).decode()}
        self.assertEqual(self.client.post("/image_upload", json=image_body, headers=headers).status_code, 400)

    def test_upload_accepts_app_token_and_login_token(self):
        app_token = self.client.get("/generate_token").get_json()["access_token"]
        body = {"module": "profile", "filename": "a.png", "data": base64.b64encode(PNG).decode()}
        self.assertEqual(self.client.post("/upload_file", json=body, headers={"Auth-Token": app_token}).status_code, 200)
        self.assertEqual(
            self.client.post("/upload_file", json=body, headers=self._bearer(self.customer_token)).status_code, 200
        )

    # Encryption key ------------------------------------------------------

    def test_crypto_key_is_not_hardcoded(self):
        from pathlib import Path

        source = (Path(__file__).resolve().parents[1] / "app" / "utils" / "crypto_utils.py").read_text()
        self.assertNotIn("hf2vagdZ", source)


class CorsOriginsTests(unittest.TestCase):
    def test_cors_is_not_wildcard(self):
        import wsgi

        origins = wsgi._cors_origins()
        self.assertNotIn("*", origins)
        response = wsgi.app.test_client().get(
            "/generate_token", headers={"Origin": "https://evil.example"}
        )
        self.assertNotEqual(response.headers.get("Access-Control-Allow-Origin"), "*")
        self.assertNotEqual(response.headers.get("Access-Control-Allow-Origin"), "https://evil.example")


if __name__ == "__main__":
    unittest.main()
