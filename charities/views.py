from django.shortcuts import render, redirect
from django.contrib.auth import login, authenticate, get_user_model, logout
from django.contrib.auth.decorators import login_required, user_passes_test
from django.contrib import messages
from .forms import SignupForm
from .models import CustomUser, Charity, Post, Domain, Donation
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json
from django.core.serializers.json import DjangoJSONEncoder
import razorpay
from django.conf import settings

@login_required
def delete_account(request):
    if request.method == 'POST':
        user = request.user
        logout(request)
        user.delete()
        return redirect('home')  # or wherever you want to redirect

@csrf_exempt
def delete_charity(request, id):
    Charity.objects.filter(id=id).delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def delete_post(request, id):
    Post.objects.filter(id=id).delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def delete_user(request, id):
    CustomUser.objects.filter(id=id).delete()
    return JsonResponse({'status': 'success'})


@csrf_exempt
def edit_charity(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        charity = Charity.objects.get(id=id)
        charity.name = data['name']
        charity.contact = data['contact']
        charity.save()
        return JsonResponse({'status': 'updated'})

@csrf_exempt
def edit_post(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        post = Post.objects.get(id=id)
        post.title = data['title']
        post.description = data['description']
        post.save()
        return JsonResponse({'status': 'updated'})

@csrf_exempt
def edit_user(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = CustomUser.objects.get(id=id)
        user.username = data['username']
        user.email = data['email']
        user.contact = data['contact']
        user.save()
        return JsonResponse({'status': 'updated'})
    
@csrf_exempt
def delete_domain(request, id):
    Domain.objects.filter(id=id).delete()
    return JsonResponse({'status': 'success'})

@csrf_exempt
def edit_domain(request, id):
    if request.method == 'POST':
        data = json.loads(request.body)
        domain = Domain.objects.get(id=id)
        domain.name = data['name']
        domain.save()
        return JsonResponse({'status': 'updated'})

@csrf_exempt
def add_domain(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        domain = Domain(name=data['name'])
        domain.save()
        return JsonResponse({'status': 'added', 'id': domain.id})

@csrf_exempt
def add_charity(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        domain = Domain.objects.get(name=data['domain'])  # assuming domain sent as name
        charity = Charity.objects.create(
            name=data['name'],
            contact=data['contact'],
            domain=domain
        )
        return JsonResponse({'status': 'added', 'id': charity.id})

@csrf_exempt
def add_post(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        domain = Domain.objects.get(id=data['domain_id'])
        post = Post.objects.create(
            title=data['title'],
            description=data['description'],
            domain=domain
        )
        return JsonResponse({
            'status': 'success',
            'id': post.id,
            'domain_name': domain.name
        })

@csrf_exempt
def add_user(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        user = CustomUser.objects.create_user(
            username=data['username'],
            email=data['email'],
            contact=data['contact'],
            password=data['password']
        )
        return JsonResponse({'status': 'success', 'id': user.id})

User = get_user_model()

# ------------------------------
# Public Views
# ------------------------------
def home(request):
    return render(request, 'index.html')

def about(request):
    return render(request, 'about.html')

def domains_detail(request):
    # Get all domains for the dropdown
    domains = Domain.objects.all()

    # Get selected domain from query parameter
    selected_domain_name = request.GET.get('domain')
    selected_domain = Domain.objects.filter(name=selected_domain_name).first()

    # Fetch charities and posts for the selected domain
    charities = Charity.objects.filter(domain=selected_domain) if selected_domain else []
    posts = Post.objects.filter(domain=selected_domain) if selected_domain else []
    
    # Prepare charity data for the map - REMOVE 'email' field
    charity_locations = list(charities.filter(latitude__isnull=False, longitude__isnull=False).values(
        'name', 'location', 'latitude', 'longitude'  # Removed 'email' and 'contact'
    ))
    
    context = {
        'selected_domain': selected_domain,
        'domains': domains,
        'charities': charities,
        'posts': posts,
        'charity_locations_json': json.dumps(charity_locations, cls=DjangoJSONEncoder)
    }
    
    return render(request, 'domains_detail.html', context)

# ------------------------------
# User Authentication
# ------------------------------
def signup_view(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            messages.success(request, f"Signup successful! Welcome, {user.username}")
            print("✅ User created successfully:", user.username)
            return redirect('user_dashboard')
        else:
            messages.error(request, "Signup failed. Please correct the errors below.")
            print("❌ Signup failed. Errors:", form.errors)
    else:
        form = SignupForm()
    return render(request, 'signup.html', {'form': form})


def login_view(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            if user.is_admin:
                return redirect('admin_dashboard')
            else:
                return redirect('user_dashboard')
        else:
            messages.error(request, "Invalid username or password. Please try again.")
    return render(request, 'login.html')

# ------------------------------
# Dashboards
# ------------------------------
def dashboard(request):
    return render(request, 'user_dashboard.html')

@user_passes_test(lambda u: u.is_superuser)
def admin_dashboard(request):
    domains = Domain.objects.all()
    charities = Charity.objects.all()
    posts = Post.objects.all()
    users = CustomUser.objects.filter(is_superuser=False)
    return render(request, 'admin_dashboard.html', {
        'domains': domains,
        'charities': charities,
        'posts': posts,
        'users': users,
    })
   
@login_required
def user_dashboard(request):
    domains = Domain.objects.all()
    return render(request, 'user_dashboard.html', {'domains': domains})


@login_required
def donation_list(request):
    donations = Donation.objects.filter(user=request.user).order_by('-date')
    return render(request, 'donations/donation_list.html', {'donations': donations})

@login_required
def create_donation(request):
    if request.method == 'POST':
        charity_id = request.POST.get('charity')
        amount = request.POST.get('amount')
        charity = Charity.objects.get(id=charity_id)
        donation = Donation.objects.create(
            user=request.user,
            charity=charity,
            amount=amount,
            status='pending'
        )
        return redirect('donation_list')
    charities = Charity.objects.all()
    return render(request, 'donations/create_donation.html', {'charities': charities})
from django.db.models import Sum, Count, Avg
from .models import Donation

from django.db.models import Sum, Avg
from .models import Donation

@login_required
def user_dashboard(request):
    user = request.user
    domains = Domain.objects.all()  # ✅ FETCH DOMAINS

    donations = Donation.objects.filter(user=user, status='successful')

    total_donated = donations.aggregate(Sum('amount'))['amount__sum'] or 0
    total_donations = donations.count()
    average_donation = donations.aggregate(Avg('amount'))['amount__avg'] or 0

    milestone_goal = 10000
    milestone_progress = int((total_donated / milestone_goal) * 100) if milestone_goal > 0 else 0
    milestone_progress = min(milestone_progress, 100)

    has_donations = donations.exists()

    context = {
        'donations': donations,
        'total_donated': total_donated,
        'total_donations': total_donations,
        'average_donation': round(average_donation, 2),
        'milestone_goal': milestone_goal,
        'milestone_progress': milestone_progress,
        'has_donations': has_donations,
        'domains': domains,  # ✅ ✅ ✅ IMPORTANT!
        'RAZORPAY_KEY_ID': settings.RAZORPAY_KEY_ID,
    }

    return render(request, 'user_dashboard.html', context)

def get_charities(request, domain_id):
    if request.method == 'GET':
        charities = Charity.objects.filter(domain_id=domain_id)
        data = list(charities.values('id', 'name'))
        return JsonResponse(data, safe=False)

@csrf_exempt
@login_required
def make_donation(request):
    if request.method == "POST":
        domain_id = request.POST.get("domain")
        charity_ids = request.POST.getlist("charities")
        amount = request.POST.get("amount")

        if not domain_id or not charity_ids or not amount:
            messages.error(request, "Please fill in all fields.")
            return redirect('user_dashboard')

        try:
            amount = float(amount)
            if amount <= 0:
                raise ValueError("Invalid amount")
        except ValueError:
            messages.error(request, "Please enter a valid amount.")
            return redirect('user_dashboard')

        domain = Domain.objects.filter(id=domain_id).first()

        for cid in charity_ids:
            charity = Charity.objects.filter(id=cid).first()
            if charity:
                Donation.objects.create(
                    user=request.user,
                    domain=domain,  # ✅ Save domain
                    charity=charity,
                    amount=amount,
                    status='successful'  # ✅ Correct status
                )

        messages.success(request, "Thank you for your donation!")
        return redirect('user_dashboard')

@csrf_exempt
@require_POST
def save_donation(request):
    if request.method == 'POST' and request.user.is_authenticated:
        data = json.loads(request.body)
        amount = data.get('amount')
        domain_id = data.get('domain_id')
        charity_id = data.get('charity_id')
        payment_method = data.get('payment_method')

        # Optional Razorpay values
        razorpay_payment_id = data.get('razorpay_payment_id')
        razorpay_order_id = data.get('razorpay_order_id')
        razorpay_signature = data.get('razorpay_signature')

        try:
            Donation.objects.create(
                user=request.user,
                amount=amount,
                domain_id=domain_id,
                charity_id=charity_id,
                status='successful',
                payment_method=payment_method,
                # Store razorpay details optionally if you add fields
            )
            return JsonResponse({'status': 'success'})
        except Exception as e:
            return JsonResponse({'status': 'error', 'message': str(e)})
    
@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        amount = data.get('amount')

        client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_SECRET_KEY))
        payment = client.order.create({'amount': int(amount), 'currency': 'INR', 'payment_capture': '1'})

        return JsonResponse({
            'order_id': payment['id'],
            'amount': payment['amount']
        })