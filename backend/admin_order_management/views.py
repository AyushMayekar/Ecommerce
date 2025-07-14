from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework import status
from user_auth.views import MongoDBJWTAuthentication
import razorpay
from datetime import datetime
from pymongo import MongoClient
from django.conf import settings

# Razorpay Initializations
razorpay_client = razorpay.Client(auth=(settings.TEST_KEY_ID, settings.TEST_KEY_SECRET))

# MongoDB Setup
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
orders_collection = db["Orders"]
users_collection = db["Users"]
products_collection = db["Products"]

# View for Filtered Orders Search
class OrderSearchView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        # Extract filters from query params
        name = request.GET.get("name")
        order_id = request.GET.get("orderId")
        delivery_status = request.GET.get("deliveryStatus")
        payment_status = request.GET.get("paymentStatus")
        refund_status = request.GET.get("refundStatus")
        payment_method = request.GET.get("paymentMethod")
        from_date = request.GET.get("fromDate")
        to_date = request.GET.get("toDate")

        query_filter = {}

        if name:
            query_filter["shipping_info.full_name"] = { "$regex": name, "$options": "i" }

        if order_id:
            query_filter["razorpay_order_id"] = { "$regex": order_id, "$options": "i" }

        if delivery_status:
            query_filter["delivery_status"] = { "$regex": delivery_status, "$options": "i" }

        if payment_status:
            query_filter["payment_status"] = { "$regex": payment_status, "$options": "i" }

        if refund_status:
            query_filter["refund_status"] = { "$regex": refund_status, "$options": "i" }

        if payment_method:
            query_filter["payment_method"] = { "$regex": payment_method, "$options": "i" }

        if from_date or to_date:
            date_filter = {}
            try:
                if from_date:
                    date_filter["$gte"] = datetime.strptime(from_date, "%Y-%m-%d")
                if to_date:
                    date_filter["$lte"] = datetime.strptime(to_date, "%Y-%m-%d")
                query_filter["created_at"] = date_filter
            except ValueError:
                return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)

        # Projection: Exclude internal MongoDB _id if needed
        projection = {"_id": 0}

        try:
            # print("Mongo Query:", query_filter)
            orders = list(orders_collection.find(query_filter, projection).sort("created_at", 1))
            # print("Matched Orders:", orders)
            return Response(orders, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

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

        payment_id = order.get("payment_id")
        amount = int(float(order.get("subtotal", 0)) * 100)  # Convert to paise
        username = order.get("user")

        try:
            # Step 0: Process the refund with Razorpay
            refund = razorpay_client.payment.refund(payment_id, {"amount": amount})

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

            return Response({"message": "Refund confirmed and order removed from database", "refund_id": refund.get("id"),}, status=200)

        except razorpay.errors.BadRequestError as e:
            return Response({"error": f"Razorpay error: {str(e)}"}, status=400)
    
        except Exception as e:
            return Response({"error": f"Refund error: {str(e)}"}, status=500)