from django.shortcuts import render, redirect
from django.db import transaction
from django.contrib.auth.decorators import login_required


from rest_framework.decorators import api_view

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    return Response({"status": "ok"})
