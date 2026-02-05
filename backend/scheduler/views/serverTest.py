from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

@api_view(["GET"])
def health(request):
    permission_classes = [AllowAny]

    return Response({"status": "ok"})
