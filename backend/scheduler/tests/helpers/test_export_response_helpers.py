from django.test import TestCase

from scheduler.services.export_response_helpers import (
    build_csv_download_response,
    build_file_download_response,
    build_ics_download_response,
)


class ExportResponseHelpersTest(TestCase):
    def test_build_file_download_response_returns_download_response(self):
        """It should build a generic downloadable file response."""
        response = build_file_download_response(
            "hello",
            "text/plain",
            "test.txt",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response["Content-Type"], "text/plain")
        self.assertEqual(
            response["Content-Disposition"],
            'attachment; filename="test.txt"',
        )
        self.assertEqual(response.content.decode(), "hello")

    def test_build_csv_download_response_returns_csv_response(self):
        """It should build a CSV download response."""
        response = build_csv_download_response("csv content")

        self.assertEqual(response["Content-Type"], "text/csv")
        self.assertEqual(
            response["Content-Disposition"],
            'attachment; filename="studysync_schedule.csv"',
        )
        self.assertEqual(response.content.decode(), "csv content")

    def test_build_ics_download_response_returns_ics_response(self):
        """It should build an ICS download response."""
        response = build_ics_download_response("ics content")

        self.assertEqual(response["Content-Type"], "text/calendar")
        self.assertEqual(
            response["Content-Disposition"],
            'attachment; filename="studysync_schedule.ics"',
        )
        self.assertEqual(response.content.decode(), "ics content")