from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .models import Action
from .serializer import ActionSerializer

@api_view(["GET"])
def get_actions(request):
    actions = Action.objects.all() #variable actions - Python Model
    actions_serialized = ActionSerializer(actions, many = True).data #now a JSON
    return Response(actions_serialized)


@api_view(["POST"])
def create_action(request):  #request --> body of data (JSON)
    data = request.data #JSON format --> python dictionary
    data_serialized = ActionSerializer(data=data) #converted into serializer object
    if data_serialized.is_valid(): #whenever frontend sends you data, you have to make sure valid data
        data_serialized.save() #creates a Django model instance
        return Response(data_serialized.data, status = status.HTTP_201_CREATED) #so basically returns a python dict (but frontend sees it as JSON)
    return Response(data_serialized.errors, status = status.HTTP_400_BAD_REQUEST)


@api_view(['PUT', 'DELETE'])
def action_detail(request, pk):
    try:
        action = Action.objects.get(pk=pk)
    except Action.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'DELETE':
        action.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
  
