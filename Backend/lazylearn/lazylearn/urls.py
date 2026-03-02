from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("auth/", include("api.urls")),
    path('simplifier/', include('simplifier.urls')),
    path("api/", include("reminders.urls")),
     path('quiz/', include('quiz.urls')),
             # all auth routes here
]
