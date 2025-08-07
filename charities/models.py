from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError

# ----------------------------
# Domain Model
# ----------------------------
class Domain(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField()
    image = models.URLField(blank=True, null=True)  # Changed from ImageField to URLField
    created_on = models.DateField(auto_now_add=True)

    def __str__(self):
        return self.name

# ----------------------------
# Charity Model
# ----------------------------
class Charity(models.Model):
    name = models.CharField(max_length=100)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    description = models.TextField()
    location = models.CharField(max_length=255, default="Not Available")
    contact = models.CharField(max_length=20)
    email = models.EmailField(null = True)  # ✅ NEW field
    latitude = models.FloatField()
    longitude = models.FloatField()
    image = models.CharField(max_length=255, blank=True, null=True)  # ✅ Using CharField for filename/url

    class Meta:
        unique_together = ('name', 'domain', 'location')

    def __str__(self):
        return self.name

# ----------------------------
# Post Model
# ----------------------------
class Post(models.Model):
    title = models.CharField(max_length=200)
    content = models.TextField()
    image = models.URLField(blank=True, null=True)  # for image URL
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    created_date = models.DateTimeField(auto_now_add=True)
    url = models.URLField(blank=True, null=True)  # ✅ Add this

    def __str__(self):
        return self.title


# ----------------------------
# Custom User Model
# ----------------------------
class CustomUser(AbstractUser):
    email = models.EmailField(unique=True)
    contact_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username

from django.db import models
from django.core.exceptions import ValidationError
from .models import CustomUser, Domain, Charity  # adjust the import if needed

class Donation(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, null=True)
    charity = models.ForeignKey(Charity, on_delete=models.CASCADE, null=True)

    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateTimeField(auto_now_add=True)

    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('successful', 'Successful'),
        ('failed', 'Failed'),
    ]
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')

    PAYMENT_CHOICES = [
        ('upi', 'UPI'),
        ('bank', 'Bank Transfer'),
        ('card', 'Credit/Debit Card'),
    ]
    payment_method = models.CharField(
        max_length=10, choices=PAYMENT_CHOICES, null=True, blank=True
    )  # ✅ NEW

    def __str__(self):
        return f"{self.user.username} donated ₹{self.amount} to {self.charity.name}"

    def clean_amount(self):
        if self.amount <= 0:
            raise ValidationError('Donation amount must be greater than zero.')
        return self.amount

