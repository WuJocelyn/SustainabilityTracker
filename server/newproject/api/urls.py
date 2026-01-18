from django.urls import path
from .views import get_actions, create_action, action_detail

urlpatterns = [
    path('actions/', get_actions, name = "get_actions" ),
    path('actions/create/', create_action, name = "create_action" ),
    path('actions/<int:pk>/', action_detail, name='action_detail')
    
]