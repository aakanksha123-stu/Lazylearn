from django.db import models
from django.conf import settings

class Reminder(models.Model):
    IMPORTANCE_CHOICES = [
        ("Low", "Low"),
        ("High", "High"),
    ]

    # 👇 Allow user to be optional (so you can save reminders without auth)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,       # ✅ allow empty user
        blank=True
    )

    text = models.CharField(max_length=255)
    importance = models.CharField(max_length=10, choices=IMPORTANCE_CHOICES, default="Low")
    
    # ✅ Use DateTimeField for both date and time for easier saving
    dateISO = models.DateTimeField(null=True, blank=True)  # optional date
    timeISO = models.DateTimeField()                       # required full datetime
    
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.text} ({self.importance})"
