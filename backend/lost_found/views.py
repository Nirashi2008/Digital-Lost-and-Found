from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from .models import LostItem, FoundItem, Claim
from .serializers import (
    LostItemSerializer,
    FoundItemSerializer,
    ClaimSerializer,
)


class LostItemViewSet(viewsets.ModelViewSet):
    serializer_class = LostItemSerializer
    permission_classes = [IsAuthenticated]

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
                item_name__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


class FoundItemViewSet(viewsets.ModelViewSet):
    serializer_class = FoundItemSerializer
    permission_classes = [IsAuthenticated]

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
                item_name__icontains=search
            ) | queryset.filter(
                description__icontains=search
            )

        return queryset

    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)


class ClaimViewSet(viewsets.ModelViewSet):
    serializer_class = ClaimSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Claim.objects.filter(
            claimed_by=self.request.user
        ).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(
            claimed_by=self.request.user
        )

    def perform_update(self, serializer):
        claim = serializer.save()

        if claim.status == "approved":
            claim.found_item.status = "claimed"
            claim.found_item.save()


