
from django.contrib.auth import get_user_model
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.parsers import (
    MultiPartParser,
    FormParser,
    JSONParser,
)
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError

from .models import LostItem, FoundItem, Claim, Notification
from .serializers import (
    LostItemSerializer,
    FoundItemSerializer,
    ClaimSerializer,
    NotificationSerializer,
)


User = get_user_model()


def is_principal(user):
    """Return True only for an authenticated Principal group member."""
    return (
        user.is_authenticated
        and user.groups.filter(name="Principal").exists()
    )


def create_item_notifications(item, item_type, link):
    """Notify all registered users about a new lost/found item."""

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

    # Claim status changes are handled only by the review endpoint.
    http_method_names = ["get", "post", "head", "options"]

    def get_queryset(self):
        user = self.request.user

        queryset = Claim.objects.select_related(
            "found_item",
            "claimed_by",
            "found_item__reported_by",
            "reviewed_by",
        )

        # Principal can see all claims for online verification.
        if is_principal(user):
            return queryset.order_by("-created_at")

        # Other users see their submitted claims and claims
        # submitted for found items they reported.
        return queryset.filter(
            Q(claimed_by=user)
            | Q(found_item__reported_by=user)
        ).order_by("-created_at")

    def perform_create(self, serializer):
        found_item = serializer.validated_data["found_item"]
        user = self.request.user

        if found_item.reported_by_id == user.id:
            raise ValidationError({
                "found_item": "You cannot claim your own found item."
            })

        if found_item.status != "available":
            raise ValidationError({
                "found_item": "This item is no longer available."
            })

        if Claim.objects.filter(
            found_item=found_item,
            claimed_by=user,
            status="pending",
        ).exists():
            raise ValidationError({
                "detail": "You already have a pending claim for this item."
            })

        serializer.save(claimed_by=user)

        # Notify the user who reported the found item.
        Notification.objects.create(
            recipient=found_item.reported_by,
            title="New Claim Request",
            message=(
                f"{user.username} submitted a claim for "
                f"{found_item.item_name}."
            ),
            link="/claims",
        )

        # Notify Principal users that a claim needs verification.
        principal_users = User.objects.filter(
            groups__name="Principal",
            is_active=True,
        ).distinct()

        Notification.objects.bulk_create([
            Notification(
                recipient=principal,
                title="Claim Awaiting Verification",
                message=(
                    f"A claim was submitted for {found_item.item_name}. "
                    "Principal verification is required."
                ),
                link="/claims",
            )
            for principal in principal_users
        ])

    @action(detail=True, methods=["post"])
    @transaction.atomic
    def review(self, request, pk=None):
        # Only a Principal may approve or reject claims.
        if not is_principal(request.user):
            return Response(
                {"detail": "Only the Principal can review claims."},
                status=status.HTTP_403_FORBIDDEN,
            )

        # Lock the claim while it is being reviewed.
        try:
            claim = Claim.objects.select_for_update().get(pk=pk)
        except Claim.DoesNotExist:
            return Response(
                {"detail": "Claim not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        decision = request.data.get("status")

        if decision not in ["approved", "rejected"]:
            return Response(
                {"detail": "Status must be approved or rejected."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if claim.status != "pending":
            return Response(
                {"detail": "This claim has already been reviewed."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        found_item = FoundItem.objects.select_for_update().get(
            pk=claim.found_item_id
        )

        if decision == "approved" and found_item.status != "available":
            return Response(
                {"detail": "This item is no longer available."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if decision == "approved":
            # Mark the found item as claimed.
            found_item.status = "claimed"
            found_item.save(update_fields=["status"])

            # Reject all other pending claims for this item.
            other_claims = list(
                Claim.objects.select_for_update().filter(
                    found_item=found_item,
                    status="pending",
                ).exclude(pk=claim.pk)
            )

            for other_claim in other_claims:
                other_claim.status = "rejected"
                other_claim.reviewed_by = request.user
                other_claim.reviewed_at = timezone.now()

            if other_claims:
                Claim.objects.bulk_update(
                    other_claims,
                    ["status", "reviewed_by", "reviewed_at"],
                )

                Notification.objects.bulk_create([
                    Notification(
                        recipient=other_claim.claimed_by,
                        title="Claim Rejected",
                        message=(
                            f"Another claim was approved for "
                            f"{found_item.item_name}. "
                            "Your claim was not approved."
                        ),
                        link="/claims",
                    )
                    for other_claim in other_claims
                ])

            notification_title = "Claim Approved"
            notification_message = (
                f"Your claim for {found_item.item_name} "
                "was approved by the Principal."
            )

        else:
            notification_title = "Claim Rejected"
            notification_message = (
                f"Your claim for {found_item.item_name} "
                "was rejected by the Principal."
            )

        # Record who verified the claim and when.
        claim.status = decision
        claim.reviewed_by = request.user
        claim.reviewed_at = timezone.now()
        claim.save(update_fields=[
            "status",
            "reviewed_by",
            "reviewed_at",
        ])

        # Notify the claimant of the decision.
        Notification.objects.create(
            recipient=claim.claimed_by,
            title=notification_title,
            message=notification_message,
            link="/claims",
        )

        return Response(
            ClaimSerializer(
                claim,
                context={"request": request},
            ).data,
            status=status.HTTP_200_OK,
        )


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")
