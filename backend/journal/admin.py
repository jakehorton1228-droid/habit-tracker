from django.contrib import admin
from .models import JournalEntry

@admin.register(JournalEntry)
class JournalEntryAdmin(admin.ModelAdmin):
    list_display = ['user', 'date', 'time', 'mood', 'entry_type']
    list_filter = ['mood', 'entry_type', 'date']
    search_fields = ['user__username', 'content']
