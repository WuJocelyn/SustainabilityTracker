from django.urls import path
from .views import get_actions, create_action, action_detail, points_timeseries, home

urlpatterns = [
    path('', home, name = "home" ),
    path('api/actions/', get_actions, name = "get_actions" ),
    path('api/actions/create/', create_action, name = "create_action" ),
    path('api/actions/<int:pk>/', action_detail, name='action_detail'),
    path("api/actions/points_timeseries/", points_timeseries, name="points_timeseries"),

]