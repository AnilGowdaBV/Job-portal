# Company Profile Extension Migration

This project added new company profile fields to enrich the dashboard.

## New Columns (table: `companies`)
- logo_url VARCHAR(255)
- banner_url VARCHAR(255)
- website VARCHAR(255)
- linkedin_url VARCHAR(255)
- twitter_url VARCHAR(255)
- github_url VARCHAR(255)
- employees_count INT UNSIGNED
- founded_year INT
- industry VARCHAR(120)
- mission TEXT
- description TEXT
- location VARCHAR(160)
- hiring_focus VARCHAR(160)

If your database already had the `companies` table before this change, run the following SQL (adjust for any already existing columns):

```sql
ALTER TABLE companies
  ADD COLUMN logo_url VARCHAR(255) NULL,
  ADD COLUMN banner_url VARCHAR(255) NULL,
  ADD COLUMN website VARCHAR(255) NULL,
  ADD COLUMN linkedin_url VARCHAR(255) NULL,
  ADD COLUMN twitter_url VARCHAR(255) NULL,
  ADD COLUMN github_url VARCHAR(255) NULL,
  ADD COLUMN employees_count INT UNSIGNED NULL,
  ADD COLUMN founded_year INT NULL,
  ADD COLUMN industry VARCHAR(120) NULL,
  ADD COLUMN mission TEXT NULL,
  ADD COLUMN description TEXT NULL,
  ADD COLUMN location VARCHAR(160) NULL,
  ADD COLUMN hiring_focus VARCHAR(160) NULL;
```

You can omit any columns that already exist (the `ALTER` will fail if a column is duplicated).

## Using the New API Route
- GET `/api/company/profile` returns the authenticated company's profile
- PUT `/api/company/profile` accepts a JSON body with any of the new fields to update. Empty strings are stored as NULL.

Example update request:
```bash
curl -X PUT https://your-domain.com/api/company/profile \
  -H "Content-Type: application/json" \
  -H "Cookie: token=<your_auth_token_cookie>" \
  -d '{
    "logo_url": "https://cdn.example.com/logos/acme.png",
    "employees_count": 42,
    "founded_year": 2021,
    "industry": "AI Platform",
    "mission": "Accelerate human creativity with ambient intelligence.",
    "hiring_focus": "Senior Engineers, Product Designers"
  }'
```

## Dashboard Changes
Company users now see:
1. Company Profile section with logo, mission, team size, founded year, focus, and social links.
2. Edit button opens a modal to update fields (writes via PUT route).

## Notes
- Signup flow still creates only basic columns; extended columns remain NULL until edited.
- Validation: `founded_year` must be between 1800 and current year; `employees_count` 0–1,000,000.
- Empty string inputs become NULL to avoid meaningless blanks.

## Next Ideas
- Add analytics (views, applicants count per job).
- Add logo upload handling (current implementation expects a URL).
- Add company culture tags (new junction table).
