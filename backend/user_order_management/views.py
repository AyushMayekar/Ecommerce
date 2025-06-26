from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from user_auth.views import MongoDBJWTAuthentication
from django.conf import settings
from pymongo import MongoClient
from datetime import datetime

# DB connections
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
users_collection = db["Users"]
orders_collection = db["Orders"]
products_collection = db["Products"]

# Get My Orders View
class UserOrdersView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        user_doc = users_collection.find_one({"username": user.username})
        if not user_doc:
            return Response({"error": "User not found"}, status=404)
        orders = user_doc.get("my_orders", [])
        for order in orders:
            if "_id" in order:
                order["_id"] = str(order["_id"])
        return Response({"orders": orders}, status=200)


# Cancel Order View
class CancelOrderView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        order_id = request.data.get("razorpay_order_id")

        if not order_id:
            return Response({"error": "Order ID is required"}, status=400)

        # Fetch the order
        order = orders_collection.find_one({"razorpay_order_id": order_id, "user": user.username})
        if not order:
            return Response({"error": "Order not found"}, status=404)

        if order.get("delivery_status") != "Not Dispatched":
            return Response({"error": "Order cannot be cancelled once dispatched"}, status=403)

        if order.get("payment_status") == "PAID":
            # Update order and user's my_orders
            orders_collection.update_one(
                {"razorpay_order_id": order_id},
                {
                    "$set": {
                        "delivery_status": "Cancelled",
                        "refund_status": "Pending",
                        "cancelled_at": datetime.utcnow()
                    }
                }
            )

            users_collection.update_one(
                {"username": user.username, "my_orders.razorpay_order_id": order_id},
                {
                    "$set": {
                        "my_orders.$.delivery_status": "Cancelled",
                        "my_orders.$.refund_status": "Pending",
                        "my_orders.$.cancelled_at": datetime.utcnow()
                    }
                }
            )

            return Response({"message": "Order cancelled and refund initiated"}, status=200)

        else:
            # Restore stock
            for item in order.get("order_items", []):
                sku = item.get("sku")
                qty = item.get("quantity", 0)
                products_collection.update_one({"sku": sku}, {"$inc": {"quantity": qty}})

            # Remove from user.my_orders
            users_collection.update_one(
                {"username": user.username},
                {"$pull": {"my_orders": {"razorpay_order_id": order_id}}}
            )

            # Delete order from orders collection
            orders_collection.delete_one({"razorpay_order_id": order_id})

            return Response({"message": "Unpaid order deleted successfully"}, status=200)
