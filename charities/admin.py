from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Charity, CustomUser

# Register Charity Model
admin.site.register(Charity)

# Register CustomUser Model with Custom Admin Configuration
@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'contact_number', 'is_admin', 'is_staff', 'is_superuser')
    search_fields = ('username', 'email', 'contact_number')
    list_filter = ('is_admin', 'is_staff', 'is_superuser')
    fieldsets = (
        (None, {'fields': ('username', 'email', 'contact_number', 'password')}),
        ('Permissions', {'fields': ('is_admin', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'contact_number', 'password1', 'password2'),
        }),
    )
    ordering = ('username',)