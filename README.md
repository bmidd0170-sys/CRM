# ☁️ CRM Platform

**Donor management, campaigns, and reporting—validated, automated, and ready for production.** Built with Next.js (App Router), TypeScript, Prisma/PostgreSQL, Zod validation, and Firebase config for authentication helpers.

## ✨ Highlights
- **Complete REST layer**: CRUD for admins, donors, campaigns, events, donations, notifications, and logins
- **Safety first**: Zod schemas plus business rules (unique emails, FK checks, date logic, enums)
- **Automatic rollups**: Donation create/update/delete recalculates donor totals, last donation, and campaign raised inside transactions
- **Typed utilities**: Centralized Prisma + validation helpers in `lib/`
- **Docs included**: Full reference, quick lookup, validation guide, setup guide, architecture overview, and implementation summary

## 🧱 Tech Stack
- Next.js 16 (App Router) with React 19 and TypeScript
- Prisma ORM targeting PostgreSQL
- Zod for validation
- Firebase config for login-related endpoints

## 🚀 Quick Start
1) Install
```bash
npm install
```
2) Configure environment (`.env.local`)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/crm_db
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
3) Apply migrations
```bash
npx prisma migrate deploy
```
4) (Optional) Seed sample data
```bash
node prisma/seed.js
```
5) Run locally
```bash
npm run dev
# visit http://localhost:3000
```

## 📜 Scripts
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run start` — run built app
- `npm run lint` — lint codebase

## 🌐 API Overview
- Pattern: `GET/POST/PUT/DELETE /api/{resource}`
- Resources: admins, donors, campaigns, events, donations, notifications, logins
- Filters: `id`, `donorId`, `campaignId`, `unread=true`
- Responses: HTTP 200/201/400/404/409/500 with structured validation errors (`details` array)

Create donor with error handling:
```typescript
const response = await fetch('/api/donors', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({
		name: 'Jane Doe',
		email: 'jane@example.com',
		status: 'Active'
	})
});

if (response.status === 400) {
	const { details } = await response.json();
	details.forEach(err => console.error(`${err.field}: ${err.message}`));
}
```

## 🛡️ Validation & Integrity
- Zod schemas in `lib/validators.ts` for all inputs
- Business checks: unique emails, foreign keys exist, enums enforced, endDate > startDate, positive numbers
- Donation flows use transactions to keep donor totals, lastDonation, and campaign raised consistent

## 📚 Documentation
- Full reference: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Quick lookup: [API_QUICK_REFERENCE.txt](API_QUICK_REFERENCE.txt)
- Setup and integration: [SETUP_AND_USAGE_GUIDE.md](SETUP_AND_USAGE_GUIDE.md)
- Validation errors: [VALIDATION_ERRORS_GUIDE.md](VALIDATION_ERRORS_GUIDE.md)
- Architecture: [ARCHITECTURE_OVERVIEW.md](ARCHITECTURE_OVERVIEW.md)
- Delivery summary: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- Extras: [LOGIN_DATA_POPULATION.md](LOGIN_DATA_POPULATION.md), [DATABASE_AND_DELETE_IMPLEMENTATION.md](DATABASE_AND_DELETE_IMPLEMENTATION.md), [TEMP_DATA_CLEAR_IMPLEMENTATION.md](TEMP_DATA_CLEAR_IMPLEMENTATION.md), [FIXES_APPLIED.md](FIXES_APPLIED.md)

## 🧭 Troubleshooting
- 400 validation errors: inspect the `details` array in the response
- 409 conflict: email already exists—update the record instead of creating a duplicate
- Foreign key errors: ensure donor/campaign exists before creating dependent records
- DB connection issues: verify `DATABASE_URL` and PostgreSQL is running
