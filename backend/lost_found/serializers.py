
from rest_framework import serializers
from .models import LostItem, FoundItem, Claim, Notification


class LostItemSerializer(serializers.ModelSerializer):
    reported_by = serializers.ReadOnlyField(
        source="reported_by.username"
    )

    class Meta:
        model = LostItem
        fields = "__all__"
        read_only_fields = [
            "reported_by",
            "created_at",
            "status",
        ]


class FoundItemSerializer(serializers.ModelSerializer):
    reported_by = serializers.ReadOnlyField(
        source="reported_by.username"
    )

    class Meta:
        model = FoundItem
        fields = "__all__"
        read_only_fields = [
            "reported_by",
            "created_at",
            "status",
        ]


class ClaimSerializer(serializers.ModelSerializer):
    claimed_by = serializers.ReadOnlyField(
        source="claimed_by.username"
    )

    found_item_reported_by_me = serializers.SerializerMethodField()
    is_principal = serializers.SerializerMethodField()

    class Meta:
        model = Claim
        fields = "__all__"
        read_only_fields = [
            "claimed_by",
            "status",
            "created_at",
            "reviewed_by",
            "reviewed_at",
            "found_item_reported_by_me",
            "is_principal",
        ]

    def get_found_item_reported_by_me(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        return obj.found_item.reported_by_id == request.user.id

    def get_is_principal(self, obj):
        request = self.context.get("request")

        if not request or not request.user.is_authenticated:
            return False

        user = request.user

        return user.groups.filter(name="Principal").exists()

    def validate_found_item(self, value):
        request = self.context.get("request")

        if value.status != "available":
            raise serializers.ValidationError(
                "This item is no longer available for claim."
            )

        if (
            request
            and request.user.is_authenticated
            and value.reported_by_id == request.user.id
        ):
            raise serializers.ValidationError(
                "You cannot claim your own found item."
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
