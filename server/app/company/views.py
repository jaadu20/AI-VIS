from django.views.generic import CreateView, ListView, UpdateView
from django.contrib.auth.mixins import LoginRequiredMixin
from .models import JobPosting, CompanyProfile
from .forms import JobPostingForm
from django.urls import reverse_lazy

class CompanyCheckMixin:
    def dispatch(self, request, *args, **kwargs):
        if not hasattr(request.user, 'companyprofile'):
            return self.handle_no_permission()
        return super().dispatch(request, *args, **kwargs)

class PostJobView(LoginRequiredMixin, CompanyCheckMixin, CreateView):
    model = JobPosting
    form_class = JobPostingForm
    template_name = 'company/post_job.html'
    success_url = reverse_lazy('company_dashboard')

    def form_valid(self, form):
        form.instance.company = self.request.user.companyprofile
        return super().form_valid(form)

class CompanyDashboardView(LoginRequiredMixin, CompanyCheckMixin, ListView):
    model = JobPosting
    template_name = 'company/dashboard.html'
    context_object_name = 'job_postings'

    def get_queryset(self):
        return JobPosting.objects.filter(company=self.request.user.companyprofile)

class EditJobView(LoginRequiredMixin, CompanyCheckMixin, UpdateView):
    model = JobPosting
    form_class = JobPostingForm
    template_name = 'company/edit_job.html'
    success_url = reverse_lazy('company_dashboard')