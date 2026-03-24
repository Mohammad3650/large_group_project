from django.test import TestCase
from scheduler.management.commands.seed import create_guaranteed_users
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX


class CreateGuaranteedUsersTest(TestCase):

    def test_creates_johndoe(self):
        """Tests that johndoe is created with the correct username."""
        users = create_guaranteed_users()
        self.assertEqual(len(users), 1)
        self.assertEqual(users[0].username, f"{SEEDED_USER_PREFIX}johndoe")

    def test_johndoe_email(self):
        """Tests that johndoe's email is correctly formatted."""
        users = create_guaranteed_users()
        self.assertEqual(users[0].email, f"{SEEDED_USER_PREFIX}johndoe@example.net")

    def test_johndoe_first_name(self):
        """Tests that johndoe's first name is John."""
        users = create_guaranteed_users()
        self.assertEqual(users[0].first_name, "John")

    def test_johndoe_last_name(self):
        """Tests that johndoe's last name is Doe."""
        users = create_guaranteed_users()
        self.assertEqual(users[0].last_name, "Doe")