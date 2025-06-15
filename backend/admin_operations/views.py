from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from user_auth.views import MongoDBJWTAuthentication
from django.conf import settings
import cloudinary.uploader
import uuid
from pymongo import MongoClient
import hashlib

# MongoDB connection
client = MongoClient(settings.MONGODB_URL)
db = client["EagleHub"]
products_collection = db["Products"]
orders_collection = db["Orders"]

# Cloudinary configuration
cloudinary.config( 
    cloud_name = settings.CLOUD_NAME, 
    api_key = settings.CLOUDINARY_API_KEY, 
    api_secret = settings.CLOUDINARY_API_SECRET,
    secure = True
)

# Product Management API's
# Helper to generate SKU
def generate_sku(product_name, category, sizes, colors):
    name_code = product_name[:3].upper()
    category_code = category[:3].upper()
    size_str = ",".join(sorted(s.upper() for s in sizes)) if sizes else "NA"
    color_str = ",".join(sorted(c.lower() for c in colors)) if colors else "NA"
    combo_string = f"{size_str}:{color_str}"
    combo_hash = hashlib.md5(combo_string.encode()).hexdigest()[:6].upper()
    uid = str(uuid.uuid4())[:4].upper()
    return f"SKU-{name_code}-{category_code}-{combo_hash}-{uid}"

# Upload to Cloudinary
def upload_files_to_cloudinary(files, folder):
    urls = []
    for file in files:
        try:
            content_type = file.content_type.lower()
            if content_type.startswith("video"):
                result = cloudinary.uploader.upload(file, folder=folder, resource_type="video")
            else:
                result = cloudinary.uploader.upload(file, folder=folder, resource_type="image")

            urls.append(result["secure_url"])
        except Exception as e:
            print(f"Upload failed for {file.name}: {e}")
    return urls

# Product Management Views

class AddProductView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request):
        data = request.data

        # Required fields
        product_name = data.get("name").strip().lower()
        category = data.get("category").strip().lower()
        quantity = int(data.get("quantity"))
        try:
            quantity_threshold = int(data.get("quantity_threshold"))
        except ValueError:
            quantity_threshold = 0
        description = data.get("description").strip().lower()
        colors = [c.strip().lower() for c in data.get("colors", "").split(",") if c.strip()]
        size = [s.strip().upper() for s in data.get("size", "").split(",") if s.strip()]
        try:
            mrp = float(data.get("mrp"))
        except ValueError:
            mrp = 0.0
        try:
            wholesale_price = float(data.get("wholesale_price"))
        except ValueError:
            wholesale_price = 0.0
        try:
            gst = float(data.get("gst"))
        except ValueError:
            gst = 0.0

        # Files
        images = request.FILES.getlist("images")
        videos = request.FILES.getlist("videos")
        image_urls = upload_files_to_cloudinary(images, "product_images")
        video_urls = upload_files_to_cloudinary(videos, "product_videos")
        sku = generate_sku(product_name, category, size, colors)
        product_doc = {
            "name": product_name,
            "category": category,
            "quantity": quantity,
            "quantity_threshold": quantity_threshold,
            "description": description,
            "colors": colors,
            "mrp": mrp,
            "wholesale_price": wholesale_price,
            "image_urls": image_urls,
            "video_urls": video_urls,
            "sku": sku,
            "gst" :gst,
            "size":size
        }

        products_collection.insert_one(product_doc)

        return Response({"message": "Product added successfully", "sku": sku}, status=status.HTTP_201_CREATED)

class DeleteProductView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

    def delete(self, request, sku):
        result = products_collection.delete_one({"sku": sku})

        if result.deleted_count == 1:
            return Response({"message": "Product deleted"}, status=status.HTTP_200_OK)
        else:
            return Response({"message": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

class UpdateProductView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]
    def get(self, request, sku):
        product = products_collection.find_one({"sku": sku}, {"_id": 0})

        if not product:
            return Response({"error": "Product not found"}, status=404)

        return Response(product)

    def put(self, request, sku):
        existing = products_collection.find_one({"sku": sku})
    
        if not existing:
            return Response({"error": "Product not found"}, status=404)

        updated_fields = {}
    
        # Handle quantity addition
        add_quantity = request.data.get("add_quantity")
        if add_quantity is not None:
            try:
                updated_fields["quantity"] = existing["quantity"] + int(add_quantity)
            except ValueError:
                return Response({"error": "Invalid quantity"}, status=400)

        # Handle optional updates
        numeric_fields = ["mrp", "wholesale_price", "quantity_threshold", "gst"]

        for field in ["name", "category", "description", "mrp", "wholesale_price", "quantity_threshold", "colors", "size", "gst"]:
            if field in request.data:
                value = request.data[field]
                if field in numeric_fields:
                    try:
                        value = float(value)
                    except ValueError:
                        return Response({"error": f"Invalid value for {field}"}, status=400)
                elif field == "colors":
                    value = [c.strip().lower() for c in value.split(",") if c.strip()]
                elif field == "size":
                    value = [s.strip().upper() for s in value.split(",") if s.strip()]
            updated_fields[field] = value

        # Handle media uploads
        if request.FILES.getlist("images"):
            image_urls = []
            for img in request.FILES.getlist("images"):
                res = cloudinary.uploader.upload(img)
                image_urls.append(res.get("secure_url"))
            updated_fields["image_urls"] = image_urls

        if request.FILES.getlist("videos"):
            video_urls = []
            for vid in request.FILES.getlist("videos"):
                res = cloudinary.uploader.upload(vid, resource_type="video")
                video_urls.append(res.get("secure_url"))
            updated_fields["video_urls"] = video_urls

        # Update DB
        result = products_collection.update_one({"sku": sku}, {"$set": updated_fields})

        if result.modified_count == 0:
            return Response({"message": "No changes made"}, status=200)

        return Response({"message": "Product updated successfully"})

class ReadProductView(APIView):
    authentication_classes = [MongoDBJWTAuthentication]
    permission_classes = [IsAuthenticated, IsAdminUser]

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

        if price_min or price_max:
            price_filter = {}
            if price_min:
                price_filter["$gte"] = float(price_min)
            if price_max:
                price_filter["$lte"] = float(price_max)
            query_filter["mrp"] = price_filter

        if search:
            query_filter["name"] = {"$regex": search, "$options": "i"}

        products = list(products_collection.find(query_filter, { "_id": 0,
    "name": 1,
    "category": 1,
    "quantity": 1,
    "quantity_threshold": 1,
    "description": 1,
    "colors": 1,
    "mrp": 1,
    "wholesale_price": 1,
    "image_urls": 1,
    "video_urls": 1,
    "sku": 1,
    "gst": 1,
    "size": 1}))

        return Response(products, status=status.HTTP_200_OK)    

    # Order Management Views
