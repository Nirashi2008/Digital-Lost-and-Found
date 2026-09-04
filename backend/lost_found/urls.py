from rest_framework.routers import DefaultRouter
from .views import LostItemViewSet, FoundItemViewSet, ClaimViewSet


router = DefaultRouter()

router.register("lost-items", LostItemViewSet, basename="lost-item")
router.register("found-items", FoundItemViewSet, basename="found-item")
router.register("claims", ClaimViewSet, basename="claim")


urlpatterns = router.urls