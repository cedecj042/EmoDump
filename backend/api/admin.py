from django.contrib import admin
from .models import User, Dump,Emotion, DumpEmotion

# Register your models here.
admin.site.register(User)
admin.site.register(Dump)
admin.site.register(Emotion)
admin.site.register(DumpEmotion)