# NeedToSolution

A platform where communities post real problems for students and organizations to solve.

- Community members submit problems.
- Students form teams around real challenges.
- Organizations provide funding, mentorship, or resources.
- Contributors earn verified project experience.

Instead of asking people to search for opportunities, the platform generates opportunities from problems that need solving.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's inside

| Route | Purpose |
| --- | --- |
| `/` | Landing page: how it works, the village health example, what's distinctive, live problems, role CTAs |
| `/problems` | Browse and filter problems (search, category, status, urgency, open roles) |
| `/problems/[id]` | Problem detail: team formation, joining roles, pledges, milestones, updates, completion |
| `/submit` | Community members publish a problem |
| `/teams` | Teams recruiting for open roles |
| `/organizations` | Ways to support, projects needing backing, partner wall |
| `/dashboard` | Role-specific dashboard (community, student, organization) |
| `/contributors/[id]` | Public profile with verified credentials |
| `/verify/[id]` | Public credential verification |
| `/how-it-works` | Full guide for each role |

## How the data works

There is no backend. `lib/store.tsx` holds the whole platform state in a React reducer, seeded from `lib/seed.ts`, and persists it to `localStorage` under a versioned key. Sign in with a demo account (user menu → "Try a demo account") or create a new one. "Reset demo data" in the user menu restores the seed.

Project lifecycle: `open` → `forming` (first team created) → `in-progress` (team lead starts) → `completed` (lead, submitter or a supporting org marks complete). Completion issues a verified credential to every team member, recording the role, skills, hours and the verifying organization.

## Stack

Next.js 16 (App Router, Cache Components), React 19, Tailwind CSS v4, lucide-react. No other runtime dependencies.
