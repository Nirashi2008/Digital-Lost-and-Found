
from rest_framework import serializers
from .models import LostItem, FoundItem, Claim, Notification


class LostItemSerializer(serializers.ModelSerializer):
    reported_by = serializers.ReadOnlyField(source="reported_by.username")

    class Meta:
        model = LostItem
        fields = "__all__"
        read_only_fields = ["reported_by", "created_at", "status"]


class FoundItemSerializer(serializers.ModelSerializer):
    reported_by = serializers.ReadOnlyField(source="reported_by.username")

    class Meta:
        model = FoundItem
        fields = "__all__"
        read_only_fields = ["reported_by", "created_at", "status"]


class ClaimSerializer(serializers.ModelSerializer):
    claimed_by = serializers.ReadOnlyField(
        source="claimed_by.username"
    )

    class Meta:
        model = Claim
        fields = "__all__"
        read_only_fields = [
            "claimed_by",
            "status",
            "created_at",
        ]

    def validate_found_item(self, value):
        if value.status != "available":
            raise serializers.ValidationError(
                "This item is no longer available for claim."
            )

        return value


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "title",
            "message",
            "link",
            "is_read",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "title",
            "message",
            "link",
            "created_at",
        ]
