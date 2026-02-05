from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator

class User(AbstractUser):
    username = models.CharField(max_length=150, unique=True, blank=False)
    email = models.EmailField(unique=True, blank=False)
    first_name = models.CharField(max_length=50, blank=False)
    last_name = models.CharField(max_length=50, blank=False)
    phone_number = models.CharField(blank=False, max_length=15, validators=[RegexValidator(r'^\+?1?\d{9,15}$')])
    
    def __str__(self):
        return f"{self.email} - {self.first_name} {self.last_name}"