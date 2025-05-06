# # job_applications/validators.py
# from django.core.exceptions import ValidationError

# def validate_file_size(value):
#     filesize = value.size
#     max_size = 5 * 1024 * 1024  # 5MB
#     if filesize > max_size:
#         raise ValidationError("File size must be under 5MB")