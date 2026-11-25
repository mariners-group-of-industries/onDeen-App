import base64
import json
import os
import unittest
import urllib.request


RAILWAY_BASE_URL = os.getenv("ONDEEN_TEST_BASE_URL", "").rstrip("/")
PNG_1X1 = (
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8"
    "/x8AAwMCAO+/p9sAAAAASUVORK5CYII="
)


def _request_json(url, method="GET", payload=None):
    data = None
    headers = {}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
        headers["Content-Type"] = "application/json"

    request = urllib.request.Request(url, data=data, headers=headers, method=method)
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.status, json.loads(response.read().decode("utf-8"))


@unittest.skipUnless(RAILWAY_BASE_URL, "Set ONDEEN_TEST_BASE_URL to run Railway smoke tests")
class RailwaySmokeTests(unittest.TestCase):
    def test_generate_token_route_is_live(self):
        status, payload = _request_json(f"{RAILWAY_BASE_URL}/generate_token")
        self.assertEqual(status, 200)
        self.assertIn("access_token", payload)
        self.assertGreater(len(payload["access_token"]), 20)

    def test_upload_file_uses_railway_storage_url_and_serves_file(self):
        status, payload = _request_json(
            f"{RAILWAY_BASE_URL}/upload_file",
            method="POST",
            payload={
                "module": "test-smoke",
                "filename": "railway-smoke.png",
                "content_type": "image/png",
                "data": f"data:image/png;base64,{PNG_1X1}",
            },
        )

        self.assertEqual(status, 200)
        file_url = payload["file_url"]
        self.assertTrue(file_url.startswith(f"{RAILWAY_BASE_URL}/uploads/test-smoke/"))

        with urllib.request.urlopen(file_url, timeout=20) as response:
            body = response.read()
            content_type = response.headers.get("Content-Type", "")

        self.assertEqual(response.status, 200)
        self.assertIn("image/png", content_type)
        self.assertGreater(len(body), 0)
        base64.b64encode(body)

    def test_test_otp_123456_works_against_railway(self):
        phone = "700000002"
        status, payload = _request_json(
            f"{RAILWAY_BASE_URL}/customer_app/users/send_otp",
            method="POST",
            payload={"country_code": "+44", "mobile_number": phone},
        )
        self.assertEqual(status, 200)
        self.assertTrue(payload["status"])

        status, payload = _request_json(
            f"{RAILWAY_BASE_URL}/customer_app/users/verify_otp",
            method="POST",
            payload={"country_code": "+44", "mobile_number": phone, "otp": "123456"},
        )
        self.assertEqual(status, 200)
        self.assertTrue(payload["status"])
        self.assertFalse(payload["response"]["is_register"])


if __name__ == "__main__":
    unittest.main()
