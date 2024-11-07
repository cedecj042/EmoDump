import django_filters
from django_filters import FilterSet
from .models import Dump

class DumpFilter(FilterSet):
    dumptimestamp = django_filters.DateTimeFromToRangeFilter(field_name='dumptimestamp')
    user_id = django_filters.NumberFilter(field_name='user_id')

    class Meta:
        model = Dump
        fields = ['dumptimestamp', 'user_id']