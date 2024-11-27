from django.db import models

class Teacher(models.Model):
    name = models.CharField(max_length=100)
    subject = models.CharField(max_length=100)  # Optional: specify teacher's primary subject

    def __str__(self):
        return self.name

class Schedule(models.Model):
    subject = models.CharField(max_length=100)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    phase = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.subject} ({self.teacher.name}) - {self.start_time} to {self.end_time}"
