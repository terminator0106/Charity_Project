import pandas as pd
from django.core.management.base import BaseCommand
from charities.models import Domain, Charity, Post
from django.utils import timezone

class Command(BaseCommand):
    help = 'Import data from Excel sheets'

    def handle(self, *args, **kwargs):
        file_path = "Charity_Data.xlsx"

        try:
            xls = pd.ExcelFile(file_path)

            # ========== 1. Domains ==========
            domains_df = pd.read_excel(xls, sheet_name=0)
            domains_df.columns = domains_df.columns.str.lower().str.strip()

            for _, row in domains_df.iterrows():
                name = str(row['name']).strip()
                description = str(row.get('description', '')).strip()
                image = row.get('image', '').strip() if pd.notna(row.get('image')) else ''

                Domain.objects.get_or_create(
                    name=name,
                    defaults={
                        'description': description,
                        'image': image
                    }
                )

            self.stdout.write(self.style.SUCCESS("✅ Domains imported/updated."))

            # ========== 2. Charities ==========
            charities_df = pd.read_excel(xls, sheet_name=1)
            charities_df.columns = charities_df.columns.str.lower().str.strip()

            for _, row in charities_df.iterrows():
                domain_name = str(row['domain']).strip().lower()
                domain_obj = Domain.objects.filter(name__iexact=domain_name).first()

                if not domain_obj:
                    self.stdout.write(self.style.WARNING(f"⚠️ Domain '{domain_name}' not found for charity '{row['name']}'"))
                    continue

                charity_name = str(row['name']).strip().lower()
                location = str(row.get('location', '')).strip()

                # ✅ Check to prevent duplicate charities
                if not Charity.objects.filter(name=charity_name, domain=domain_obj, location=location).exists():
                    Charity.objects.create(
                        name=charity_name,
                        domain=domain_obj,
                        description=str(row.get('description', '')).strip(),
                        location=location,
                        contact=str(row.get('contact', '')).strip(),
                        latitude=row.get('latitude'),
                        longitude=row.get('longitude'),
                        image=row.get('image', '').strip() if pd.notna(row.get('image')) else ''
                    )
                else:
                    self.stdout.write(self.style.WARNING(f"⚠️ Duplicate charity skipped: {charity_name} in {domain_name}"))

            self.stdout.write(self.style.SUCCESS("✅ Charities imported (no duplicates)."))

            # ========== 3. Posts ==========
            posts_df = pd.read_excel(xls, sheet_name=2)
            posts_df.columns = posts_df.columns.str.lower().str.strip()

            for _, row in posts_df.iterrows():
                domain_name = str(row['domain']).strip()
                domain_obj = Domain.objects.filter(name__iexact=domain_name).first()

                if not domain_obj:
                    self.stdout.write(self.style.WARNING(f"⚠️ Domain '{domain_name}' not found for post '{row['title']}'"))
                    continue

                title = str(row['title']).strip()
                content = str(row.get('content', '')).strip()
                image = row.get('image', '').strip() if pd.notna(row.get('image')) else ''
                created_date = row.get('created_date', timezone.now())

                Post.objects.update_or_create(
                    title=title,
                    domain=domain_obj,
                    defaults={
                        'content': content,
                        'image': image,
                        'created_date': created_date
                    }
                )

            self.stdout.write(self.style.SUCCESS("✅ Posts imported/updated (no duplicates)."))

        except Exception as e:
            self.stderr.write(self.style.ERROR(f"❌ Error: {e}"))
