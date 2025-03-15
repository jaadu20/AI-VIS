from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils.translation import gettext_lazy as _

class CustomUserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError(_('The Email must be set'))
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save()
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)

class User(AbstractUser):
    ROLES = (
        ('student', 'Student'),
        ('company', 'Company'),
        ('admin', 'Admin'),
    )
    
    username = None
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(_('full name'), max_length=100)
    role = models.CharField(max_length=20, choices=ROLES, default='student')
    phone = models.CharField(max_length=20)
    company_name = models.CharField(max_length=100, blank=True, default='')
    company_address = models.TextField(blank=True, default='')

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = CustomUserManager()

    def __str__(self):
        return self.email