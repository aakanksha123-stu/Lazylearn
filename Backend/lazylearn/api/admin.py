from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    model = CustomUser

    # Fields shown in list view
    list_display = ("username", "email", "first_name", "last_name", "mobile", "is_staff", "is_active")
    list_filter = ("is_staff", "is_active")

    # Fields shown when editing an existing user
    fieldsets = UserAdmin.fieldsets + (
        ("Extra Info", {"fields": ("mobile",)}),
    )

    # Fields shown when adding a new user
    add_fieldsets = UserAdmin.add_fieldsets + (
        ("Extra Info", {"fields": ("mobile", "first_name", "last_name")}),
    )
