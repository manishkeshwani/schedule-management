from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.dateparse import parse_datetime
from .models import Teacher, Schedule
import json

# def get_teachers(request):
#     """Fetch all teachers."""
#     teachers = list(Teacher.objects.values('id', 'name'))
#     return JsonResponse(teachers, safe=False)

def get_teachers(request):
    """Fetch all teacher names."""
    teachers = list(Teacher.objects.values_list('name', flat=True))
    return JsonResponse(teachers, safe=False)


@csrf_exempt
def add_schedule(request):
    """Add a new schedule."""
    if request.method == "POST":
        data = json.loads(request.body)
        teacher_name = data.get('teacher')
        subject = data.get('subject')
        start_time = parse_datetime(data.get('start_time'))
        end_time = parse_datetime(data.get('end_time'))
        phase = data.get('phase')
        print(data)

        teacher = Teacher.objects.get(name=teacher_name)

        # Create a schedule entry
        schedule = Schedule.objects.create(
            subject=subject,
            teacher=teacher,
            start_time=start_time,
            end_time=end_time,
            phase=phase
        )
        return JsonResponse({"message": "Schedule added successfully!", "id": schedule.id})
    return JsonResponse({"error": "Invalid request method"}, status=400)

def get_schedules(request):
    """Fetch all schedules."""
    schedules = list(Schedule.objects.values('id', 'subject', 'teacher__name', 'start_time', 'end_time', 'phase'))
    return JsonResponse(schedules, safe=False)
