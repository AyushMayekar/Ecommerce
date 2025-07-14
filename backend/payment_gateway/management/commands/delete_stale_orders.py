from django.core.management.base import BaseCommand
from datetime import datetime, timedelta
from pymongo import MongoClient, errors
import traceback
from django.conf import settings

class Command(BaseCommand):
    help = 'Deletes stale online pending orders older than 1 hour'

    def handle(self, *args, **kwargs):
        try:
            # Log the start time
            self.stdout.write(f"[{datetime.utcnow()}] Starting stale order cleanup...")

            # Connect to MongoDB
            client = MongoClient(settings.MONGODB_URL)
            db = client["EagleHub"]
            orders_collection = db["Orders"]
            products_collection = db["Products"]
            users_collection = db["Users"]

            # Check connection to MongoDB
            try:
                client.server_info()
            except errors.ServerSelectionTimeoutError as e:
                self.stderr.write(f"❌ Could not connect to MongoDB: {e}")
                return

            # Define expiry threshold
            expiry_threshold = datetime.utcnow() - timedelta(hours=1)
            # print(f"Expiry threshold set to: {expiry_threshold}")

            # Fetch all stale orders
            stale_orders = list(orders_collection.find({
                "payment_status": "PENDING",
                "payment_method": "ONLINE",
                "created_at": {"$lt": expiry_threshold}
            }))

            if not stale_orders:
                self.stdout.write(f"[{datetime.utcnow()}] ✅ No stale orders found.")
                return

            for order in stale_orders:
                username = order.get("user")
                order_id = order.get("razorpay_order_id")
                order_items = order.get("order_items", [])

                # Restore product stock
                for item in order_items:
                    sku = item.get("sku")
                    quantity_to_restore = item.get("quantity", 0)
                    if sku and quantity_to_restore:
                        products_collection.update_one(
                            {"sku": sku},
                            {"$inc": {"quantity": quantity_to_restore}}
                        )

                # Remove from user's my_orders list
                users_collection.update_one(
                    {"username": username},
                    {"$pull": {"my_orders": {"razorpay_order_id": order_id}}}
                )

                # Delete the order
                orders_collection.delete_one({"_id": order["_id"]})

            self.stdout.write(
                self.style.SUCCESS(f"🗑️ Deleted order: {order_id} | Stock restored | User: {username}")
            )

            self.stdout.write(
                self.style.SUCCESS(f"[{datetime.utcnow()}] ✅ {len(stale_orders)} stale orders cleaned up.")
            )

        except Exception as e:
            self.stderr.write(f"[{datetime.utcnow()}] ❌ Unexpected error during stale order cleanup:")
            self.stderr.write(str(e))
            self.stderr.write(traceback.format_exc())