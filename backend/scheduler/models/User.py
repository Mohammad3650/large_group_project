from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

# Regex pattern for validating UK-style phone numbers
UK_PHONE_REGEX = r"^(?:0|\+?44)(?:\d\s?){9,10}$"

# Validator used by the phone_number field
phone_validator = RegexValidator(
    regex=UK_PHONE_REGEX,
    message="Enter a valid UK phone number.",
)


class User(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.

    This model uses email as the unique identifier for authentication
    instead of username. It also includes additional required fields
    such as first name, last name, and phone number with validation.

    Attributes:
        username (str): Non-unique username field.
        email (str): Unique email address used for login.
        first_name (str): User's first name.
        last_name (str): User's last name.
        phone_number (str): User's phone number validated against UK format.
    """
    
    username = models.CharField(max_length=150, unique=False, blank=False)
    email = models.EmailField(unique=True, blank=False)

    # Username is still stored as a required display/identity field
    username = models.CharField(max_length=150, blank=False)

    # Basic profile fields required for each user
    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)

    # Stores the user's phone number and applies UK-specific validation
    phone_number = models.CharField(
        max_length=15,
        blank=False,
        validators=[phone_validator],
    )

    # Use email instead of username to log in
    USERNAME_FIELD = "email"

    # Extra fields required when creating a superuser
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "phone_number"]

    class Meta:
        app_label = "scheduler"

    def __str__(self):
        """
        Returns a readable string representation of the user.
        """
        return f"{self.email} - {self.first_name} {self.last_name}"