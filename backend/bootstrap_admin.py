
import os
from django.contrib.auth import get_user_model

username = os.environ.get("BOOTSTRAP_ADMIN_USERNAME")
password = os.environ.get("BOOTSTRAP_ADMIN_PASSWORD")

if not username or not password:
    raise RuntimeError("Bootstrap admin environment variables are missing.")

User = get_user_model()
user, created = User.objects.get_or_create(username=username)

user.is_active = True
user.is_staff = True
user.is_superuser = True
user.role = "admin"
user.set_password(password)
user.save()

print("Bootstrap admin ready.")
