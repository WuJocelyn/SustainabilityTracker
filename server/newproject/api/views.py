from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from datetime import datetime
from django.db.models import Sum
from django.db.models.functions import TruncDay, TruncMonth, TruncYear
from django.shortcuts import render


from .models import Action
from .serializer import ActionSerializer

"""
views.py
--------
Defines the API endpoints for the Sustainability Tracker backend 

- CRUD:
  • GET    /api/actions/              -> list all actions
  • POST   /api/actions/create/       -> create a new action
  • PUT    /api/actions/<pk>/         -> update an existing action
  • DELETE /api/actions/<pk>/         -> delete an action
- Data Analytics:
  • GET /api/actions/points-timeseries/ -> Retrieve total points over a given time period (by day, month, or year)

"""


@api_view(["GET"])
def get_actions(request):
    actions = Action.objects.all() 
    actions_serialized = ActionSerializer(actions, many = True).data 
    return Response(actions_serialized)

"""
    POST /api/actions/create/
    Creates a new Action from JSON in the request body.
    -------------------------

    Expected payload:
      {
        "action": "Recycling",
        "date": "2025-01-08",
        "points": 25
      }

    Response:
    - 201 CREATED with the created object on success
    - 400 BAD REQUEST with validation errors on failure
"""
    
@api_view(["POST"])
def create_action(request):
    data = request.data 
    data_serialized = ActionSerializer(data=data) 
    if data_serialized.is_valid():
        data_serialized.save() 
        return Response(data_serialized.data, status = status.HTTP_201_CREATED) 
    return Response(data_serialized.errors, status = status.HTTP_400_BAD_REQUEST)

"""
    PUT /api/actions/<pk>/
    DELETE /api/actions/<pk>/
    Handles operations on a single Action row identified by primary key.
    -------------------------
    
    Params: pk (int): primary key captured from the URL

    Responses:
    - 404 NOT FOUND if the record does not exist
    - DELETE:
        • 204 NO CONTENT on successful deletion
    - PUT:
        • 200 OK with updated object on success
        • 400 BAD REQUEST with validation errors on failure
    
"""
@api_view(['PUT', 'DELETE'])
def action_detail(request, pk):
    try:
        action = Action.objects.get(pk=pk)     # Attempt to fetch the correct row
    except Action.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND) 

    # DELETE: remove the row from the database
    if request.method == 'DELETE': 
        action.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    # PUT: replace/update the row with new field values from request.data
    elif request.method == 'PUT':
        data = request.data
        serializer = ActionSerializer(action, data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)    
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

"""
    GET /api/actions/points-timeseries/
    Returns aggregated total points by time period for charting.
    --------------------------------

    Query params:
    - group: "day" (default), "month", or "year"
    - start: optional lower-bound date filter
    - end: optional upper-bound date filter

    Output format:
      [
        { "period": "2025-01-01", "total_points": 40 },
        { "period": "2025-01-02", "total_points": 55 },
        ...
      ]

    """

@api_view(["GET"])
def points_timeseries(request):
    start = request.query_params.get("start")  
    end = request.query_params.get("end")     
    group = request.query_params.get("group", "day") 

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
    
    
    qs = Action.objects.all()  # Start with all Action rows; Will later filter by date range

    # Apply date filtering if provided
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
        qs.annotate(period=trunc_map[group])   # Build the aggregation query:
          .values("period")
          .annotate(total_points=Sum("points"))
          .order_by("period")
    )

    # Serialize for x-axis
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

    return Response(out, status=status.HTTP_200_OK)  # Return aggregated series for Plotly chart

# Home screen for the backend SustainabilityTracker server
def home(request):
    return render(request, "home.html")