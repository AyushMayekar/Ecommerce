from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from user_auth.views import MongoDBJWTAuthentication
from pymongo import MongoClient
from django.conf import settings

# MongoDB Setup
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
orders_collection = db["Orders"]
users_collection = db["Users"]
products_collection = db["Products"]

# View Pending Dispatch Orders (sorted oldest to newest)
class PendingDispatchOrdersView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]  
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        try:
            orders = list(orders_collection.find({
                "payment_status": "PAID",
                "delivery_status": "Not Dispatched"
            }).sort("created_at", 1))  # Ascending sort by order creation time

            for order in orders:
                order["_id"] = str(order["_id"])  # Convert ObjectId to str
                order["created_at"] = order["created_at"].isoformat()

            return Response({"orders": orders}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


# Mark Order as Dispatched
class MarkOrderDispatchedView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    def post(self, request):
        try:
            order_id = request.data.get("razorpay_order_id")
            if not order_id:
                return Response({"error": "razorpay_order_id is required"}, status=400)

            # Update in Orders collection
            order_update_result = orders_collection.update_one(
                {"razorpay_order_id": order_id},
                {"$set": {"delivery_status": "Dispatched"}}
            )

            if order_update_result.modified_count == 0:
                return Response({"error": "Order not found or already dispatched"}, status=404)

            # Find the user to update their embedded order
            order_doc = orders_collection.find_one({"razorpay_order_id": order_id})
            username = order_doc.get("user")

            users_collection.update_one(
                {"username": username, "my_orders.razorpay_order_id": order_id},
                {"$set": {"my_orders.$.delivery_status": "Dispatched"}}
            )

            return Response({"message": f"Order {order_id} marked as dispatched."}, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

# Pending Refund Orders View
class PendingRefundOrdersView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        pending_refunds = list(orders_collection.find({
            "delivery_status": "Cancelled",
            "refund_status": "Pending"
        }).sort("cancelled_at", 1))  # oldest first

        for order in pending_refunds:
            order["_id"] = str(order["_id"])  # JSON serializable

        return Response({"pending_refunds": pending_refunds}, status=200)

# Confirm Refund View
class ConfirmRefundView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        order_id = request.data.get("razorpay_order_id")

        if not order_id:
            return Response({"error": "Missing order ID"}, status=400)

        # Fetch order
        order = orders_collection.find_one({"razorpay_order_id": order_id})
        if not order:
            return Response({"error": "Order not found"}, status=404)

        if order.get("refund_status") != "Pending":
            return Response({"error": "Refund is not pending for this order"}, status=400)

        username = order.get("user")

        # Step 1: Restock inventory
        for item in order.get("order_items", []):
            sku = item.get("sku")
            qty = item.get("quantity", 0)
            products_collection.update_one({"sku": sku}, {"$inc": {"quantity": qty}})

        # Step 2: Remove from user's my_orders
        users_collection.update_one(
            {"username": username},
            {"$pull": {"my_orders": {"razorpay_order_id": order_id}}}
        )

        # Step 3: Delete order
        orders_collection.delete_one({"razorpay_order_id": order_id})

        return Response({"message": "Refund confirmed and order removed from database"}, status=200)

