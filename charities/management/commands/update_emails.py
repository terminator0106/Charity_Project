import os
import sys
import django
import pandas as pd

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))  # 👈 Important
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "charity_project.settings")
django.setup()

from charities.models import Domain, Charity  # 👈 Replace with your actual app name

# Path to the Excel file
excel_path = "Charity_Data.xlsx"  # Update with the correct path if needed

# Read the Excel sheet
xls = pd.ExcelFile(excel_path)
charities_df = pd.read_excel(xls, sheet_name=1)
charities_df.columns = charities_df.columns.str.lower().str.strip()

updated_count = 0
not_found_count = 0

for _, row in charities_df.iterrows():
    domain_name = str(row['domain']).strip().lower()
    charity_name = str(row['name']).strip().lower()
    location = str(row.get('location', '')).strip()

    # Find domain
    domain_obj = Domain.objects.filter(name__iexact=domain_name).first()
    if not domain_obj:
        print(f"⚠️ Domain not found: {domain_name}")
        continue

    # Find existing charity by name + domain + location
    charity_obj = Charity.objects.filter(
        name=charity_name,
        domain=domain_obj,
        location=location
    ).first()

    if charity_obj:
        email = str(row.get('email', '')).strip()
        if email:
            charity_obj.email = email
            charity_obj.save()
            updated_count += 1
    else:
        not_found_count += 1
        print(f"❌ Charity not found for update: {charity_name} | {domain_name} | {location}")

print(f"\n✅ Emails updated for {updated_count} charities.")
print(f"⚠️ Charities not found: {not_found_count}")
