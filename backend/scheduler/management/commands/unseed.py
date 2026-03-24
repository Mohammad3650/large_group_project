from django.contrib.auth import get_user_model
from scheduler.management.commands.base_seeder import BaseSeeder
from scheduler.management.commands.seed_config import SEEDED_USER_PREFIX

User = get_user_model()


class Command(BaseSeeder):
    help = "Removes all seeded users and their associated data."

    def handle(self, *args, **kwargs):
        seeded_users = User.objects.filter(username__startswith=SEEDED_USER_PREFIX)
        count = seeded_users.count()

        if count == 0:
            self.log("No seeded users found.")
            return

        # Cascade deletion removes associated DayPlans, TimeBlocks and Notes
        seeded_users.delete()
        self.success(f"Successfully removed {count} seeded users and their data.")
