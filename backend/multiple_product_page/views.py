from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.core.cache import cache
from pymongo import MongoClient
from django.conf import settings
from user_auth.views import MongoDBJWTAuthentication

# Connect to MongoDB
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
products_collection = db["Products"]

class MultipleProductPageView(APIView):
    # authentication_classes = [MongoDBJWTAuthentication]
    # permission_classes = [IsAuthenticated]

    def get(self, request):
        # Extract filters from query params
        category = request.GET.get("category")
        price_min = request.GET.get("price_min")
        price_max = request.GET.get("price_max")
        search = request.GET.get("search")

        # Build MongoDB filter
        query_filter = {}
        if category:
            query_filter["category"] = category
        if price_min and price_max:
            query_filter["price"] = {"$gte": float(price_min), "$lte": float(price_max)}
        if search:
            query_filter["name"] = {"$regex": search, "$options": "i"}  # Case-insensitive search

        # If not in cache, query MongoDB
        products = list(products_collection.find(query_filter, {"_id": 0}))

        return Response(products, status=status.HTTP_200_OK)