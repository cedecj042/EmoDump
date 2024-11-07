from djoser.serializers import UserCreateSerializer, UserSerializer
from rest_framework import serializers
from.models import Dump, DumpEmotion, Emotion, Friends, Friendrequests
from django.contrib.auth import get_user_model
from rest_framework.exceptions import ValidationError
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken, TokenError
User = get_user_model()

class UserSerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = User
        fields = '__all__'
        
    def validate(self,attrs):
        validated_attr = super().validate(attrs)
        username = validated_attr.get('username')
        
        user = user.objects.get(username=username)
        
        if not user.is_active:
            raise ValidationError('Account not activated')
        return validated_attr
    
class UserCreateSerializer(UserCreateSerializer):
    class Meta(UserCreateSerializer.Meta):
        model = User
        fields = ('username','email','password','first_name','last_name','profile_image','birthdate','gender')
        read_only_fields = ('id',)
        extra_kwargs = {
            'password': {'write_only': True}
        }
        
    def create(self,validated_data):
        user = super().create(validated_data)
        
        return user

class FriendSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friends
        fields = '__all__'
        
class FriendRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = Friendrequests
        fields = '__all__'

class EmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Emotion
        fields = '__all__'

class DumpSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dump
        fields = ('dump_id','dump_content','user_id','dump_timestamp')
        read_only_fields = ('dump_id','dump_timestamp')
        ordering=['dump_timestamp']

class DumpEmotionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DumpEmotion
        fields = '__all__'
        
        
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        
        user = self.user
        data.update({
            'id': user.id,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'email': user.email,
            'username': user.username,
            'profile_image': user.profile_image,
            'gender': user.gender,
            'birthdate': user.birthdate
        })
        return data
    
class LogoutSerializer(serializers.Serializer):
    refresh = serializers.CharField()
    
    default_error_messages={
        'bad_token':{'Token is expired or invalid'}
    }
    def validate(self,attrs):
        self.token = attrs['refresh']
        
        return attrs
    
    def save(self,**kwargs):
        try:
            RefreshToken(self.token).blacklist()
        except TokenError:
            self.fail('bad token')

