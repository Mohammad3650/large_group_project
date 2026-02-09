from django import forms
from .models import TimeBlock
from django.forms import formset_factory


class UserPreferencesForm(forms.ModelForm):
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


UserPreferencesFormSet = formset_factory(UserPreferencesForm)
