from django import forms
from .models import DayPlan, TimeBlock
from django.forms import modelformset_factory


# What day are we editing
class DayPlanForm(forms.ModelForm):
    class Meta:
        model = DayPlan
        fields = ["date"]
        widgets = {
            "date": forms.DateInput(attrs={"type": "date"}),
        }


class TimeBlockForm(forms.ModelForm):
    class Meta:
        model = TimeBlock
        fields = ["start_time", "end_time", "block_type"]
        widgets = {
            "start_time": forms.TimeInput(attrs={"type": "time"}),
            "end_time": forms.TimeInput(attrs={"type": "time"}),
            "block_type": forms.Select(
                attrs={"style": "width: auto; max-width: 150px;"}
            ),
        }


# Handles many blocks for that day
TimeBlockFormSet = modelformset_factory(
    TimeBlock, form=TimeBlockForm, extra=1, can_delete=False
)
