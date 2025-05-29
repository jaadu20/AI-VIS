# interviews/admin.py
from django.contrib import admin
from .models import Interview, Question, Answer

@admin.register(Interview)
class InterviewAdmin(admin.ModelAdmin):
    list_display = ['id', 'application', 'status', 'total_score', 'started_at', 'completed_at']
    list_filter = ['status', 'started_at']
    search_fields = ['application__user__username', 'application__job__title']
    readonly_fields = ['id', 'created_at', 'updated_at']

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ['id', 'interview', 'difficulty', 'question_type', 'order']
    list_filter = ['difficulty', 'question_type']
    search_fields = ['text', 'interview__application__user__username']
    readonly_fields = ['id', 'created_at']

@admin.register(Answer)
class AnswerAdmin(admin.ModelAdmin):
    list_display = ['id', 'question', 'content_score', 'audio_score', 'video_score', 'overall_score']
    list_filter = ['content_score', 'created_at']
    search_fields = ['text', 'question__interview__application__user__username']
    readonly_fields = ['id', 'created_at']