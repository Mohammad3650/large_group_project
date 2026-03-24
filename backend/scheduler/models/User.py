from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator


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

    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)

    phone_number = models.CharField(
        blank=False,
        max_length=15,
        validators=[RegexValidator(r"^(?:0|\+?44)(?:\d\s?){9,10}$")],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "phone_number"]

    class Meta:
        app_label = "scheduler"

    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"
