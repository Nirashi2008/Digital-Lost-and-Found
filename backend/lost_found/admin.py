from django.contrib import admin
from .models import LostItem, FoundItem, Claim


@admin.register(LostItem)
class LostItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_name",
        "category",
        "location",
        "lost_date",
        "status",
        "reported_by",
    )

    list_filter = (
        "category",
        "status",
        "lost_date",
    )

    search_fields = (
        "item_name",
        "description",
        "location",
    )


@admin.register(FoundItem)
class FoundItemAdmin(admin.ModelAdmin):
    list_display = (
        "item_name",
        "category",
        "location",
        "found_date",
        "status",
        "reported_by",
    )

    list_filter = (
        "category",
        "status",
        "found_date",
    )

    search_fields = (
        "item_name",
        "description",
        "location",
    )


@admin.register(Claim)
class ClaimAdmin(admin.ModelAdmin):
    list_display = (
        "found_item",
        "claimed_by",
        "status",
        "created_at",
    )

    list_filter = ("status",)

    search_fields = (
        "found_item__item_name",
        "claimed_by__username",
        "message",
    )