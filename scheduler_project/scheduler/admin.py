from django.contrib import admin
from .models import Teacher, Schedule

@admin.register(Teacher)
class TeacherAdmin(admin.ModelAdmin):
    list_display = ['name', 'subject']

@admin.register(Schedule)
class ScheduleAdmin(admin.ModelAdmin):
    list_display = ['subject', 'teacher', 'start_time', 'end_time', 'phase']
