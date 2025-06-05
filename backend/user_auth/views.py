from rest_framework.permissions import IsAuthenticated
from rest_framework.authentication import BaseAuthentication
from rest_framework import serializers
from django.contrib.auth.hashers import make_password, check_password
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import BasePermission
from rest_framework.response import Response
from django.conf import settings
import jwt
import pymongo
import datetime
import logging
import re
from pymongo.errors import PyMongoError
from bson import ObjectId

SECRET_KEY = settings.JWT_SECRET_KEY
MONGO_URI = settings. MONGODB_URL

# Setup logging
logger = logging.getLogger(__name__)

# MongoDB Connection
try:
    client = pymongo.MongoClient(
        MONGO_URI,
        maxPoolSize=50,
        connectTimeoutMS=30000,
        serverSelectionTimeoutMS=30000
    )
    db = client["EagleHub"]
    users_collection = db["Users"]
    blacklisted_tokens_coll = db["Blacklisted_Tokens"]

    # Ensure indexes exist
    users_collection.create_index([("username", pymongo.ASCENDING)], unique=True)
    blacklisted_tokens_coll.create_index([("exp", 1)], expireAfterSeconds=0)
    logger.info("MongoDB connected and indexes ensured.")
except PyMongoError as e:
    logger.error(f"MongoDB connection error: {e}")
    raise ConnectionError("MongoDB connection failed.")


# Utility function to check if a string is an email
def is_email(string):
    logger.debug(f"Checking if '{string}' is an email.")
    email_regex =  r"^[\w\.-]+@[\w\.-]+\.\w+$"
    is_email = re.match(email_regex, string) is not None
    logger.debug(f"Is email: {is_email}")
    return is_email

# Utility function to check if its an admin

class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.get("user_role") == "admin"

def is_admin_account(username, email):
    # Example: usernames starting with 'admin_' and emails ending with '@eaglehub.in'
    return (
        re.match(r"^admin_[a-z]+_\d+$", username) and 
        email.endswith("@eaglehub.in")
    )

# Serializer for registration
class RegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(min_length=4)
    password = serializers.CharField(write_only=True, min_length=8)
    confirm_password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False)

class UserObject:
    def __init__(self, user_data):
        self.id = str(user_data["_id"])
        self.username = user_data["username"]
        self.email = user_data.get("email", "")
        self.user_role = user_data.get("user_role", "user")

    @property
    def is_authenticated(self):
        return True
    
    @property
    def is_staff(self):
        return self.user_role == "admin" 

    def get_username(self):
        return self.username
    
# Authentication Class
class MongoDBJWTAuthentication(BaseAuthentication):
    def authenticate(self, request):
        logger.debug("Authenticating using JWT...")
        token = request.COOKIES.get('access_token')
        if not token:
            logger.debug("No access_token cookie found.")
            raise AuthenticationFailed("Access token is missing.")
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            logger.debug(f"Decoded payload: {payload}")
            if payload.get("type") != "access":
                logger.debug("Token type is not access.")
                raise AuthenticationFailed("Token type is not access.")

            username = payload.get("username")
            if not username:
                logger.debug("No username in payload.")
                raise AuthenticationFailed("Username not found in token.")

            user = users_collection.find_one({"username": username})
            if not user:
                logger.debug("User not found in database.")
                raise AuthenticationFailed("User not found in database.")

            return (UserObject(user), None)

        except jwt.ExpiredSignatureError:
            logger.debug("Token expired.")
            raise AuthenticationFailed("Access token is expired.")
        except jwt.InvalidTokenError:
            logger.debug("Invalid token.")
            raise AuthenticationFailed("Access token is invalid.")
        except Exception as e:
            logger.error(f"Authentication error: {e}")
            raise AuthenticationFailed("Authentication failed.")

# Registration Functionality
class RegisterView(APIView):
    def post(self, request):
        logger.debug("RegisterView: Processing registration.")
        serializer = RegistrationSerializer(data=request.data)
        if not serializer.is_valid():
            logger.debug(f"Invalid registration data: {serializer.errors}")
            return Response({"error": serializer.errors}, status=400)

        username = serializer.validated_data["username"].strip().lower()
        password = serializer.validated_data["password"].strip().lower()
        confirm_password = serializer.validated_data["confirm_password"].strip().lower()
        email = serializer.validated_data.get("email", "").strip().lower()
        if password != confirm_password:
            logger.debug("Passwords do not match.")
            return Response({"error": "Passwords do not match"}, status=400)
        # Check if user exists
        if users_collection.find_one({"username": username}) or users_collection.find_one({"email": email}):
            logger.debug(f"User already exists, try using different username or email or both: {username}, {email}")
            return Response({"error": "User already exists"}, status=400)
        
        # Check if it's an admin account
        user_role = "admin" if is_admin_account(username, email) else "user"
        logger.debug(f"Assigned role: {user_role}")

        # Store user
        try:
            users_collection.insert_one({
                "username": username,
                "password": make_password(password),
                "email": email,
                "user_role": user_role,
            })
            logger.info(f"User registered: {username}")
            return Response({"success": True, "message": "User registered successfully"}, status=201)
        except PyMongoError as e:
            logger.error(f"MongoDB error during registration: {e}")
            return Response({"error": "Database error"}, status=500)

# Login Functionality
class LoginView(APIView):
    def post(self, request):
        logger.debug("LoginView: Processing login.")
        user_input = request.data.get("username or email").strip().lower()
        password = request.data.get("password").strip().lower()
        
        if not user_input or not password:
            logger.debug("Missing username or password.")
            return Response({"error": "Username/Email and password are required"}, status=400)
        try:
            # Determine if it's an email
            query_field = "email" if is_email(user_input) == True else "username"
            user = users_collection.find_one({query_field: user_input})

            if not user:
                logger.debug(f"No user found with {query_field}: {user_input}")
                return Response({"error": "Invalid Username or Password"}, status=401)

            if not check_password(password, user["password"]):
                logger.debug("Incorrect password.")
                return Response({"error": "Invalid Password"}, status=401)

            username = user["username"]
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

            response = Response({"message": "Login successful"}, status=200)
            response.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=True,  # True for production (use HTTPS)
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

            logger.info(f"User logged in: {username}")
            return response

        except PyMongoError as e:
            logger.error(f"MongoDB error during login: {e}")
            return Response({"error": "Database error"}, status=500)
        except Exception as e:
            logger.error(f"Login error: {e}")
            return Response({"error": "Login failed"}, status=500)

# Logout Functionality
class LogoutView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        logger.debug("LogoutView: Processing logout.")
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            logger.debug("No refresh token found.")
            return Response({"error": "Refresh token missing"}, status=400)

        # Blacklist refresh token if it exists and is valid
        try:
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
            # Continue even if blacklisting fails

        # Clear cookies
        response = Response({"message": "Logged out successfully"}, status=200)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        logger.info(f"User logged out: {request.user.username}")
        return response

# Protected View Functionality Template
class ProtectedView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        logger.debug("ProtectedView: Processing protected request.")
        try:
            username = request.user.username
            user = users_collection.find_one({"username": username})
            if not user:
                logger.debug("User not found in database.")
                return Response({"error": "User not found"}, status=404)
            logger.info(f"Protected route accessed by: {username}")
            return Response({"message": f"Welcome, {username}!"}, status=200)
        except Exception as e:
            logger.error(f"Protected view error: {e}")
            return Response({"error": str(e)}, status=500)

# Refresh Token Functionality
class RefreshTokenView(APIView):
    def post(self, request):
        logger.debug("RefreshTokenView: Processing refresh.")
        refresh_token = request.COOKIES.get("refresh_token")
        if not refresh_token:
            logger.debug("No refresh token found.")
            return Response({"error": "Refresh token missing"}, status=400)

        try:
            payload = jwt.decode(refresh_token, SECRET_KEY, algorithms=["HS256"])
            if payload.get("type") != "refresh":
                logger.debug("Invalid token type.")
                return Response({"error": "Invalid token type"}, status=401)

            # Check if token is blacklisted
            if blacklisted_tokens_coll.find_one({"token": refresh_token}):
                logger.debug("Refresh token is blacklisted.")
                return Response({"error": "Refresh token blacklisted"}, status=401)

            # Generate new access token
            new_access = jwt.encode({
                "username": payload["username"],
                "exp": datetime.datetime.utcnow() + datetime.timedelta(minutes=15),
                "type": "access"
            }, SECRET_KEY, algorithm="HS256")

            response = Response({"message": "Token refreshed"})
            response.set_cookie(
                "access_token",
                new_access,
                httponly=True,
                secure=True,
                samesite="Strict",
                max_age=15*60
            )
            logger.info(f"Token refreshed for user: {payload['username']}")
            return response

        except jwt.ExpiredSignatureError:
            logger.debug("Refresh token expired.")
            return Response({"error": "Refresh token expired"}, status=401)
        except jwt.InvalidTokenError:
            logger.debug("Invalid refresh token.")
            return Response({"error": "Invalid refresh token"}, status=401)
        except Exception as e:
            logger.error(f"Refresh token error: {e}")
            return Response({"error": "Refresh failed"}, status=500)