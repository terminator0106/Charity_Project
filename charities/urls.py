from django.urls import path
from . import views
from .views import signup_view, login_view
from django.contrib.auth import views as auth_views
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.shortcuts import render
from .views import create_order


urlpatterns = [
    path('', views.home, name='home'),
    path('about/', views.about, name='about'),
    path('login/', views.login_view, name='login'),
    path('user_dashboard/', views.dashboard, name='user_dashboard'),
    path('admin-dashboard/', views.admin_dashboard, name='admin_dashboard'),
    path('domains-detail/', views.domains_detail, name='domains_detail'),
    path('signup/', signup_view, name='signup'),
    path('login/', login_view, name='login'),
    path('logout/', auth_views.LogoutView.as_view(next_page='home'), name='logout'),
    path('delete-account/', views.delete_account, name='delete_account'),

    #Domain section
    path('edit/domain/<int:id>/', views.edit_domain, name='edit_domain'),
    path('delete/domain/<int:id>/', views.delete_domain, name='delete_domain'),
    path('add/domain/', views.add_domain, name='add_domain'),

    #Charity Section
    path('edit/charity/<int:id>/', views.edit_charity, name='edit_charity'),
    path('delete/charity/<int:id>/', views.delete_charity, name='delete_charity'),
    path('add/charity/', views.add_charity, name='add_charity'),

    #Post Section
    path('edit/post/<int:id>/', views.edit_post, name='edit_post'),
    path('delete/post/<int:id>/', views.delete_post, name='delete_post'),
    path('add/post/', views.add_post, name='add_post'),

    #User Section
    path('edit/user/<int:id>/', views.edit_user, name='edit_user'),
    path('delete/user/<int:id>/', views.delete_user, name='delete_user'),
    path('add/user/', views.add_user, name='add_user'),

    # charities/urls.py
    path('dashboard/', views.user_dashboard, name='user_dashboard'),
    
    path('donations/create/', views.create_donation, name='create_donation'),
    path('user_dashboard/get-charities/<int:domain_id>/', views.get_charities, name='get_charities'),
    path('make-donation/', views.make_donation, name='make_donation'),
    path('domains/', views.domains_detail, name='domains_detail'),
    path('user_dashboard/save-donation/', views.save_donation, name='save_donation'),
    path('user_dashboard/create-order/', create_order, name='create_order'),   
]