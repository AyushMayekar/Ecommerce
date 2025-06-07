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

            # Check connection to MongoDB
            try:
                client.server_info()
            except errors.ServerSelectionTimeoutError as e:
                self.stderr.write(f"❌ Could not connect to MongoDB: {e}")
                return

            # Define expiry threshold
            expiry_threshold = datetime.utcnow() - timedelta(hours=2)
            # print(f"Expiry threshold set to: {expiry_threshold}")

            # Filter & delete stale orders
            result = orders_collection.delete_many({
                "payment_status": "PENDING",
                "payment_method": "ONLINE",
                "created_at": {"$lt": expiry_threshold}
            })

            self.stdout.write(
                self.style.SUCCESS(f"[{datetime.utcnow()}] ✅ {result.deleted_count} stale orders deleted.")
            )

        except Exception as e:
            self.stderr.write(f"[{datetime.utcnow()}] ❌ Unexpected error during stale order cleanup:")
            self.stderr.write(str(e))
            self.stderr.write(traceback.format_exc())