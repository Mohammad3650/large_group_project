def make_window_data(**overrides):
    """Return valid window serializer payload data."""
    data = {
        "start_min": "07:30",
        "end_min": "23:00",
        "daily": True,
    }
    data.update(overrides)
    return data


def make_unscheduled_data(**overrides):
    """Return valid unscheduled serializer payload data."""
    data = {
        "duration": 60,
        "name": "Lecture",
        "daily": False,
        "frequency": 3,
        "start_time_preference": "None",
        "location": "",
        "block_type": "study",
        "description": "",
    }
    data.update(overrides)
    return data


def make_generate_schedule_data(**overrides):
    """Return valid generate schedule request serializer payload data."""
    data = {
        "week_start": "2026-03-16",
        "week_end": "2026-03-21",
        "even_spread": True,
        "include_scheduled": False,
        "windows": [make_window_data()],
        "unscheduled": [make_unscheduled_data()],
    }
    data.update(overrides)
    return data