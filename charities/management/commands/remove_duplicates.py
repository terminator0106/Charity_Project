from django.core.management.base import BaseCommand
from charities.models import Domain, Charity, Post
from django.db.models import Count


class Command(BaseCommand):
    help = "Remove duplicate entries from Domain, Charity, and Post models"

    def handle(self, *args, **kwargs):
        self.remove_duplicate_domains()
        self.remove_duplicate_charities()
        self.remove_duplicate_posts()

    def remove_duplicate_domains(self):
        self.stdout.write("🧹 Checking for duplicate Domains...")
        seen = set()
        for domain in Domain.objects.order_by('id'):
            if domain.name in seen:
                domain.delete()
                self.stdout.write(self.style.WARNING(f"🗑 Deleted duplicate domain: {domain.name}"))
            else:
                seen.add(domain.name)
        self.stdout.write(self.style.SUCCESS("✅ Duplicate Domains removed."))

    def remove_duplicate_charities(self):
        self.stdout.write("🧹 Checking for duplicate Charities...")
        seen = set()
        for charity in Charity.objects.order_by('id'):
            key = (charity.name.strip().lower(), charity.domain.id)
            if key in seen:
                charity.delete()
                self.stdout.write(self.style.WARNING(f"🗑 Deleted duplicate charity: {charity.name}"))
            else:
                seen.add(key)
        self.stdout.write(self.style.SUCCESS("✅ Duplicate Charities removed."))

    def remove_duplicate_posts(self):
        self.stdout.write("🧹 Checking for duplicate Posts...")
        seen = set()
        for post in Post.objects.order_by('id'):
            key = (post.title.strip().lower(), post.domain.id)
            if key in seen:
                post.delete()
                self.stdout.write(self.style.WARNING(f"🗑 Deleted duplicate post: {post.title}"))
            else:
                seen.add(key)
        self.stdout.write(self.style.SUCCESS("✅ Duplicate Posts removed."))
