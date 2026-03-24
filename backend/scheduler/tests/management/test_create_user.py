from django.test import TestCase
from scheduler.management.commands.seed import create_user
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX


class CreateUserTest(TestCase):

    def test_creates_user_with_seeded_prefix(self):
        """Tests that a created user has the seeded prefix in their username."""
        user = create_user(0)
        self.assertTrue(user.username.startswith(SEEDED_USER_PREFIX))

    def test_username_contains_index(self):
        """Tests that the username contains the index."""
        user = create_user(5)
        self.assertIn("_5", user.username)

    def test_email_matches_username(self):
        """Tests that the email is correctly formatted from the username."""
        user = create_user(0)
        self.assertEqual(user.email, f"{user.username}@example.net")

    def test_different_users_have_unique_usernames(self):
        """Tests that two users created with different indices have unique usernames."""
        user1 = create_user(0)
        user2 = create_user(1)
        self.assertNotEqual(user1.username, user2.username)
