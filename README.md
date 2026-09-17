# SSDI Campaigns

Independent Social Security Disability Insurance education and intake site. Helps people understand eligibility, applications, denials, and appeals — and connect with a campaign advisor.

**Not affiliated with, endorsed by, or authorized by the U.S. Social Security Administration.** Anyone can apply for SSDI at no charge at [SSA.gov](https://www.ssa.gov/applyfordisability/).

Live domain (planned): [ssdicampaigns.com](https://ssdicampaigns.com)

## What’s in this repo

- Multi-page campaign site (eligibility, application, denials, appeals, hearings, Blue Book, SSDI vs SSI, work credits, 50-state pages)
- TCPA-compliant screening form (E-SIGN + prior express written consent copy)
- SEO: JSON-LD, sitemap, robots, `llms.txt` / `ai.txt`
- Legal pages: privacy, terms, disclaimer, SMS terms, cookies, accessibility, do-not-sell, privacy request
- DigitalOcean App Platform spec (`.do/app.yaml`) + production `Dockerfile`
- Optional HubSpot intake stub in `backend/` (not wired until a private-app token is set)

## Stack

React 19 · TanStack Start/Router · Tailwind v4 · Zustand · Zod

## Local development

```bash
npm install
npm run dev
```

The app binds to `0.0.0.0:8080`.

```bash
npm run build
npm run typecheck
```

## Intake / CRM

The public form currently validates on the server and returns success without persisting records. To wire HubSpot:

1. Create a HubSpot private app with `crm.objects.contacts.write`
2. Set `HUBSPOT_ACCESS_TOKEN` (never commit it)
3. See `backend/README.md` for the field map and TCPA retention notes

Do not send health narratives to advertising properties.

## Deploy (DigitalOcean)

App spec is in [`.do/app.yaml`](.do/app.yaml). Frontend is the Docker web service; `backend/` is a separate Node component on port 8787.

## Disclaimer

This site is an independent campaign. It is not a law firm, does not provide legal advice, and is not affiliated with SSA, CMS, or HHS.
