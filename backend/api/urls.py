from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import  FriendRequestViewSet, FriendViewSet, EmotionViewSet, DumpViewSet, DumpEmotionViewSet, CustomTokenObtainPairView,LogoutView
from rest_framework_simplejwt.views import TokenRefreshView,TokenVerifyView

# Initialize the router
router = DefaultRouter()
router.register(r'friendsrequest', FriendRequestViewSet)
router.register(r'friends', FriendViewSet)
router.register(r'emotions', EmotionViewSet)
router.register(r'dumps', DumpViewSet)
router.register(r'dumpemotions', DumpEmotionViewSet)

# Include the router's URLs in the urlpatterns
urlpatterns = [
    path('', include(router.urls)),
    path('login', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh',TokenRefreshView.as_view(),name='token_refresh'),
    path('token/verify',TokenVerifyView.as_view(),name='token_verify'),
    path('logout',LogoutView.as_view(), name='logout'),
]