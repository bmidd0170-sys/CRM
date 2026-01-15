# CRM API System Architecture

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React Components)                  │
│  (AdminList, DonorStats, CampaignForm, EventForm, etc.)         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                    HTTP Requests
                    (fetch/axios)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API ROUTES (Next.js)                          │
│  ┌─────────────┬─────────────┬──────────────┬────────────────┐  │
│  │   Admins    │   Donors    │  Campaigns   │     Events     │  │
│  │   /api/     │   /api/     │   /api/      │    /api/       │  │
│  │   admins    │   donors    │  campaigns   │    events      │  │
│  └──────┬──────┴──────┬──────┴──────┬───────┴────────┬───────┘  │
│         │             │             │                │          │
│  ┌──────┴─────┬──────┴─────┬────────┴────────┬──────┴────────┐  │
│  │ Donations  │Notifications│     Logins      │               │  │
│  │   /api/    │   /api/     │   /api/        │               │  │
│  │ donations  │notif...     │   logins       │               │  │
│  └──────┬─────┴──────┬──────┴────────┬───────┘               │  │
│         │            │               │                       │  │
└─────────┼────────────┼───────────────┼───────────────────────┘
          │            │               │
          │   REQUEST DATA FLOW        │
          │            │               │
          ▼            ▼               ▼
┌─────────────────────────────────────────────────────────────────┐
│                 VALIDATION LAYER (lib/validators.ts)            │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  validateData() → Zod Schemas                           │   │
│  │  - Email format validation                              │   │
│  │  - String length constraints                            │   │
│  │  - Enum constraints (role, status, type)                │   │
│  │  - Number range validation                              │   │
│  │  - Date format & comparison                             │   │
│  │  - URL validation                                       │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────┘
          │
     Valid Data Only
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                          │
│                    (lib/db.ts utilities)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  - Email uniqueness checks                              │   │
│  │  - Foreign key verification                             │   │
│  │  - Auto-calculation functions                           │   │
│  │  - Database helper functions                            │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────┬───────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│              DATABASE LAYER (Prisma ORM)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  PostgreSQL Database                                      │  │
│  │  ├── admins table                                         │  │
│  │  ├── donors table                                         │  │
│  │  ├── campaigns table                                      │  │
│  │  ├── events table                                         │  │
│  │  ├── donations table                                      │  │
│  │  └── notifications table                                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example: Creating a Donation

```
1. USER ACTION
   └─ User clicks "Add Donation" button in UI
      Amount: 500, Donor ID: 1, Campaign ID: 1

2. FRONTEND SENDS REQUEST
   └─ POST /api/donations
      {
        "amount": 500,
        "date": "2026-01-15T10:30:00Z",
        "donorId": 1,
        "campaignId": 1
      }

3. API VALIDATION
   └─ lib/validators.ts validates with donationSchema
      ✓ amount is positive number
      ✓ date is valid ISO 8601
      ✓ donorId is positive integer
      ✓ campaignId is positive integer

4. BUSINESS LOGIC CHECKS
   └─ lib/db.ts utilities verify:
      ✓ Donor with ID 1 exists
      ✓ Campaign with ID 1 exists

5. DATABASE TRANSACTION BEGINS
   └─ app/api/donations/route.ts POST handler starts transaction

6. CREATE DONATION
   └─ INSERT INTO donations (amount, date, donorId, campaignId)
      VALUES (500, '2026-01-15T10:30:00Z', 1, 1)
      RETURNING *

7. AUTO-UPDATE DONOR TOTAL
   └─ SELECT SUM(amount) FROM donations WHERE donorId = 1
      └─ UPDATE donors SET total = 500, lastDonation = NOW()

8. AUTO-UPDATE CAMPAIGN RAISED
   └─ SELECT SUM(amount) FROM donations WHERE campaignId = 1
      └─ UPDATE campaigns SET raised = 500

9. TRANSACTION COMMITS
   └─ All changes saved atomically (all succeed or all fail)

10. RESPONSE SENT
    └─ HTTP 201 Created
       {
         "id": 1,
         "amount": 500,
         "date": "2026-01-15T10:30:00Z",
         "donorId": 1,
         "campaignId": 1,
         "donor": {...},
         "campaign": {...}
       }

11. FRONTEND UPDATES UI
    └─ Display success message
    └─ Update donor total display
    └─ Refresh campaign progress bar
```

---

## Request/Response Cycle

```
SUCCESSFUL REQUEST (201 Created)
┌──────────────────────────────────┐
│  POST /api/donors                │
│  {                               │
│    "name": "John Doe",          │
│    "email": "john@example.com", │
│    "status": "Active"           │
│  }                              │
└────────────┬─────────────────────┘
             │
             ▼ VALIDATION PASSES
             
┌────────────────────────────────────────┐
│  CREATE donor                          │
│  INSERT INTO donors (...) VALUES (...)  │
└────────────┬───────────────────────────┘
             │
             ▼ SUCCESS
             
┌────────────────────────────────────────┐
│  HTTP 201 Created                      │
│  {                                     │
│    "id": 1,                           │
│    "name": "John Doe",               │
│    "email": "john@example.com",      │
│    "status": "Active",               │
│    "total": 0,                       │
│    "lastDonation": null,             │
│    "tags": [],                       │
│    "donations": []                   │
│  }                                   │
└────────────────────────────────────────┘


FAILED REQUEST (400 Bad Request)
┌──────────────────────────────────┐
│  POST /api/donors                │
│  {                               │
│    "name": "Jane",              │
│    "email": "invalid-email",    │ ❌ Invalid format
│    "status": "Unknown"          │ ❌ Invalid enum
│  }                              │
└────────────┬─────────────────────┘
             │
             ▼ VALIDATION FAILS
             
┌────────────────────────────────────────┐
│  HTTP 400 Bad Request                  │
│  {                                     │
│    "error": "Validation failed",      │
│    "details": [                        │
│      {                                 │
│        "field": "email",              │
│        "message": "Invalid email ..." │
│      },                               │
│      {                                │
│        "field": "status",             │
│        "message": "Status must be ..." │
│      }                                │
│    ]                                  │
│  }                                    │
└────────────────────────────────────────┘


CONFLICT REQUEST (409 Conflict)
┌──────────────────────────────────┐
│  POST /api/donors                │
│  {                               │
│    "name": "Jane Doe",          │
│    "email": "john@example.com", │ ❌ Already exists
│    "status": "Active"           │
│  }                              │
└────────────┬─────────────────────┘
             │
             ▼ VALIDATION PASSES
             │
             ▼ EMAIL CHECK FAILS
             
┌────────────────────────────────────────┐
│  HTTP 409 Conflict                     │
│  {                                     │
│    "error": "A donor with this email"  │
│            " already exists"           │
│  }                                    │
└────────────────────────────────────────┘
```

---

## API Endpoints Matrix

```
ENDPOINT          METHOD   QUERY PARAMS        RESPONSE
─────────────────────────────────────────────────────────────
/api/admins       GET      id (optional)       Array or Single
/api/admins       POST     -                   Created Admin (201)
/api/admins       PUT      -                   Updated Admin
/api/admins       DELETE   id (required)       Success Message

/api/donors       GET      id (optional)       Array or Single
/api/donors       POST     -                   Created Donor (201)
/api/donors       PUT      -                   Updated Donor
/api/donors       DELETE   id (required)       Success Message

/api/campaigns    GET      id (optional)       Array or Single
/api/campaigns    POST     -                   Created Campaign (201)
/api/campaigns    PUT      -                   Updated Campaign
/api/campaigns    DELETE   id (required)       Success Message

/api/events       GET      id (optional)       Array or Single
/api/events       POST     -                   Created Event (201)
/api/events       PUT      -                   Updated Event
/api/events       DELETE   id (required)       Success Message

/api/donations    GET      id, donorId,       Array or Single
                            campaignId (all opt)
/api/donations    POST     -                   Created Donation (201)
/api/donations    PUT      -                   Updated Donation
/api/donations    DELETE   id (required)       Success Message

/api/notifications GET     id, unread          Array or Single
/api/notifications POST    -                   Created Notification (201)
/api/notifications PUT     -                   Updated Notification
/api/notifications DELETE  id (required)       Success Message

/api/logins       POST     -                   Admin Data (200)
/api/logins       PUT      -                   Admin Status (200)
```

---

## Validation Rule Summary

```
FIELD TYPE          RULES
─────────────────────────────────────────────────────
String              - Required (unless marked optional)
                    - Max length constraint (varies)
                    - No leading/trailing spaces trimmed

Email               - Must match: user@domain.com
                    - Case-insensitive
                    - Must be unique in table

Number              - Type check: int or float
                    - Positive (> 0) or Non-negative (>= 0)
                    - No NaN or Infinity

Date/DateTime       - Format: ISO 8601 (2026-01-15T10:00:00Z)
                    - Must be valid date
                    - Can validate: before, after, between

Boolean             - true or false only
                    - Coerces truthy/falsy values

Enum                - Must be one of predefined values
                    - Case-sensitive
                    - No custom values allowed

URL                 - Must start with http:// or https://
                    - Must be valid URL format
                    - Protocol required

Array               - Can be empty []
                    - All items must match element type
                    - Length can be constrained

Foreign Key         - Must reference existing record
                    - Checked before database insert
                    - Returns 404 if not found

Unique              - Value must not exist in table
                    - Currently: email fields
                    - Returns 409 Conflict if exists
```

---

## Error Handling Flow

```
API REQUEST
    │
    ├─▶ Validate Input Data
    │      │
    │      ├─ INVALID ──▶ 400 Bad Request
    │      │              Return validation details
    │      │
    │      └─ VALID
    │
    ├─▶ Check Business Rules
    │      │
    │      ├─ EMAIL EXISTS ──▶ 409 Conflict
    │      │
    │      ├─ FOREIGN KEY MISSING ──▶ 404 Not Found
    │      │
    │      ├─ RESOURCE NOT FOUND ──▶ 404 Not Found
    │      │
    │      └─ RULES PASS
    │
    ├─▶ Execute Database Operation
    │      │
    │      ├─ ERROR ──▶ 500 Internal Server Error
    │      │
    │      └─ SUCCESS
    │
    ├─▶ Auto-Calculate (if applicable)
    │      │
    │      ├─ ERROR ──▶ 500 (transaction rolled back)
    │      │
    │      └─ SUCCESS
    │
    └─▶ Return Response
           201 Created (POST)
           200 OK (GET/PUT/DELETE)
```

---

## Component Integration Example

```
AdminForm Component
    │
    └─ Form Input
         │
         └─ onSubmit Handler
              │
              ├─ Validate locally (optional)
              │
              ├─ POST /api/admins
              │   {
              │     "name": "...",
              │     "email": "...",
              │     "role": "..."
              │   }
              │
              ├─ Response Handling
              │   │
              │   ├─ 201 ──▶ Show success
              │   │         Reset form
              │   │         Refresh list
              │   │
              │   ├─ 400 ──▶ Show validation errors
              │   │         Highlight invalid fields
              │   │
              │   ├─ 409 ──▶ Show "Email exists" error
              │   │
              │   └─ 500 ──▶ Show "Server error"
              │
              └─ Update UI State
```

---

## Database Relationship Diagram

```
┌──────────┐         ┌─────────────┐
│  Admin   │         │  Donor      │
├──────────┤         ├─────────────┤
│ id (PK)  │         │ id (PK)     │
│ name     │         │ name        │
│ email    │         │ email       │
│ role     │         │ total       │◀─────┐
│ changes  │         │ lastDonation│      │
└──────────┘         │ status      │      │
                     └─────────────┘      │
                            ▲             │
                            │             │
                     1:N     │      ┌──────┴──────┐
                    ┌────────┘      │             │
                    │        ┌──────▼────┐  ┌───▼────────┐
                    │        │ Donation  │  │  Campaign  │
                    │        ├───────────┤  ├────────────┤
                    │        │ id (PK)   │  │ id (PK)    │
                    │        │ amount    │  │ name       │
                    │        │ date      │  │ goal       │
                    │        │ donorId──────▶ raised ◀───┘
                    │        │ campaignId──┐ │ startDate  │
                    │        └───────────┘ │ │ endDate    │
                    │                      │ └────────────┘
                    │                      │       ▲
                    │                      │       │
                    │                      └───────┤
                    │                         1:N  │
                    │              ┌──────────────┐│
                    │              │   Event      ││
                    │              ├──────────────┤│
                    │              │ id (PK)      ││
                    │              │ name         ││
                    │              │ date         ││
                    │              │ campaignId◀──┘
                    │              └──────────────┘
                    │
                    └────────────────────────┐
                                             │
                              ┌──────────────▼────┐
                              │  Notification     │
                              ├───────────────────┤
                              │ id (PK)           │
                              │ type              │
                              │ message           │
                              │ date              │
                              │ read              │
                              └───────────────────┘
```

---

## Performance Considerations

```
QUERY OPTIMIZATION
─────────────────────────────────────────────────────
GET /api/donors           → Includes donations
GET /api/campaigns        → Includes events + donations  
GET /api/events           → Includes campaign
GET /api/donations        → Includes donor + campaign

Results are ordered by:
- Events: date DESC (newest first)
- Donations: date DESC (newest first)
- Notifications: date DESC (newest first)
- Admin/Donor/Campaign: id ASC (by ID)

AGGREGATIONS (Auto-calculations)
─────────────────────────────────────────────────────
Each donation change triggers:
- SUM(amount) for donor.total
- SUM(amount) for campaign.raised

These are fast operations on indexed foreign keys.

DATABASE INDEXING
─────────────────────────────────────────────────────
Indexed columns (built-in):
- All primary keys (id)
- All unique columns (email)
- All foreign keys (donorId, campaignId)

This ensures:
- Fast lookups by ID
- Fast email uniqueness checks
- Fast aggregations
```

---

## File Organization

```
c:\Projects\CRM\
├── lib/
│   ├── validators.ts         ← Zod schemas
│   ├── db.ts                 ← Database utilities
│   └── firebase.ts           ← Firebase config
├── app/
│   ├── api/
│   │   ├── admins/route.ts
│   │   ├── donors/route.ts
│   │   ├── campaigns/route.ts
│   │   ├── events/route.ts
│   │   ├── donations/route.ts
│   │   ├── notifications/route.ts
│   │   └── logins/route.ts
│   └── ...
├── prisma/
│   └── schema.prisma         ← Database schema
├── API_DOCUMENTATION.md      ← Full reference
├── API_QUICK_REFERENCE.txt   ← Quick lookup
├── VALIDATION_ERRORS_GUIDE.md ← Error help
├── SETUP_AND_USAGE_GUIDE.md  ← Integration
├── IMPLEMENTATION_SUMMARY.md ← What was done
└── QUICK_START.md            ← Getting started
```

---
