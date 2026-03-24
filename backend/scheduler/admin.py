from django.contrib import admin

from django.contrib import admin

from .models import (
    TimeBlock,
    DayPlan,
    User
)

# Simple “register everything” approach:
admin.site.register(TimeBlock)
admin.site.register(DayPlan)
admin.site.register(User)

