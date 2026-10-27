
from django.contrib.auth import get_user_model
from django.db.models import Q

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

from .models import LostItem, FoundItem, Claim, Notification
from .serializers import (
    LostItemSerializer,
    FoundItemSerializer,
    ClaimSerializer,
    NotificationSerializer,
)


User = get_user_model()


def create_item_notifications(item, item_type, link):
    """Create a notification for every registered user."""

    if item_type == "lost":
        title = "New Lost Item Report"
        message = f"A new lost item was reported: {item.item_name}"
    else:
        title = "New Found Item Report"
        message = f"A new found item was reported: {item.item_name}"

    notifications = [
        Notification(
            recipient=user,
            title=title,
            message=message,
            link=link,
        )
        for user in User.objects.all().iterator()
    ]

    Notification.objects.bulk_create(notifications)


class LostItemViewSet(viewsets.ModelViewSet):
    serializer_class = LostItemSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = LostItem.objects.all().order_by("-created_at")

        category = self.request.query_params.get("category")
        location = self.request.query_params.get("location")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category=category)

        if location:
            queryset = queryset.filter(location__icontains=location)

        if search:
            queryset = queryset.filter(
                Q(item_name__icontains=search)
                | Q(description__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        item = serializer.save(reported_by=self.request.user)

        create_item_notifications(
            item=item,
            item_type="lost",
            link="/lost-items",
        )


class FoundItemViewSet(viewsets.ModelViewSet):
    serializer_class = FoundItemSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        queryset = FoundItem.objects.all().order_by("-created_at")

        category = self.request.query_params.get("category")
        location = self.request.query_params.get("location")
        search = self.request.query_params.get("search")

        if category:
            queryset = queryset.filter(category=category)

        if location:
            queryset = queryset.filter(location__icontains=location)

        if search:
            queryset = queryset.filter(
                Q(item_name__icontains=search)
                | Q(description__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        item = serializer.save(reported_by=self.request.user)

        create_item_notifications(
            item=item,
            item_type="found",
            link="/found-items",
        )


class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Claim.objects.filter(
            claimed_by=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(claimed_by=self.request.user)

    def perform_update(self, serializer):
        claim = serializer.save()

        if claim.status == "approved":
            claim.found_item.status = "claimed"
            claim.found_item.save(update_fields=["status"])


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")
