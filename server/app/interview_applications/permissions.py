# from rest_framework.permissions import BasePermission, SAFE_METHODS

# class IsCandidateUser(BasePermission):
#     def has_permission(self, request, view):
#         return request.user.is_authenticated and request.user.role == 'candidate'

# class IsCompanyOrCandidateOwner(BasePermission):
#     def has_object_permission(self, request, view, obj):
#         # Check if user is owner of the application
#         if hasattr(obj, 'candidate'):
#             if request.user.id == obj.candidate.id:
#                 return True
                
#         # Check if user is company owner of the job
#         if hasattr(obj, 'job') and hasattr(obj.job, 'company'):
#             if request.user.id == obj.job.company.id:
#                 return True
                
#         return False