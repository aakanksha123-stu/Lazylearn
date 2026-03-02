from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from rest_framework import serializers

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["username", "email", "password", "mobile"]

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            mobile=validated_data.get("mobile")
        )
        return user




class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'username'  # keep default as username

    def validate(self, attrs):
        # default validate returns tokens
        data = super().validate(attrs)
        data.update({'user_id': self.user.id, 'username': self.user.username})
        return data
