from django.conf import settings
from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.response import Response
import jwt
from datetime import datetime, timedelta
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password
from rest_framework import serializers
from pymongo.errors import PyMongoError

# Connecting MongoDB
client = MongoClient(settings.MONGODB_URL)
db = client['EagleHub']
users_collection = db['Users']

# Serializer for reset password functionality
class ResetPassword(serializers.Serializer):
    new_password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)

# Serializer for forgot password functionality
class ForgotPassword(serializers.Serializer):
    email = serializers.EmailField(required=True, write_only=True)

# generate temporary reset token for password reset
def generate_reset_token(email):
    payload = {
        "email": email,
        "exp": datetime.utcnow() + timedelta(minutes=15)
    }
    return jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm="HS256")

# decode the reset token to get the email and verify its validity
def decode_reset_token(token):
    try:
        return jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=["HS256"])
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

# ForgotPasswordView handles the forgot password request
class ForgotPasswordView(APIView):
    def post(self, request):
        serializer = ForgotPassword(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=400)
        email = serializer.validated_data.get("email", "").strip().lower()
        if not email:
            return Response({"error": "Email is required"}, status=400)
        user = users_collection.find_one({"email": email})
        if not user:
            return Response({"error": "Email not found"}, status=404)
        token = generate_reset_token(email)
        reset_link = f"{settings.FRONTEND_RESET_PASSWORD_URL}?token={token}"
        subject = "EagleHub : Reset your password!!"
        message = f"Click here to reset your password: {reset_link}"
        try:
            send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [email])
            return Response({"message": "Reset link sent to email!!"})
        except Exception as e:
            return Response({"error": str(e)}, status=500) 

# ResetPasswordView handles the reset password request
class ResetPasswordView(APIView):
    def post(self, request):
        token = request.data.get("token")
        serializer = ResetPassword(data=request.data)
        if not serializer.is_valid():
            return Response({"error": serializer.errors}, status=400)
        new_password = serializer.validated_data["new_password"].strip().lower()
        confirm_password = serializer.validated_data["confirm_password"].strip().lower()
        if not token or not new_password or not confirm_password:
            return Response({"error": "Token and passwords are required"}, status=400)
        if new_password != confirm_password:
            return Response({"error": "Passwords do not match"}, status=400)
        if len(new_password) < 8:
            return Response({"error": "Password must be at least 8 characters long"}, status=400)

        data = decode_reset_token(token)
        if not data:
            return Response({"error": "Invalid or expired token"}, status=400)

        email = data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        user = users_collection.find_one({"email": email})
        if not user:
            return Response({"error": "Email not found"}, status=404)

        try:
            result = users_collection.update_one(
                {"email": email},  
                {"$set": {"password": make_password(new_password)}}  
                )    
            if result.matched_count == 0:
                return Response({"error": "User not found"}, status=404)
            return Response({"success": True, "message": "Password updated successfully"}, status=200)
        except PyMongoError as e:
            return Response({"error": "Database error"}, status=500)