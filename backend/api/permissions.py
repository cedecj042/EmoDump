from rest_framework import permissions
from rest_framework.permissions import BasePermission

class IsDumpOwner(BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.user.id == request.user.id
    
class IsAdminUserOrReadOnly(BasePermission):
    def has_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        else:
            return request.user and request.user.is_staff

