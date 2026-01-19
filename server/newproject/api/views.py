from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from datetime import datetime
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear


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
    elif request.method == 'PUT':
        data = request.data
        serializer = ActionSerializer(action, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
  
@api_view(["GET"])
def points_timeseries(request):
    start = request.query_params.get("start")  # YYYY-MM-DD
    end = request.query_params.get("end")      # YYYY-MM-DD
    group = request.query_params.get("group", "day")  # day|month|year

    trunc_map = {
        "day": TruncDay("date"),
        "month": TruncMonth("date"),
        "year": TruncYear("date"),
    }
    if group not in trunc_map:
        return Response(
            {"detail": "Invalid group. Use day, month, or year."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    
    qs = Action.objects.all()

    # Apply date filtering if provided
    # (DateField comparisons are fine with YYYY-MM-DD strings, but we validate for safety)
    try:
        if start:
            datetime.strptime(start, "%Y-%m-%d")
            qs = qs.filter(date__gte=start)
        if end:
            datetime.strptime(end, "%Y-%m-%d")
            qs = qs.filter(date__lte=end)
    except ValueError:
        return Response(
            {"detail": "Invalid date format. Use YYYY-MM-DD for start/end."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    qs = (
        qs.annotate(period=trunc_map[group])
          .values("period")
          .annotate(total_points=Sum("points"))
          .order_by("period")
    )

    # Serialize to friendly strings for x-axis
    out = []
    for row in qs:
        p = row["period"]  # a date/datetime object
        if group == "day":
            label = p.strftime("%Y-%m-%d")
        elif group == "month":
            label = p.strftime("%Y-%m")
        else:
            label = p.strftime("%Y")

        out.append({"period": label, "total_points": row["total_points"] or 0})

    return Response(out, status=status.HTTP_200_OK)