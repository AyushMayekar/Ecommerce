from rest_framework.views import APIView
from rest_framework.response import Response
from django.conf import settings
from pymongo import MongoClient
from user_auth.views import MongoDBJWTAuthentication
from rest_framework.permissions import IsAuthenticated


# Connecting MongoDB
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
products_collection = db["Products"]
users_collection = db["Users"]

# Single Product View
class ProductDetailView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def get(self, request, sku):
        product = products_collection.find_one({"sku": sku}, {"_id": 0})
        if not product:
            return Response({"error": "Product not found"}, status=404)
        return Response(product, status=200)

# Add to Cart View
class AddToCartView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        user = request.user
        data = request.data

        sku = data.get("sku")
        quantity = data.get("quantity", 1)
        selected_size = data.get("size", "")

        product = products_collection.find_one({"sku": sku})
        if not product:
            return Response({"error": "Product not found"}, status=404)

        # Prepare cart item
        cart_item = {
            "sku": sku,
            "name": product.get("name"),
            "mrp": product.get("mrp"),
            "image_urls": product.get("image_urls", [None]),  # optional
            "description": product.get("description", ""),
            "category": product.get("category", ""),
            "video_urls": product.get("video_urls", [None]),  # optional
            "quantity": quantity,
            "colors": product.get("colors"),
            "size": selected_size,
        }

        # Push to user cart
        users_collection.update_one(
            {"username": user.username},
            {"$push": {"cart": cart_item}},
            upsert=True
        )

        return Response({"message": "Product added to cart"}, status=200)

# Deleting from Cart View
class DeleteCartItemView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        user = request.user
        sku = request.data.get("sku")

        if not sku:
            return Response({"error": "SKU is required"}, status=400)

        users_collection.update_one(
            {"username": user.username},
            {"$pull": {"cart": {"sku": sku}}}
        )

        return Response({"message": "Product removed from cart"}, status=200)

# Updating the products in the cart
class UpdateCartItemView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request):
        user = request.user
        data = request.data
        sku = data.get("sku")

        if not sku:
            return Response({"error": "SKU is required"}, status=400)

        updates = {}
        if "quantity" in data:
            updates["cart.$.quantity"] = data["quantity"]
        if "size" in data:
            updates["cart.$.size"] = data["size"]

        result = users_collection.update_one(
            {"username": user.username, "cart.sku": sku},
            {"$set": updates}
        )

        if result.modified_count == 0:
            return Response({"error": "Cart item not found or nothing updated"}, status=404)

        return Response({"message": "Cart item updated successfully"}, status=200)

# Viewing the products in the cart
class ViewCartView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_data = users_collection.find_one({"username": user.username}, {"_id": 0, "cart": 1})
        cart = user_data.get("cart", []) if user_data else []
        return Response({"cart": cart}, status=200)
