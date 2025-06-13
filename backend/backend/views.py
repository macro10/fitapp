from django.views.generic import TemplateView

class FrontendAppView(TemplateView):
    template_name = "index.html"