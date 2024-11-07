from rest_framework import viewsets
from rest_framework import status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated,AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.views import APIView
from rest_framework.filters import OrderingFilter

from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.db import transaction

from ai.predict import EmotionPredictor
from .permissions import IsDumpOwner,IsAdminUserOrReadOnly
from .serializers import CustomTokenObtainPairSerializer
from .models import Dump, DumpEmotion, Emotion, Friends, Friendrequests
from .serializers import  FriendSerializer, EmotionSerializer, DumpSerializer, DumpEmotionSerializer, FriendRequestSerializer,LogoutSerializer
from .filters import DumpFilter
from django.db.models import Q  
from django.conf import settings
import json
import os
import pprint

User=get_user_model()
# Create your views here.

class FriendViewSet(viewsets.ModelViewSet):
    queryset = Friends.objects.all()
    serializer_class = FriendSerializer
    permission_classes=[IsDumpOwner]
    
class FriendRequestViewSet(viewsets.ModelViewSet):
    queryset = Friendrequests.objects.all()
    serializer_class = FriendRequestSerializer
    permission_classes=[IsDumpOwner]

class EmotionViewSet(viewsets.ModelViewSet):
    queryset = Emotion.objects.all()
    serializer_class = EmotionSerializer
    permission_classes=[IsAuthenticatedOrReadOnly]


class DumpViewSet(viewsets.ModelViewSet):
    queryset = Dump.objects.all()
    serializer_class = DumpSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_class = DumpFilter
    ordering_fields = ['dump_timestamp']
    ordering = ['dump_timestamp']
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        
        if instance.user_id != request.user:
            return Response(
                {"error": "You do not have permission to delete this dump."},
                status=status.HTTP_403_FORBIDDEN
            )

        self.perform_destroy(instance)
        return Response({"message":"Dump Deleted"},status=status.HTTP_200_OK)
    
    
    def get_queryset(self):
        queryset = Dump.objects.all()
        user_id = self.request.query_params.get('user_id', None)
        include_friends = self.request.query_params.get('include_friends', 'false').lower() == 'true'

        if user_id is not None:
            if include_friends:
                friends = Friends.objects.filter(Q(user1_id=user_id) | Q(user2_id=user_id))
                friend_ids = set()
                for friend in friends:
                    if friend.user1_id == int(user_id):
                        friend_ids.add(friend.user2_id)
                    else:
                        friend_ids.add(friend.user1_id)
                queryset = queryset.filter(Q(user_id=user_id) | Q(user_id__in=friend_ids))
            else:
                queryset = queryset.filter(user_id=user_id)
        return queryset

    def perform_create(self, serializer):
        # Save the Dump instance
        dump = serializer.save()

        # Initialize EmotionPredictor with correct paths
        predictor = EmotionPredictor(
            model_path=os.path.join(settings.DATA_DIR, 'models/distilbert_emotions.bin'),
            tokenizer_path=os.path.join(settings.DATA_DIR, 'models/vocab_distilbert_emotions.bin')
        )

        # Use EmotionPredictor to get the emotion probabilities
        probabilities = predictor.predict(dump)

    def create(self, request, *args, **kwargs):
        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

class DumpEmotionViewSet(viewsets.ModelViewSet):
    queryset = DumpEmotion.objects.all()
    serializer_class = DumpEmotionSerializer
    permission_classes=[IsAuthenticatedOrReadOnly]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        dump_id = self.request.query_params.get('dump_id', None)
        if dump_id is not None:
            queryset = queryset.filter(dump_id=dump_id)
        return queryset

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes=[AllowAny]
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        username = request.data.get('username')
        try:
            user = User.objects.get(username=username)
            if not user.is_active:
                return Response({'detail':'Account not active'},status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error':'Invalid Username or Password'},status=status.HTTP_400_BAD_REQUEST)
        
        return response
    
class LogoutView(APIView):
    serializer_class = LogoutSerializer
    permission_classes=[IsAuthenticated]
    def post(self, request):
        serializer=self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        
        return Response(status=status.HTTP_204_NO_CONTENT)

