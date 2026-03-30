from django.contrib.auth import get_user_model
from scheduler.management.commands.base_seeder import BaseSeeder
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX

User = get_user_model()


class Command(BaseSeeder):
    help = "Removes all seeded users and their associated data."

    def _get_seeded_users(self):
        """
        Retrieves all seeded users from the database.

        Returns:
            QuerySet: A queryset of all users whose usernames begin with the seeded user prefix.
        """
        return User.objects.filter(username__startswith=SEEDED_USER_PREFIX)

    def handle(self, *args, **kwargs):
        """
        Entry point for the unseed command.

        Retrieves all seeded users and deletes them along with their associated
        data via cascade deletion. Logs the outcome of the operation.

        Args:
            *args: Positional arguments passed by Django's management command framework.
            **kwargs: Keyword arguments passed by Django's management command framework.

        Returns:
            None
        """
        seeded_users = self._get_seeded_users()
        count = seeded_users.count()

        if count == 0:
            self.log("No seeded users found.")
            return

        seeded_users.delete()
        self.success(f"Successfully removed {count} seeded users and their data.")