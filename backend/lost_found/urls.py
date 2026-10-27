
from rest_framework.routers import DefaultRouter

from .views import (
    LostItemViewSet,
    FoundItemViewSet,
    ClaimViewSet,
    NotificationViewSet,
)

router = DefaultRouter()

router.register("lost-items", LostItemViewSet, basename="lost-item")
router.register("found-items", FoundItemViewSet, basename="found-item")
router.register("claims", ClaimViewSet, basename="claim")
router.register("notifications", NotificationViewSet, basename="notification")

urlpatterns = router.urls
