from django.db import models

"""
Action Model
------------
Represents one sustainability action entry.

Fields:
- action (str): Short description of the activity (e.g., "Recycling")
- date (date): The date the action was performed
- points (int): Number of sustainability points awarded for the action
"""

class Action(models.Model):
    action = models.CharField(max_length= 50)
    date = models.DateField()
    points = models.IntegerField(default = 0)

    def __str__(self):
        return self.actionTitle

