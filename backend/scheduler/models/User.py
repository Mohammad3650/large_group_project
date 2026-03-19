from django.contrib.auth.models import AbstractUser
from django.core.validators import RegexValidator
from django.db import models

UK_PHONE_REGEX = r"^(?:0|\+?44)(?:\d\s?){9,10}$"

phone_validator = RegexValidator(
    regex=UK_PHONE_REGEX,
    message="Enter a valid UK phone number.",
)


class User(AbstractUser):
    email = models.EmailField(unique=True, blank=False)
    username = models.CharField(max_length=150, blank=False)
    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    phone_number = models.CharField(
        max_length=15,
        blank=False,
        validators=[phone_validator],
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username", "first_name", "last_name", "phone_number"]

    class Meta:
        app_label = "scheduler"

    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"
