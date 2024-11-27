from django.core.management.base import BaseCommand
from scheduler.models import Teacher

class Command(BaseCommand):
    help = "Populate the database with dummy data"

    def handle(self, *args, **kwargs):
        # Dummy data for teachers
        teachers = [
            {"name": "Dr. Smith", "subject": "Anatomy"},
            {"name": "Dr. Johnson", "subject": "Physiology"},
            {"name": "Dr. Brown", "subject": "Biochemistry"},
            {"name": "Dr. Lee", "subject": "Community Medicine"},
            {"name": "Dr. Wilson", "subject": "Pathology"},
        ]

        # Create teachers
        for teacher_data in teachers:
            Teacher.objects.get_or_create(**teacher_data)

        self.stdout.write(self.style.SUCCESS("Dummy data added successfully!"))
