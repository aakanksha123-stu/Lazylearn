# from rest_framework import viewsets, permissions
# from .models import Reminder
# from .serializers import ReminderSerializer

# # class ReminderViewSet(viewsets.ModelViewSet):
# #     serializer_class = ReminderSerializer
# #     permission_classes = [permissions.AllowAny]  # temporary open access

# #     def get_queryset(self):
# #         return Reminder.objects.all()

# #     def perform_create(self, serializer):
# #         serializer.save()
# from rest_framework import status
# from rest_framework.response import Response

# class ReminderViewSet(viewsets.ModelViewSet):
#     queryset = Reminder.objects.all()
#     serializer_class = ReminderSerializer

#     def create(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         if not serializer.is_valid():
#             print("❌ Validation errors:", serializer.errors)  # 👈 Add this line
#             return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
#         serializer.save()
#         return Response(serializer.data, status=status.HTTP_201_CREATED)

from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Reminder
from .serializers import ReminderSerializer

class ReminderViewSet(viewsets.ModelViewSet):
    queryset = Reminder.objects.all()
    serializer_class = ReminderSerializer

    def perform_create(self, serializer):
        # If no user, just save without assigning one
        serializer.save(user=self.request.user if self.request.user.is_authenticated else None)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print("❌ Validation errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        self.perform_create(serializer)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
