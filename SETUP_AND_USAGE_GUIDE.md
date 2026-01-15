# CRM API Setup & Usage Guide

## Overview

This guide explains how the new validation API system works, what files were created, and how to use it in your application.

---

## What Was Created

### 1. **Validation Library** (`lib/validators.ts`)
- **Purpose:** Defines Zod schemas for validating all data models
- **Contains:** Schemas for Admin, Donor, Campaign, Event, Donation, Notification, and Login
- **Exports:**
  - `adminSchema`, `donorSchema`, `campaignSchema`, etc.
  - `validateData()` - Function to validate any data against a schema
  - `formatValidationErrors()` - Function to format validation errors nicely

### 2. **Database Utilities** (`lib/db.ts`)
- **Purpose:** Centralized database connection and helper functions
- **Contains:**
  - Singleton Prisma instance (prevents multiple connections)
  - Helper functions:
    - `checkEmailExists()` - Check if email is already used
    - `checkCampaignExists()` - Verify campaign exists
    - `checkDonorExists()` - Verify donor exists
    - `updateDonorTotal()` - Recalculate donor total donations
    - `updateCampaignRaised()` - Recalculate campaign raised amount

### 3. **API Routes** (All updated with validation)
- `app/api/admins/route.ts` - Full CRUD operations
- `app/api/donors/route.ts` - Full CRUD operations
- `app/api/campaigns/route.ts` - Full CRUD operations
- `app/api/events/route.ts` - Full CRUD operations
- `app/api/donations/route.ts` - Full CRUD with auto-calculations
- `app/api/notifications/route.ts` - Full CRUD operations
- `app/api/logins/route.ts` - Login and status update

### 4. **Documentation Files**
- `API_DOCUMENTATION.md` - Complete API reference with examples
- `API_QUICK_REFERENCE.txt` - Quick lookup for all endpoints
- `VALIDATION_ERRORS_GUIDE.md` - Validation error explanations

---

## How It Works

### Request Flow

```
Client Request
    ↓
API Route Handler (GET/POST/PUT/DELETE)
    ↓
Extract & Parse Request Data
    ↓
Validate Data (using Zod schema)
    ↓
If Invalid → Return 400 with validation errors
    ↓
If Valid → Check business rules (email unique, foreign keys exist, etc.)
    ↓
If Rules Violated → Return 400/409 with specific error
    ↓
Execute Database Operation (Create/Read/Update/Delete)
    ↓
Auto-calculate if needed (donor total, campaign raised, etc.)
    ↓
Return Result (201 Created, 200 OK, etc.)
```

---

## Using the API in Your Frontend

### Example 1: Create a Donor with Error Handling

```typescript
const createDonor = async (donorData: {
  name: string;
  email: string;
  status: "Active" | "Inactive" | "Pending";
}) => {
  try {
    const response = await fetch('/api/donors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(donorData)
    });

    if (response.status === 400) {
      const { details } = await response.json();
      // Handle validation errors
      details.forEach(error => {
        console.error(`${error.field}: ${error.message}`);
      });
      return null;
    }

    if (response.status === 409) {
      const { error } = await response.json();
      console.error(error); // Email already exists
      return null;
    }

    if (!response.ok) {
      throw new Error('Server error');
    }

    const donor = await response.json();
    return donor;
  } catch (error) {
    console.error('Failed to create donor:', error);
    return null;
  }
};
```

### Example 2: Create a Donation (with Auto-calculations)

```typescript
const createDonation = async (
  amount: number,
  donorId: number,
  campaignId: number
) => {
  const response = await fetch('/api/donations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount,
      date: new Date().toISOString(),
      donorId,
      campaignId
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }

  const donation = await response.json();
  
  // The API automatically:
  // 1. Updated donor.total
  // 2. Updated donor.lastDonation
  // 3. Updated campaign.raised
  
  return donation;
};
```

### Example 3: Get Filtered Data

```typescript
// Get donations by a specific donor
const donorDonations = await fetch('/api/donations?donorId=1')
  .then(r => r.json());

// Get only unread notifications
const unreadNotifications = await fetch('/api/notifications?unread=true')
  .then(r => r.json());

// Get a specific campaign with all its events and donations
const campaign = await fetch('/api/campaigns?id=1')
  .then(r => r.json());
```

---

## Key Features

### ✅ Full Data Validation
Every field is validated before reaching the database:
- Type checking (string, number, date, etc.)
- Format validation (email, URL, ISO datetime)
- Length constraints
- Enum constraints
- Business logic (dates, foreign keys)

### ✅ Automatic Calculations
Donations automatically update:
- Donor's total amount
- Donor's last donation date
- Campaign's raised amount

Updates work for POST (create), PUT (update), and DELETE operations.

### ✅ Comprehensive Error Messages
Validation errors tell you exactly what's wrong:
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "goal",
      "message": "Goal must be a positive number"
    }
  ]
}
```

### ✅ Database Integrity
- Unique email constraints prevent duplicates
- Foreign key validation prevents orphaned records
- Transaction support for donations (all-or-nothing updates)

### ✅ RESTful Design
- GET - Retrieve data
- POST - Create new record
- PUT - Update existing record
- DELETE - Remove record

---

## Environment Setup

### Required Environment Variables
Make sure your `.env.local` file contains:

```env
# Database Connection
DATABASE_URL="postgresql://user:password@localhost:5432/crm_db"

# Firebase (for authentication)
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Dependencies Installed
- `zod` - Data validation library
- `@prisma/client` - Database ORM
- All other dependencies already in your package.json

---

## Testing the API

### Using Postman/Thunder Client

1. **Create Admin:**
   ```
   POST http://localhost:3000/api/admins
   Body (JSON):
   {
     "name": "John Admin",
     "email": "admin@example.com",
     "role": "Admin"
   }
   ```

2. **Test Validation (Invalid Data):**
   ```
   POST http://localhost:3000/api/admins
   Body (JSON):
   {
     "name": "John",
     "email": "not-an-email",
     "role": "InvalidRole"
   }
   Expected: 400 Bad Request with validation errors
   ```

3. **Test Unique Constraint:**
   ```
   POST http://localhost:3000/api/admins
   Body: Same email as previous admin
   Expected: 409 Conflict
   ```

### Using cURL

```bash
# Create a donor
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Donor",
    "email": "jane@example.com",
    "status": "Active"
  }'

# Get all donors
curl http://localhost:3000/api/donors

# Update a donor
curl -X PUT http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "status": "Inactive"
  }'

# Delete a donor
curl -X DELETE "http://localhost:3000/api/donors?id=1"
```

---

## Common Patterns

### Frontend Form Validation

```typescript
// Match your frontend validation to API validation
const adminFormSchema = {
  name: {
    required: true,
    maxLength: 100
  },
  email: {
    required: true,
    type: 'email'
  },
  role: {
    required: true,
    enum: ['Super Admin', 'Admin', 'Manager', 'Viewer']
  }
};

// Use these constraints for form validation before API call
```

### Handling All Response Statuses

```typescript
const submitForm = async (data) => {
  const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  const result = await response.json();

  if (response.status === 201 || response.status === 200) {
    // Success
    console.log('Created/Updated:', result);
  } else if (response.status === 400) {
    // Validation failed
    console.error('Validation errors:', result.details);
  } else if (response.status === 409) {
    // Conflict (e.g., email exists)
    console.error('Conflict:', result.error);
  } else if (response.status === 404) {
    // Not found
    console.error('Not found:', result.error);
  } else if (response.status === 500) {
    // Server error
    console.error('Server error:', result.error);
  }
};
```

---

## Database Transactions

### Donations Use Transactions
Creating/updating/deleting a donation uses database transactions:

```typescript
// All of these happen atomically (all succeed or all fail):
// 1. Create/update/delete the donation
// 2. Recalculate donor total
// 3. Update donor last donation date
// 4. Recalculate campaign raised amount
```

If any step fails, the entire operation is rolled back.

---

## Migration Guide (if updating existing code)

If you have components that call the old API routes:

### Old Pattern
```typescript
const response = await fetch('/api/donors', {
  method: 'POST',
  body: JSON.stringify(data)
});
const donor = await response.json();
```

### New Pattern
```typescript
const response = await fetch('/api/donors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data)
});

if (!response.ok) {
  const error = await response.json();
  // Handle validation errors or other errors
  console.error(error.details || error.error);
  return;
}

const donor = await response.json();
```

**Key differences:**
- Check `response.ok` or `response.status`
- Handle validation errors from `error.details`
- Handle conflict errors (409) separately

---

## Next Steps

1. **Test all endpoints** with the provided documentation
2. **Update components** to handle new response formats and validation errors
3. **Add frontend validation** that mirrors the API schemas
4. **Implement error UI** to show validation messages to users
5. **Consider adding** password hashing to the login endpoint (currently basic)

---

## Troubleshooting

### "Validation failed" Error
- Check the `details` array in the response for specific field errors
- Verify field types match the schema (string vs number, etc.)
- For dates, use ISO 8601 format: `new Date().toISOString()`

### "Email already exists" (409)
- The email is already used by another record
- Use update (PUT) instead of create (POST) to modify existing record
- Or use a different email address

### "Campaign not found" or "Donor not found"
- The foreign key ID doesn't exist in the database
- Verify the ID is correct
- Create the related record first before referencing it

### "End date must be after start date"
- Your end date is before your start date
- Swap them or adjust the dates

### Server Error (500)
- Check the server logs for detailed error message
- Could be database connection issue
- Verify DATABASE_URL in .env.local

---

## Files Structure Summary

```
CRM/
├── lib/
│   ├── validators.ts      (NEW - Zod schemas)
│   ├── db.ts              (NEW - Database utilities)
│   └── firebase.ts        (existing)
├── app/api/
│   ├── admins/route.ts    (UPDATED with validation)
│   ├── donors/route.ts    (UPDATED with validation)
│   ├── campaigns/route.ts (UPDATED with validation)
│   ├── events/route.ts    (UPDATED with validation)
│   ├── donations/route.ts (NEW - Full featured)
│   ├── notifications/route.ts (UPDATED with validation)
│   └── logins/route.ts    (UPDATED with validation)
├── API_DOCUMENTATION.md           (NEW - Full docs)
├── API_QUICK_REFERENCE.txt        (NEW - Quick lookup)
├── VALIDATION_ERRORS_GUIDE.md     (NEW - Error reference)
└── README.md (existing)
```

---

## Support & Resources

- **Full Documentation:** See `API_DOCUMENTATION.md`
- **Quick Reference:** See `API_QUICK_REFERENCE.txt`
- **Error Codes:** See `VALIDATION_ERRORS_GUIDE.md`
- **Zod Documentation:** https://zod.dev
- **Prisma Documentation:** https://www.prisma.io/docs

---
