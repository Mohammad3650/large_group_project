from django.core.management.base import BaseCommand


class BaseSeeder(BaseCommand):
    """
    Abstract base class for seeders and unseeders.
    Subclasses must implement the handle method.
    """

    def log(self, message):
        """
        Logs a message to stdout.

        Args:
            message (str): The message to log.
        """
        self.stdout.write(message)

    def success(self, message):
        """
        Logs a success message to stdout.

        Args:
            message (str): The message to log.
        """
        self.stdout.write(self.style.SUCCESS(message))

    def error(self, message):
        """
        Logs an error message to stdout.

        Args:
            message (str): The message to log.
        """
        self.stdout.write(self.style.ERROR(message))
