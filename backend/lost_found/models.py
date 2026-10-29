
from django.conf import settings
from django.db import models


class LostItem(models.Model):

    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("documents", "Documents"),
        ("wallet", "Wallet"),
        ("keys", "Keys"),
        ("books", "Books"),
        ("clothing", "Clothing"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("found", "Found"),
        ("closed", "Closed"),
    ]

    item_name = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.TextField()
    location = models.CharField(max_length=200)
    lost_date = models.DateField()
    image = models.ImageField(
        upload_to="lost_items/",
        blank=True,
        null=True,
    )

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="lost_items",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.item_name


class FoundItem(models.Model):

    CATEGORY_CHOICES = [
        ("electronics", "Electronics"),
        ("documents", "Documents"),
        ("wallet", "Wallet"),
        ("keys", "Keys"),
        ("books", "Books"),
        ("clothing", "Clothing"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("available", "Available"),
        ("claimed", "Claimed"),
        ("closed", "Closed"),
    ]

    item_name = models.CharField(max_length=100)
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES)
    description = models.TextField()
    location = models.CharField(max_length=200)
    found_date = models.DateField()
    image = models.ImageField(
        upload_to="found_items/",
        blank=True,
        null=True,
    )

    reported_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="found_items",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="available",
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.item_name


class Claim(models.Model):

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("rejected", "Rejected"),
    ]

    found_item = models.ForeignKey(
        FoundItem,
        on_delete=models.CASCADE,
        related_name="claims",
    )

    claimed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="claims",
    )

    message = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    # Principal who reviewed the claim
    reviewed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="reviewed_claims",
    )

    # Date and time when the claim was reviewed
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return (
            f"{self.claimed_by.username} - "
            f"{self.found_item.item_name}"
        )


class Notification(models.Model):

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="notifications",
    )

    title = models.CharField(max_length=200)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)

    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.title} - {self.recipient}"
