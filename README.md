# Stress-Free Auto Care — Careers & Hiring Platform

A self-hosted careers site and applicant-tracking system (ATS) for **Stress-Free Auto Care**, a multi-location auto-repair chain across California and Texas. Candidates browse and apply to roles; managers post jobs and move applicants through a hiring pipeline scoped to their place in the org chart.

Built with **Next.js 16, React 19, TypeScript, Tailwind CSS v4, and Prisma 7 (SQLite)**. Runs entirely locally — no external services required.

---

## Features

### Candidate site
- Job board with keyword search and filters (department, location, metro radius, remote, level, type), sorting, pagination, and a map view
- SEO-ready job detail pages with Google-for-Jobs (`JobPosting`) structured data, plus per-shop location pages and a sitemap
- Two application flows — **quick apply** (hourly / trades) and **full apply** (management) — with resume upload, dynamic screening questions, and a voluntary EEO step
- Culture, benefits, growth/training, and testimonials pages; "check my application status" by email

### Admin / ATS
- Email + password auth with **role-scoped, cascading visibility**: Corporate → Regional → District → General Manager. Managers only see the jobs and applicants for their region / district / shop.
- Dashboard KPIs + charts, job & template management, applicant **pipeline** (kanban + list), internal notes, stage changes with an audit trail, organization & content management, and an email "outbox".

### Foundations
- **WCAG 2.1 AA** accessibility, verified with automated axe scans
- **Recruitment compliance**: required pay ranges on every posting, EEO self-ID stored separately and never shown to hiring managers, consent capture, privacy & accessibility pages
- **Security**: object-level authorization scoped to the org tree, CSP + security headers, hashed passwords, login throttling

---

## Tech stack

| Area | Choice |
|---|---|
| Framework | Next.js 16 (App Router) · React 19 · TypeScript (strict) |
| Styling | Tailwind CSS v4 · shadcn-style UI on Radix |
| Data | Prisma 7 · SQLite (libsql adapter) |
| Auth | jose (signed JWT cookie) · bcryptjs |
| Charts / Maps | Recharts · Leaflet + OpenStreetMap |
| Testing | Vitest · Playwright · axe-core |

---

## Getting started

Requirements: **Node 20.19+** (22 / 24 / 25 also fine) and **pnpm 10+**.

```bash
# 1. Install dependencies (also generates the Prisma client)
pnpm install

# 2. Create your env file
cp .env.example .env

# 3. Create the SQLite database and seed demo data
pnpm prisma migrate dev
pnpm seed

# 4. Start the dev server
pnpm dev
```

Then open **http://localhost:3000**.

### Demo logins

The admin portal lives at **/login**. Password for every account: `demo1234`.

| Email | Role | Sees |
|---|---|---|
| `corporate@stressfree.test` | Corporate / HR | All shops |
| `regional@stressfree.test` | Regional Manager | One region |
| `district@stressfree.test` | District Manager | 3–5 shops |
| `gm@stressfree.test` | General Manager | A single shop |

Seed data includes ~30 shops, ~60 open jobs, and ~40 applications spread across pipeline stages.

---

## Scripts

```bash
pnpm dev          # start the dev server
pnpm build        # production build
pnpm typecheck    # tsc --noEmit
pnpm test         # Vitest unit tests
pnpm test:e2e     # Playwright e2e + accessibility
pnpm db:reset     # reset and reseed the database
```

---

## Project structure

```
src/
  app/(public)/   Candidate-facing pages (home, jobs, apply, marketing)
  app/admin/      Admin / ATS pages (auth-gated, role-scoped)
  app/api/        Route handlers (e.g. auth-gated resume download)
  components/     UI primitives, site chrome, feature components
  lib/            db, auth, rbac, email, constants, utils
prisma/           schema, migrations, seed
tests/            unit + e2e (Playwright + axe)
```

---

## Notes

This is a **demo build**: data is local SQLite (seeded), emails are recorded to an in-app outbox rather than actually sent, and the fonts are open substitutes for the brand's licensed faces. Set a strong `AUTH_SECRET` and review the Content-Security-Policy before any real deployment.
