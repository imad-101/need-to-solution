# NeedToSolution

A platform where communities post real problems for students and organizations to solve.

- Anyone with an account submits a problem. It lands in the admin review queue.
- An administrator approves it. Only then does it appear publicly.
- Students form teams around approved problems. Organizations pledge funding, mentorship or resources.
- When a project is marked complete, every team member receives a certificate with a serial number (`NTS-XXXX-XXXX`) that anyone can verify at `/verify/<serial>`.

Instead of asking people to search for opportunities, the platform generates opportunities from problems that need solving.

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root (it is gitignored):

   ```bash
   DATABASE_URL="postgresql://…"        # Neon Postgres connection string
   ADMIN_EMAIL="admin@needtosolution.org"
   ADMIN_PASSWORD="choose-a-strong-password"
   DEMO_PASSWORD="demo1234"             # password for the seeded demo accounts
   ```

3. Create the tables and load the demo data:

   ```bash
   npm run db:push    # creates/updates tables from lib/db/schema.ts
   npm run db:seed    # demo users, problems, teams, pledges, certificates + the admin account
   ```

4. Run it:

   ```bash
   npm run dev
   ```

Open http://localhost:3000.

## Accounts

| Role          | Email                          | Password          |
| ------------- | ------------------------------ | ----------------- |
| Administrator | value of `ADMIN_EMAIL`         | `ADMIN_PASSWORD`  |
| Student       | `dev@needtosolution.demo`      | `DEMO_PASSWORD`   |
| Community     | `amina@needtosolution.demo`    | `DEMO_PASSWORD`   |
| Organization  | `hope@needtosolution.demo`     | `DEMO_PASSWORD`   |

Every seeded user has the email `<id>@needtosolution.demo` (for example `sara@`, `tomas@`, `civic@`).

## The pipeline

1. **Submit** at `/submit` (any signed-in account). The problem is stored with `review_status = pending`. Only the submitter and admins can see it.
2. **Review** at `/admin` (admin accounts only). Approve or decline, optionally with a note. The submitter sees the decision and note on `/dashboard`.
3. **Work**. Approved problems are public. Students form teams, organizations pledge, teams track milestones and post updates. The team lead starts the project; the lead, submitter or a supporting organization marks it complete.
4. **Certify**. Completion issues one certificate per team member. Students see completed, ongoing and available projects on their dashboard, with each certificate's serial number.
5. **Verify** at `/verify/<serial>`. Public, no account needed. The page shows a printable certificate and the project record it links to.

## Where things live

- `lib/db/schema.ts` tables (Drizzle). `drizzle.config.ts` for `db:push` / `db:studio`.
- `lib/actions.ts` every mutation, as Server Actions. Each one re-checks the session and the caller's role.
- `lib/auth/` password hashing (scrypt) and database-backed sessions in an httpOnly cookie.
- `lib/data/state.ts` builds the state the client receives: public problems, plus the viewer's own submissions, plus everything for admins.
- `lib/store.tsx` the client provider. Screens read `state` and call actions; every action returns fresh state.
- `scripts/seed.ts` demo data loader.
