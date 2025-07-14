from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .utils import firebase
from firebase_admin import auth as firebase_auth
from pymongo.errors import PyMongoError
import pymongo
import secrets
import logging
import cloudinary.uploader
import jwt
import json
import traceback
import requests
import datetime
from bson import json_util
from django.conf import settings
from bson import ObjectId
from user_auth.views import MongoDBJWTAuthentication

MONGO_URI = settings. MONGODB_URL
SECRET_KEY = settings.JWT_SECRET_KEY

# Verify Email View
RESEND_API_KEY = settings.RESEND_API_KEY
SENDER_EMAIL = settings.SENDER_EMAIL
FRONTEND_BASE_URL = settings.FRONTEND_BASE_URL

# Setup logging
logger = logging.getLogger(__name__)

# MongoDB client setup
client = pymongo.MongoClient(
        MONGO_URI,
        maxPoolSize=50,
        connectTimeoutMS=30000,
        serverSelectionTimeoutMS=30000
)
db = client["EagleHub"]
users_collection = db["Users"]
blacklisted_tokens_coll = db["Blacklisted_Tokens"]

# Cloudinary configuration
cloudinary.config( 
    cloud_name = settings.CLOUD_NAME, 
    api_key = settings.CLOUDINARY_API_KEY, 
    api_secret = settings.CLOUDINARY_API_SECRET,
    secure = True
)

# Verification status check function
def check_if_fully_verified(username):
        user = users_collection.find_one({"username": username})
        if user.get("email_verified") and user.get("phone_verified"):
            users_collection.update_one(
            {"username": username},
            {"$set": {"verification_status": "verified"}}
        )
        else:
            users_collection.update_one(
                {"username": username},
                {"$set": {"verification_status": "unverified"}}
            )

# Block User View
class BlockUserView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            refresh_token = request.COOKIES.get("refresh_token")
            if not refresh_token:
                logger.debug("No refresh token found.")
                return Response({"error": "Refresh token missing"}, status=400)

            # Blacklist refresh token if it exists and is valid
            try :
                decoded = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
                blacklisted_tokens_coll.insert_one({
                    "token": refresh_token,
                    "exp": datetime.datetime.fromtimestamp(decoded["exp"]),
                    "user_id": ObjectId(request.user.id)
                })
            except jwt.ExpiredSignatureError:
                logger.debug("Refresh token already expired.")
            except jwt.InvalidTokenError:
                logger.debug("Invalid refresh token.")
            except Exception as e:
                logger.error(f"Error blacklisting token: {e}")
            result = users_collection.delete_one({"username": user.username})
            if result.deleted_count == 0:
                return Response({"error": "User not found"}, status=404)

            return Response({"message": "User deleted for unverified status."}, status=200)

        except PyMongoError:
            return Response({"error": "DB error"}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Loading user data in the profile section
class UserInfoView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request):
        try:
            user = request.user
            username = user.username
            if not username:
                return Response({"error": "Invalid token"}, status=403)

            user_profile = users_collection.find_one({"username": username}, {"_id": 0, "password": 0})

            if not user:
                return Response({"error": "User not found"}, status=404)
            user_profile_json = json.loads(json_util.dumps(user_profile))
            return Response(user_profile_json, status=200)
        except PyMongoError:
            return Response({"error": "Database error"}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Send Email Verification View
class SendEmailVerificationView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            email = request.data.get("email")
            if not email:
                return Response({"error": "Email is required"}, status=400)

            # Generate secure token
            token = secrets.token_urlsafe(32)
            expiry_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)

            # Save token and expiry to user doc
            result = users_collection.update_one(
                {"email": email},
                {
                    "$set": {
                        "email_verification_token": token,
                        "email_token_expiry": expiry_time,
                        "email_verified": False
                    }
                }
            )

            if result.matched_count == 0:
                return Response({"error": "User not found"}, status=404)

            verification_link = f"{FRONTEND_BASE_URL}/email_verification?token={token}"

            headers = {
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json"
            }
            payload = {
                "from": f"EagleHub <{SENDER_EMAIL}>",
                "to": [email],
                "subject": "Verify Your Email - EagleHub",
                "html": f"""
    <div style="font-family: 'Segoe UI', sans-serif; background-color: #f4f6f8; padding: 30px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 10px; overflow: hidden; box-shadow: 0 0 10px rgba(0,0,0,0.05);">
        <div style="background-color: #003366; padding: 20px;">
          <h1 style="color: white; margin: 0;">EagleHub Email Verification</h1>
        </div>
        <div style="padding: 30px;">
          <p style="font-size: 16px; color: #333;">
            Hey there 👋,
          </p>
          <p style="font-size: 16px; color: #333;">
            Thanks for signing up on <strong>EagleHub</strong>! Please confirm your email address by clicking the button below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #4285f4; color: white; padding: 12px 24px; text-decoration: none; font-size: 16px; border-radius: 5px;">
              Verify Email
            </a>
          </div>
          <p style="font-size: 14px; color: #555;">
            This link will expire in <strong>15 minutes</strong> for your security. If it expires, just hit the "Verify" button again in your profile.
          </p>
          <p style="font-size: 14px; color: #555;">
            If you didn’t sign up for EagleHub, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f0f2f5; padding: 15px; text-align: center; color: #777; font-size: 12px;">
          © 2025 EagleHub. All rights reserved.
        </div>
      </div>
    </div>
    """
            }

            response = requests.post("https://api.resend.com/emails", json=payload, headers=headers)
            print(response.status_code)
            print(response.text)

            if response.status_code not in [200, 202]:
                return Response({"error": "Failed to send email"}, status=500)

            return Response({"message": "Verification link sent successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Confirm Email Verification View
class ConfirmEmailVerificationView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            token = request.data.get("token")
            if not token:
                return Response({"error": "Token is required"}, status=400)

            user = users_collection.find_one({
                "email_verification_token": token
            })

            if not user:
                return Response({"error": "Invalid or expired token"}, status=400)

            if user.get("email_verified") is True:
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$unset": {
                        "email_verification_token": "",
                        "email_token_expiry": ""
                        }}
                    )
                return Response({"message": "Email already verified"}, status=200)

            expiry = user.get("email_token_expiry")
            if not expiry or datetime.datetime.utcnow() > expiry:
                users_collection.update_one(
                    {"_id": user["_id"]},
                    {"$unset": {
                    "email_verification_token": "",
                    "email_token_expiry": ""
                        }}
                    )
                return Response({"error": "Token expired"}, status=400)

            users_collection.update_one(
                {"_id": user["_id"]},
                {
                    "$set": {"email_verified": True},
                    "$unset": {"email_verification_token": "", "email_token_expiry": ""}
                }
            )

            return Response({"message": "Email verified successfully"}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Verify Mobile View
class VerifyPhoneView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            user = request.user
            token = request.data.get("firebase_token")

            try:
                decoded = firebase_auth.verify_id_token(token)
            except Exception as e:
                error_trace = traceback.format_exc()
                print("🔥 Token verification failed:", e)
                print("🔥 Stack Trace:\n", error_trace)
                return Response({"error": f"Token verification failed: {str(e)}"}, status=401)
        
            phone_number = decoded.get("phone_number")
            print('Number Decoded!!!',phone_number)
            if not phone_number:
                return Response({"error": "Invalid token"}, status=400)

            result = users_collection.update_one(
                {"username": user.username},
                {
                    "$set": {
                        "phone": phone_number,
                        "phone_verified": True
                    }
                }
            )
            if result.matched_count == 0:
                return Response({"error": "User not found"}, status=404)

            return Response({"message": "Phone verified"}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Save User Profile View
class SaveUserProfileView(APIView):
    uthentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            user = request.user
            base64_image = request.data.get("profileImage")
            profile_data = {
                "full_name": request.data.get("full_name"),
                "address": request.data.get("address"),
                "phone": request.data.get("phone"),
                "email": request.data.get("email"),
            }
            if base64_image:
                upload_result = cloudinary.uploader.upload(
                    base64_image,
                    folder="eaglehub/users_pp", 
                    public_id=f"profile_{user.username}",
                    overwrite=True,
                    resource_type="image"
                )
                profile_image_url = upload_result.get("secure_url")
                profile_data["profile_image"] = profile_image_url

            users_collection.update_one(
                {"username": user.username},
                {"$set": profile_data}
            )

            check_if_fully_verified(user.username)

            return Response({"message": "Profile saved"}, status=200)
        except PyMongoError as db_err:
            return Response({"error": "Database error: " + str(db_err)}, status=500)
        except Exception as e:
            return Response({"error": str(e)}, status=500)