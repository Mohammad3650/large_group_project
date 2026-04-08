from django.contrib.auth import get_user_model
from django.utils import timezone
from faker import Faker
from datetime import timedelta, date

from scheduler.management.commands.base_seeder import BaseSeeder
from scheduler.models.DayPlan import DayPlan
from scheduler.models.TimeBlock import TimeBlock
from scheduler.models.Note import Note
from scheduler.models.CalendarSubscription import CalendarSubscription
from scheduler.services.calendar_subscription_sync import sync_calendar_subscription

from scheduler.management.commands.seed_config import (
    NUM_RANDOM_USERS, NUM_EVENTS_PER_USER, SEEDED_USER_PREFIX, EVENTS,
    GUARANTEED_USERS, NUM_TOTAL_USERS, COMPLETED_EVENTS, PINNED_EVENTS,
    CALENDAR_SUBSCRIPTION
)

User = get_user_model()
fake = Faker()

DEFAULT_PASSWORD = "password123"
DEFAULT_PHONE_NUMBER = "07700900000"


def create_guaranteed_users():
    """
    Creates guaranteed users from the GUARANTEED_USERS config.

    Returns:
        list: A list of guaranteed user instances.
    """
    users = []
    for guaranteed_user in GUARANTEED_USERS:
        username = f"{SEEDED_USER_PREFIX}{guaranteed_user['username']}"
        user = User.objects.create_user(
            username=username,
            email=f"{username}@example.net",
            password=DEFAULT_PASSWORD,
            first_name=guaranteed_user["first_name"],
            last_name=guaranteed_user["last_name"],
            phone_number=DEFAULT_PHONE_NUMBER,
        )
        users.append(user)
    return users


def create_user(index):
    """
    Creates a single seeded user.

    Args:
        index (int): Index used to generate a unique username.

    Returns:
        User: The created user instance.
    """
    username = f"{SEEDED_USER_PREFIX}{fake.user_name()}_{index}"
    email = f"{username}@example.net"
    return User.objects.create_user(
        username=username,
        email=email,
        password=DEFAULT_PASSWORD,
        first_name=fake.first_name(),
        last_name=fake.last_name(),
        phone_number=DEFAULT_PHONE_NUMBER,
    )


def get_event_dates():
    """
    Generates a list of dates for seeding events dynamically based on the current date.
    Structure: 4 overdue, 3 today, 3 tomorrow, 5 next 7 days, 10 after next 7 days.

    Returns:
        list: A list of date objects for each event.
    """
    today = date.today()
    return (
        [today - timedelta(days=2)] * 2 +
        [today - timedelta(days=1)] * 2 +
        [today] * 3 +
        [today + timedelta(days=1)] * 3 +
        [today + timedelta(days=i) for i in range(2, 7)] +
        [today + timedelta(days=i) for i in range(8, 18)]
    )


def create_events_for_user(user, num_events):
    """
    Creates time blocks for a user using a dynamic date structure
    relative to the current date.

    Args:
        user (User): The user to create events for.
        num_events (int): The number of events to create.
    """
    dates = get_event_dates()
    events = EVENTS[:num_events]

    for i, event in enumerate(events):
        event_date = dates[i]
        day_plan, _ = DayPlan.objects.get_or_create(user=user, date=event_date)
        TimeBlock.objects.create(
            day=day_plan,
            name=event["name"],
            block_type=event["block_type"],
            location=event["location"],
            start_time=event["start_time"],
            end_time=event["end_time"],
            description=event["description"],
            timezone="Europe/London",
        )


def create_completed_events_for_user(user):
    """
    Creates completed time blocks for a user seeded on today's date.

    Args:
        user (User): The user to create completed events for.
    """
    today = date.today()
    day_plan, _ = DayPlan.objects.get_or_create(user=user, date=today)

    for event in COMPLETED_EVENTS:
        TimeBlock.objects.create(
            day=day_plan,
            name=event["name"],
            block_type=event["block_type"],
            location=event["location"],
            start_time=event["start_time"],
            end_time=event["end_time"],
            description=event["description"],
            timezone="Europe/London",
            completed_at=timezone.now(),
        )


def create_pinned_events_for_user(user):
    """
    Creates pinned time blocks for a user seeded on today's date.

    Args:
        user (User): The user to create pinned events for.
    """
    today = date.today()
    day_plan, _ = DayPlan.objects.get_or_create(user=user, date=today)

    for event in PINNED_EVENTS:
        TimeBlock.objects.create(
            day=day_plan,
            name=event["name"],
            block_type=event["block_type"],
            location=event["location"],
            start_time=event["start_time"],
            end_time=event["end_time"],
            description=event["description"],
            timezone="Europe/London",
            pinned=True,
            pinned_at=timezone.now(),
        )


def create_calendar_subscription_for_user(user):
    """
    Creates a calendar subscription for a user and syncs it immediately
    so events appear without needing a manual refresh.

    Args:
        user (User): The user to create the subscription for.
    """
    subscription, _ = CalendarSubscription.objects.get_or_create(
        user=user,
        source_url=CALENDAR_SUBSCRIPTION["source_url"],
        defaults={"name": CALENDAR_SUBSCRIPTION["name"]},
    )
    sync_calendar_subscription(subscription)


def create_note_for_user(user):
    """
    Creates a note for a user.

    Args:
        user (User): The user to create a note for.
    """
    Note.objects.get_or_create(
        user=user,
        defaults={"content": f"The notes for {user.username}"}
    )


class Command(BaseSeeder):
    help = "Seeds the database with test users, events, notes, completed tasks, pinned tasks and a calendar subscription."

    def _is_already_seeded(self):
        """
        Checks whether the database has already been seeded.

        Returns:
            bool: True if seeded users already exist, False otherwise.
        """
        return User.objects.filter(username__startswith=SEEDED_USER_PREFIX).exists()

    def _create_all_users(self):
        """
        Creates all guaranteed and randomly generated users.

        Returns:
            list: A list of all created User objects.
        """
        self.log(f"Seeding {NUM_TOTAL_USERS} users with {NUM_EVENTS_PER_USER} regular events, {len(COMPLETED_EVENTS)} completed events, {len(PINNED_EVENTS)} pinned events and a calendar subscription each...")
        all_users = create_guaranteed_users()
        for i in range(NUM_RANDOM_USERS):
            all_users.append(create_user(i))
        return all_users

    def _seed_users(self, all_users):
        """
        Creates events, completed tasks, pinned tasks, a calendar subscription,
        and notes for each user and logs the result.

        Args:
            all_users (list): A list of User objects to seed data for.
        """
        for user in all_users:
            create_events_for_user(user, NUM_EVENTS_PER_USER)
            create_completed_events_for_user(user)
            create_pinned_events_for_user(user)
            create_calendar_subscription_for_user(user)
            create_note_for_user(user)
            self.log(f"  Created user: {user.username}, Email: {user.email}, Password: {DEFAULT_PASSWORD}")

    def handle(self, *args, **kwargs):
        """
        Entry point for the seed command.

        Checks whether the database has already been seeded, then creates
        all users, their associated events, completed tasks, pinned tasks,
        calendar subscriptions, and notes.

        Args:
           *args: Positional arguments passed by Django's management command framework.
           **kwargs: Keyword arguments passed by Django's management command framework.
        """
        if self._is_already_seeded():
            self.error("Database has already been seeded")
            return

        all_users = self._create_all_users()
        self._seed_users(all_users)
        self.success(f"Successfully seeded {len(all_users)} users.")