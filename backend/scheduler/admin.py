from django.contrib import admin

from .models import (
    TimeBlock,
    DayPlan,
    User,
    CalendarSubscription,
    ImportedCalendarEvent,
    Note,
)

# Simple “register everything” approach:
admin.site.register(TimeBlock)
admin.site.register(DayPlan)
admin.site.register(User)
admin.site.register(CalendarSubscription)
admin.site.register(ImportedCalendarEvent)
admin.site.register(Note)

