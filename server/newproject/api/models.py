from django.db import models



class Action(models.Model):
    action = models.CharField(max_length= 50)
    date = models.DateField()
    points = models.IntegerField(default = 0)

    def __str__(self):
        return self.actionTitle

