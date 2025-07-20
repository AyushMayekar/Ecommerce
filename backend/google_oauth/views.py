import requests
import jwt
import secrets
import string
import datetime
import pymongo
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth.hashers import make_password
from django.conf import settings
from pymongo.errors import PyMongoError

# Mongo setup
client = pymongo.MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
users_collection = db["Users"]

# JWT secret
SECRET_KEY = settings.JWT_SECRET_KEY

def generate_fictional_username():
    adjectives = ["iron", "neon", "dark", "silent", "quantum", "wild", "cosmic", "phantom"]
    nouns = ["panther", "samurai", "gryphon", "tiger", "phoenix", "ninja", "cyborg", "falcon"]
    suffix = str(secrets.randbelow(100))  # 0–99

    return f"{secrets.choice(adjectives)}_{secrets.choice(nouns)}_{suffix}"

# Utility: Generate a strong random password (won't be used but still stored hashed)
def generate_random_password(length=16):
    return ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(length))

# Google OAuth Handler
class GoogleOAuthView(APIView):    
    def post(self, request):
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "ID token is required"}, status=400)

        try:
            # 1️⃣ Verify the token using Google
            google_response = requests.get(
                f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
            )
            if google_response.status_code != 200:
                return Response({"error": "Invalid Google token"}, status=400)

            user_info = google_response.json()

            # 2️⃣ Extract required fields
            email = user_info.get("email")
            email_verified = True
            sub = user_info.get("sub")  # Unique Google ID

            if not email or not sub:
                return Response({"error": "Incomplete Google user info"}, status=400)

            # 3️⃣ Check if user already exists by email
            existing_user = users_collection.find_one({"email": email})

            if existing_user:
                if existing_user.get("auth_provider") != "google":
                    return Response(
                        {"error": "Email already registered with password login, Login with password instead !!"},
                        status=409
                    )
                # ✅ Google user exists → login flow
                username = existing_user["username"]
                user_role = existing_user.get("user_role", "user")
                verification_status = existing_user.get("verification_status", "unverified")

            else:
                # 4️⃣ New user → generate username safely (Option C)
                email_prefix = email.split("@")[0]
                username = email_prefix.lower()

                if users_collection.find_one({"username": username}):
                    # fallback to unique username using Google ID
                    username = generate_fictional_username()

                # 5️⃣ Build user object
                new_user = {
                    "username": username,
                    "password": make_password(generate_random_password()),
                    "email": email,
                    "user_role": "user",
                    "auth_provider": "google",
                    "email_verified": email_verified,
                    "phone_verified": False,
                    "verification_status": "unverified",
                }

                # 6️⃣ Store in DB
                try:
                    users_collection.insert_one(new_user)
                except PyMongoError as e:
                    return Response({"error": "Database error"}, status=500)

                user_role = "user"
                verification_status = "unverified"

            # 7️⃣ Generate JWT tokens (same as LoginView)
            now = datetime.datetime.utcnow()
            access_payload = {
                "username": username,
                "exp": now + datetime.timedelta(minutes=15),
                "type": "access"
            }
            refresh_payload = {
                "username": username,
                "exp": now + datetime.timedelta(days=7),
                "type": "refresh"
            }
            access_token = jwt.encode(access_payload, SECRET_KEY, algorithm="HS256")
            refresh_token = jwt.encode(refresh_payload, SECRET_KEY, algorithm="HS256")

            # 8️⃣ Return response with cookies
            response = Response({
                "message": "Authenticated successfully with Google !!!",
                "user_role": user_role,
                "verification_status": verification_status
            }, status=200)

            response.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=15 * 60
            )
            response.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=True,
                samesite="None",
                max_age=7 * 24 * 60 * 60
            )

            return response

        except Exception as e:
            return Response({"error": f"OAuth login failed: {str(e)}"}, status=500)
