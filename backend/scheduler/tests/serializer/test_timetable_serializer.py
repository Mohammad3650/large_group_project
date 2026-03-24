from django.test import TestCase
from scheduler.serializer.UnscheduledSerializer import UnscheduledSerializer
from scheduler.serializer.WindowSerializer import WindowSerializer
from scheduler.serializer.generator_serializers import GenerateScheduleRequestSerializer

class TestWindowSerializer(TestCase):

    def test_valid_basic(self):
        s = WindowSerializer(data={"start_min": "07:00", "end_min": "22:00"})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["daily"], False)

    def test_valid_with_daily_true(self):
        s = WindowSerializer(data={"start_min": "06:00", "end_min": "23:00", "daily": True})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertTrue(s.validated_data["daily"])

    def test_valid_daily_defaults_false(self):
        s = WindowSerializer(data={"start_min": "08:00", "end_min": "21:00"})
        self.assertTrue(s.is_valid(), s.errors)
        self.assertFalse(s.validated_data["daily"])

    def test_valid_midnight_wrap(self):
        s = WindowSerializer(data={"start_min": "22:00", "end_min": "06:00"})
        self.assertTrue(s.is_valid(), s.errors)

    def test_valid_with_seconds(self):
        s = WindowSerializer(data={"start_min": "07:00:00", "end_min": "22:30:00"})
        self.assertTrue(s.is_valid(), s.errors)

    def test_start_max_bounds(self):
        serializer = WindowSerializer(data={"start_min": "00:00", "end_min": "23:59", "daily": True})
        self.assertTrue(serializer.is_valid())
        serializer = WindowSerializer(data={"start_min": "00:00", "end_min": "24:00", "daily": True})
        self.assertFalse(serializer.is_valid())
        serializer = WindowSerializer(data={"start_min": "00:00", "end_min": "25:59", "daily": True})
        self.assertFalse(serializer.is_valid())
    
    def test_missing_start_min(self):
        s = WindowSerializer(data={"end_min": "22:00"})
        self.assertFalse(s.is_valid())
        self.assertIn("start_min", s.errors)

    def test_missing_end_min(self):
        s = WindowSerializer(data={"start_min": "07:00"})
        self.assertFalse(s.is_valid())
        self.assertIn("end_min", s.errors)

    def test_missing_both_fields(self):
        s = WindowSerializer(data={})
        self.assertFalse(s.is_valid())
        self.assertIn("start_min", s.errors)
        self.assertIn("end_min", s.errors)
    
    def test_invalid_time_format(self):
        s = WindowSerializer(data={"start_min": "not-a-time", "end_min": "22:00"})
        self.assertFalse(s.is_valid())
        self.assertIn("start_min", s.errors)

    def test_same_start_and_end(self):
        s = WindowSerializer(data={"start_min": "07:00", "end_min": "07:00"})
        self.assertFalse(s.is_valid())
        self.assertIn("end_min", s.errors)


def valid_payload(**overrides):
    base = {
        "duration": 60,
        "name": "Lecture",
        "daily": False,
        "frequency": 3,
    }
    base.update(overrides)
    return base

class TestUnscheduledSerialiser(TestCase):

    def test_minimal_required_fields(self):
        s = UnscheduledSerializer(data=valid_payload())
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_defaults_applied(self):
        """frequency, start_time_preference, location, block_type, description get defaults."""
        s = UnscheduledSerializer(data=valid_payload())
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["start_time_preference"], "None")
        self.assertEqual(s.validated_data["location"], "")
        self.assertEqual(s.validated_data["block_type"], "study")
        self.assertEqual(s.validated_data["description"], "")

    def test_all_fields_explicit(self):
        s = UnscheduledSerializer(data={
            "duration": 90,
            "name": "exercise",
            "frequency": 5,
            "daily": False,
            "start_time_preference": "Early",
            "location": "park",
            "block_type": "exercise",
            "description": "workout",
        })
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_daily_true_frequency_one(self):
        s = UnscheduledSerializer(data=valid_payload(daily=True, frequency=1))
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_daily_true_frequency_defaults_to_one(self):
        s = UnscheduledSerializer(data={"duration": 60, "name": "Walk", "daily": True})
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_all_start_time_preference_choices(self):
        for choice in ["None", "Early", "Late"]:
            with self.subTest(choice=choice):
                s = UnscheduledSerializer(data=valid_payload(start_time_preference=choice))
                self.assertTrue(s.is_valid(), s.errors)
    
    def test_all_block_type_choices(self):
        for bt in ["sleep", "study", "lecture", "lab", "tutorial",
                   "commute", "exercise", "break", "work", "extracurricular"]:
            with self.subTest(block_type=bt):
                s = UnscheduledSerializer(data=valid_payload(block_type=bt))
                self.assertTrue(s.is_valid(), s.errors)
    
    def test_blank_location_allowed(self):
        s = UnscheduledSerializer(data=valid_payload(location=""))
        self.assertTrue(s.is_valid(), s.errors)

    def test_blank_description_allowed(self):
        s = UnscheduledSerializer(data=valid_payload(description=""))
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_missing_duration(self):
        data = valid_payload()
        del data["duration"]
        s = UnscheduledSerializer(data=data)
        self.assertFalse(s.is_valid())

    def test_null_duration(self):
        s = UnscheduledSerializer(data=valid_payload(duration=None))
        self.assertFalse(s.is_valid())

    def test_invalid_duration(self):
        s = UnscheduledSerializer(data=valid_payload(duration="abc"))
        self.assertFalse(s.is_valid())

    def test_duration_zero(self):
        s = UnscheduledSerializer(data=valid_payload(duration=0))
        self.assertFalse(s.is_valid())

    def test_duration_negative(self):
        s = UnscheduledSerializer(data=valid_payload(duration=-5))
        self.assertFalse(s.is_valid())

    def test_duration_one_is_valid(self):
        s = UnscheduledSerializer(data=valid_payload(duration=1))
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_blank_name(self):
        s = UnscheduledSerializer(data=valid_payload(name=""))
        self.assertFalse(s.is_valid(), s.errors)
    
    def test_invalid_daily(self):
        s = UnscheduledSerializer(data=valid_payload(daily="maybe"))
        self.assertFalse(s.is_valid(), s.errors)

    def test_invalid_frequency(self):
        s = UnscheduledSerializer(data=valid_payload(frequency="often"))
        self.assertFalse(s.is_valid(), s.errors)

    def test_frequency_negative(self):
        s = UnscheduledSerializer(data=valid_payload(frequency=-1))
        self.assertFalse(s.is_valid(), s.errors)

    def test_daily_true_frequency_not_one(self):
        s = UnscheduledSerializer(data=valid_payload(daily=True, frequency=3))
        self.assertFalse(s.is_valid(), s.errors)

    def test_daily_false_frequency_provided(self):
        s = UnscheduledSerializer(data=valid_payload(daily=False, frequency=4))
        self.assertTrue(s.is_valid(), s.errors)

def valid_window(**overrides):
    base = {"start_min": "07:30", "end_min": "23:00", "daily": True}
    base.update(overrides)
    return base


def valid_unscheduled(**overrides):
    base = {
        "name": "Gym",
        "duration": 45,
        "frequency": 3,
        "daily": False,
        "start_time_preference": "Late",
        "location": "Gym",
        "block_type": "exercise",
        "description": "Go to gym",
    }
    base.update(overrides)
    return base


def valid_payload_generate(**overrides):
    base = {
        "week_start": "2026-03-16",
        "week_end": "2026-03-21",
        "even_spread": True,
        "include_scheduled": False,
        "windows": [valid_window()],
        "unscheduled": [valid_unscheduled()],
    }
    base.update(overrides)
    return base

class TestGenerateScheduleRequestSerializer(TestCase):

    def test_full_payload(self):
        data = {
            "week_start": "2026-03-16",
            "week_end": "2026-03-21",
            "even_spread": True,
            "include_scheduled": False,
            "windows": [{"start_min": "07:30", "end_min": "23:00", "daily": True}],
            "unscheduled": [
                {"name": "Gym", "duration": "45", "frequency": "3", "daily": False,
                 "start_time_preference": "Late", "location": "Gym",
                 "block_type": "exercise", "description": "Go to gym"},
                {"name": "Revision", "duration": "120", "frequency": "1", "daily": True,
                 "start_time_preference": "None", "location": "Library",
                 "block_type": "study", "description": "Revision of modules"},
            ],
        }
        s = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)

    def test_days_calculated_correctly(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(
            week_start="2026-03-16", week_end="2026-03-21"
        ))
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["days"], 6)

    def test_same_start_and_end_date(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(
            week_start="2026-03-16", week_end="2026-03-16"
        ))
        self.assertTrue(s.is_valid(), s.errors)
        self.assertEqual(s.validated_data["days"], 1)
    
    def test_defaults_applied(self):
        """even_spread defaults True, include_scheduled defaults True, unscheduled defaults []."""
        data = {
            "week_start": "2026-03-16",
            "week_end": "2026-03-21",
            "windows": [valid_window()],
        }
        s = GenerateScheduleRequestSerializer(data=data)
        self.assertTrue(s.is_valid(), s.errors)
        self.assertTrue(s.validated_data["even_spread"])
        self.assertTrue(s.validated_data["include_scheduled"])
        self.assertEqual(s.validated_data["unscheduled"], [])
    
    def test_multiple_windows(self):
        """Multiple windows are accepted."""
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(windows=[
            valid_window(start_min="06:00", end_min="12:00"),
            valid_window(start_min="13:00", end_min="22:00"),
        ]))
        self.assertTrue(s.is_valid(), s.errors)

    def test_empty_unscheduled_list(self):
        """An explicit empty unscheduled list is valid."""
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(unscheduled=[]))
        self.assertTrue(s.is_valid(), s.errors)
    
    def test_missing_week_start(self):
        data = valid_payload_generate()
        del data["week_start"]
        s = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_start"][0], "Start date must be provided.")

    def test_null_week_start(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(week_start=None))
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_start"][0], "Start date must be provided.")

    def test_invalid_week_start(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(week_start="not-a-date"))
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_start"][0], "Start date must be a valid date.")
    
    def test_missing_week_end(self):
        data = valid_payload_generate()
        del data["week_end"]
        s = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_end"][0], "End date must be provided.")

    def test_invalid_week_end(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(week_end="not-a-date"))
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_end"][0], "End date must be a valid date.")

    def test_week_end_before_week_start(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate( week_start="2026-03-21", week_end="2026-03-16" ))
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["week_end"][0], "End date must be on or after start date.")

    def test_missing_windows(self):
        data = valid_payload_generate()
        del data["windows"]
        s = GenerateScheduleRequestSerializer(data=data)
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["windows"][0], "At least one scheduling window must be provided.")

    def test_null_windows(self):
        s = GenerateScheduleRequestSerializer(data=valid_payload_generate(windows=None))
        self.assertFalse(s.is_valid())
        self.assertEqual(s.errors["windows"][0], "At least one scheduling window must be provided.")
    

    

