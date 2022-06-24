from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import Group

from import_export.admin import ImportExportMixin

from .models import User, Task, Subtask, Tag, Extra


class UserCreationForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ('email',)

    def save(self, commit=True):
        user = super(UserCreationForm, self).save(commit=False)
        user.set_password(self.cleaned_data['password'])
        if commit:
            user.save()
        return user


@admin.register(User)
class UserAdmin(ImportExportMixin, UserAdmin):
    add_form = UserCreationForm
    list_display = ('email', 'name', 'is_staff',)
    ordering = ('email',)
    search_fields = ('email',)
    fieldsets = (
        (None, {
            'fields': (
                'email', 'password', 'name', 'image', 'premium', 'is_staff',)
        }),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password')}
         ),
    )


@admin.register(Task)
class TaskAdmin(ImportExportMixin, admin.ModelAdmin):
    list_display = ('date', 'owner', 'title', 'description', 'priority', 'reminder', 'done',)
    ordering = ('owner', 'date')
    search_fields = ('owner', 'title',)

    def get_form(self, request, obj=None, **kwargs):
        kwargs['widgets'] = {'description': forms.Textarea(attrs={'rows': 5, 'cols': 100})}
        return super().get_form(request, obj, **kwargs)


@admin.register(Subtask)
class SubtaskAdmin(ImportExportMixin, admin.ModelAdmin):
    list_display = ('owner', 'task', 'title', 'done',)
    ordering = ('task__owner__email', 'task', 'title',)
    search_fields = ('task__owner__email', 'task', 'title',)

    def owner(self, obj):
        return obj.task.owner


@admin.register(Tag)
class TagAdmin(ImportExportMixin, admin.ModelAdmin):
    list_display = ('owner', 'task', 'title',)
    ordering = ('task__owner__email', 'task', 'title',)
    search_fields = ('task__owner__email', 'task', 'title',)

    def owner(self, obj):
        return obj.task.owner


@admin.register(Extra)
class ExtraAdmin(ImportExportMixin, admin.ModelAdmin):
    list_display = ('owner', 'task', 'information',)
    ordering = ('task__owner__email', 'task', 'information',)
    search_fields = ('task__owner__email', 'task', 'information',)

    def owner(self, obj):
        return obj.task.owner


admin.site.unregister(Group)
