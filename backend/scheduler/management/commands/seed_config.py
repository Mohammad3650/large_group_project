# Number of users and events to seed — change these to adjust the seed size
NUM_RANDOM_USERS = 9
NUM_EVENTS_PER_USER = 25

SEEDED_USER_PREFIX = "seeded_"

GUARANTEED_USERS = [
    {"username": "johndoe", "first_name": "John", "last_name": "Doe"},
]

NUM_TOTAL_USERS = NUM_RANDOM_USERS + len(GUARANTEED_USERS)

COMPLETED_EVENTS = [
    {"name": "Completed Lecture", "block_type": "lecture", "location": "Room 101", "start_time": "09:00", "end_time": "10:00", "description": "Already completed lecture"},
    {"name": "Completed Study", "block_type": "study", "location": "Library", "start_time": "13:00", "end_time": "15:00", "description": "Already completed study session"},
]

PINNED_EVENTS = [
    {"name": "Important Exam", "block_type": "study", "location": "Exam Hall", "start_time": "10:00", "end_time": "12:00", "description": "Final exam"},
    {"name": "Key Lecture", "block_type": "lecture", "location": "Room 101", "start_time": "14:00", "end_time": "15:00", "description": "Important lecture"},
]

CALENDAR_SUBSCRIPTION = {
    "name": "KCL Timetable",
    "source_url": "https://scientia-eu-v4-api-d4-02.azurewebsites.net//api/ical/ca05f91a-6c36-45db-9b40-6d011398ed58/5783eddc-ce35-debb-5771-3eaa6bd2ccfa/timetable.ics",
}

EVENTS = [
    {"name": "Lecture", "block_type": "lecture", "location": "Room 101", "start_time": "09:00", "end_time": "10:00", "description": "Morning lecture"},
    {"name": "Lab", "block_type": "lab", "location": "Lab 2", "start_time": "10:00", "end_time": "12:00", "description": "Practical lab session"},
    {"name": "Study", "block_type": "study", "location": "Library", "start_time": "13:00", "end_time": "15:00", "description": "Self-study session"},
    {"name": "Tutorial", "block_type": "tutorial", "location": "Room 204", "start_time": "15:00", "end_time": "16:00", "description": "Tutorial session"},
    {"name": "Commute", "block_type": "commute", "location": "Bus Stop", "start_time": "08:00", "end_time": "09:00", "description": "Commute to university"},
    {"name": "Break", "block_type": "break", "location": "Canteen", "start_time": "12:00", "end_time": "13:00", "description": "Lunch break"},
    {"name": "Work", "block_type": "work", "location": "Office", "start_time": "16:00", "end_time": "18:00", "description": "Part-time work"},
    {"name": "Extracurricular", "block_type": "extracurricular", "location": "Sports Hall", "start_time": "18:00", "end_time": "19:00", "description": "Sports club"},
    {"name": "Study Group", "block_type": "study", "location": "Room 301", "start_time": "14:00", "end_time": "16:00", "description": "Group study session"},
    {"name": "Seminar", "block_type": "lecture", "location": "Lecture Hall", "start_time": "11:00", "end_time": "12:00", "description": "Weekly seminar"},
    {"name": "Gym", "block_type": "exercise", "location": "Gym", "start_time": "17:00", "end_time": "18:00", "description": "Evening workout"},
    {"name": "Project", "block_type": "study", "location": "Library", "start_time": "15:00", "end_time": "17:00", "description": "Group project work"},
    {"name": "Office Hours", "block_type": "tutorial", "location": "Room 105", "start_time": "10:00", "end_time": "11:00", "description": "Lecturer office hours"},
    {"name": "Morning Run", "block_type": "exercise", "location": "Park", "start_time": "06:00", "end_time": "07:00", "description": "Morning run"},
    {"name": "Team Meeting", "block_type": "work", "location": "Office", "start_time": "09:00", "end_time": "10:00", "description": "Weekly team meeting"},
    {"name": "Reading", "block_type": "study", "location": "Home", "start_time": "20:00", "end_time": "21:00", "description": "Reading session"},
    {"name": "Workshop", "block_type": "lecture", "location": "Room 202", "start_time": "14:00", "end_time": "16:00", "description": "Practical workshop"},
    {"name": "Yoga", "block_type": "exercise", "location": "Sports Hall", "start_time": "07:00", "end_time": "08:00", "description": "Morning yoga"},
    {"name": "Revision", "block_type": "study", "location": "Library", "start_time": "16:00", "end_time": "18:00", "description": "Exam revision"},
    {"name": "Society Meeting", "block_type": "extracurricular", "location": "Student Union", "start_time": "18:00", "end_time": "19:00", "description": "Weekly society meeting"},
    {"name": "Peer Review", "block_type": "study", "location": "Room 301", "start_time": "11:00", "end_time": "12:00", "description": "Peer review session"},
    {"name": "Mentoring", "block_type": "tutorial", "location": "Room 106", "start_time": "13:00", "end_time": "14:00", "description": "Mentoring session"},
    {"name": "Sleep", "block_type": "sleep", "location": "Home", "start_time": "22:00", "end_time": "23:00", "description": "Night sleep"},
    {"name": "Volunteering", "block_type": "extracurricular", "location": "Community Centre", "start_time": "09:00", "end_time": "12:00", "description": "Volunteering session"},
    {"name": "Networking", "block_type": "work", "location": "Conference Room", "start_time": "17:00", "end_time": "18:00", "description": "Networking event"},
]
