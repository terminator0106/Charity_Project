from django.shortcuts import render

def home(request):
    return render(request, "index.html")  # Django will now look in charity_project/templates/


