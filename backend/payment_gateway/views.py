from django.conf import settings
from pymongo import MongoClient
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from user_auth.views import MongoDBJWTAuthentication
from rest_framework.response import Response
import razorpay
import uuid
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.management import call_command
import os

# Initialize MongoDB client
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
orders_collection = db["Orders"]

# Razorpay Credentials (Test keys for now)
razorpay_client = razorpay.Client(auth=(settings.TEST_KEY_ID, settings.TEST_KEY_SECRET))

#  Create order View
class CreateRazorpayOrder(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        order_items = request.data.get('order_items', [])
        shipping_info = request.data.get('shipping_info', {})
        payment_method = request.data.get('payment_method', '')
        subtotal = request.data.get('subtotal', 0)
        total_quantity = request.data.get('total_quantity', 0)
        amount_paise = int(float(subtotal) * 100)
        currency = "INR"
        receipt_id = f"{user.username}_{uuid.uuid4().hex[:8]}"

        # Razorpay expects amount in paise (multiply by 100)
        razorpay_order = razorpay_client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "receipt": receipt_id,
            "payment_capture": "1"
        })

        # Store in your own DB for tracking later
        order_record = {
            "user": user.username,
            "razorpay_order_id": razorpay_order["id"],
            "subtotal": subtotal,
            "total_quantity": total_quantity,
            "payment_method": payment_method,
            "payment_status": "PENDING",
            "created_at": datetime.utcnow(),
            "order_items": order_items,
            "shipping_info": shipping_info,
        }
        orders_collection.insert_one(order_record)

        return Response({
            "order_id": razorpay_order["id"],
            "amount": razorpay_order["amount"],
            "currency": razorpay_order["currency"],
            "receipt": receipt_id,
            "key": settings.TEST_KEY_ID,
        }, status=200)

# Verify payment View
class VerifyPaymentView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated]
    def post(self, request):
        try:
            # Extract details from request
            data = request.data
            params_dict = {
                "razorpay_order_id": data.get("razorpay_order_id"),
                "razorpay_payment_id": data.get("razorpay_payment_id"),
                "razorpay_signature": data.get("razorpay_signature")
            }

            # Step 1: Use Razorpay SDK to verify
            razorpay_client.utility.verify_payment_signature(params_dict)

            # Step 2: Update DB as PAID
            orders_collection.update_one(
                {"razorpay_order_id": params_dict["razorpay_order_id"]},
                {
                    "$set": {
                        "payment_id": params_dict["razorpay_payment_id"],
                        "payment_status": "PAID"
                    }
                }
            )

            return Response({"message": "Payment verified successfully"}, status=200)

        except razorpay.errors.SignatureVerificationError:
            # If invalid signature
            orders_collection.update_one(
                {"razorpay_order_id": data.get("razorpay_order_id")},
                {"$set": {"payment_status": "FAILED"}}
            )
            return Response({"error": "Payment verification failed"}, status=400)
        
# Function to delete stale orders
@csrf_exempt
def run_delete_stale_orders(request):
    token = request.GET.get("token")
    if token != settings.CRON_SECRET_TOKEN:
        return JsonResponse({"error": "Unauthorized"}, status=403)

    try:
        call_command('delete_stale_orders')
        return JsonResponse({"status": "Success"})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)