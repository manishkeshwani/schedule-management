from django.urls import path
from . import views

urlpatterns = [
    path('teachers/', views.get_teachers, name='get_teachers'),
    path('schedules/', views.get_schedules, name='get_schedules'),
    path('schedules/add/', views.add_schedule, name='add_schedule'),
]
