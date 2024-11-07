from django.db import models
from django.contrib.auth.models import AbstractBaseUser,PermissionsMixin,BaseUserManager
from django.utils import timezone
# Create your models here.

class UserAccountManager(BaseUserManager):
    def create_user(self,username, email, first_name, last_name, password,profile_image=None,birthdate=None,gender=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        if not password:
            raise ValueError('Users must have a password')
        # Check if username already exists
        if self.model.objects.filter(username=username).exists():
            raise ValueError('This username is already taken')
        
        email = self.normalize_email(email)
        user = self.model(username=username,email=email, first_name=first_name, last_name=last_name,profile_image=profile_image,birthdate=birthdate,gender=gender)
        user.set_password(password)
        user.save(using=self._db)
        
        return user

    def create_superuser(self,username, email, first_name, last_name, password=None):
        user = self.create_user(username,email, first_name, last_name, password)
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        
        return user

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(max_length=50,unique=True)
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    profile_image = models.CharField(max_length=256, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    gender = models.CharField(max_length=1, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    date_joined = models.DateTimeField(default=timezone.now)

    objects = UserAccountManager()

    USERNAME_FIELD = 'username'
    REQUIRED_FIELDS = ['email','first_name','last_name','password']

    def __str__(self):
        return self.email
    class Meta:
        managed = True
        db_table = 'api_user'

class Emotion(models.Model):
    emotion_id = models.AutoField(db_column='emotion_id', primary_key=True)
    emotion_name = models.CharField(db_column='emotion_name', unique=True, max_length=50)

    class Meta:
        managed = False
        db_table = 'emotion'
        
class Dump(models.Model):
    dump_id = models.AutoField(db_column='dump_id', primary_key=True)
    dump_timestamp = models.DateTimeField(db_column='dump_timestamp', auto_now_add=True)
    dump_content = models.CharField(db_column='dump_content', max_length=255)
    user_id = models.ForeignKey('User', models.DO_NOTHING, db_column='user_id')

    class Meta:
        managed = True
        db_table = 'dump'


class Friendrequests(models.Model):
    request_id = models.AutoField(db_column='request_id', primary_key=True)  
    sender_id = models.ForeignKey('User', models.DO_NOTHING, db_column='sender_id', related_name='sent_friend_requests')
    receiver_id = models.ForeignKey('User', models.DO_NOTHING, db_column='receiver_id', related_name='received_friend_requests')
    sent_at = models.DateTimeField(db_column='sent_at', blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'friendrequests'


class Friends(models.Model):
    friend_id = models.AutoField(db_column='friend_id', primary_key=True)
    user1_id = models.ForeignKey('User', models.DO_NOTHING, db_column='user1_id', related_name='friends1')
    user2_id = models.ForeignKey('User', models.DO_NOTHING, db_column='user2_id', related_name='friends2')
    friendship_date = models.DateTimeField(db_column='friendship_date', blank=True, null=True) 

    class Meta:
        managed = True
        db_table = 'friends'
        
class DumpEmotion(models.Model):
    dump_id = models.ForeignKey('Dump', models.CASCADE, db_column='dump_id', related_name='dump_emotions')
    emotion_id = models.ForeignKey('Emotion', models.CASCADE, db_column='emotion_id', related_name='dump_emotions')
    probability = models.FloatField(blank=True, null=True)

    class Meta:
        managed = True
        db_table = 'dumpemotion'
        constraints = [
            models.UniqueConstraint(fields=['dump_id', 'emotion_id'], name='unique_dump_emotion')
        ]
        