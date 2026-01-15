# 🚀 Quick Start Guide - CRM API

## What's New?

Your CRM now has a **complete, validated API system** with:
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Comprehensive data validation
- ✅ Automatic calculations (donor totals, campaign amounts)
- ✅ Detailed error messages
- ✅ Production-ready code

---

## 📁 New Files

**Library Files (in `lib/`):**
- `validators.ts` - All validation schemas
- `db.ts` - Database utilities

**API Routes:**
- `/api/donations/route.ts` - New donations endpoint

**Updated Routes:**
- `/api/admins/route.ts`
- `/api/donors/route.ts`
- `/api/campaigns/route.ts`
- `/api/events/route.ts`
- `/api/notifications/route.ts`
- `/api/logins/route.ts`

**Documentation:**
- `API_DOCUMENTATION.md` - Full reference
- `API_QUICK_REFERENCE.txt` - Quick lookup
- `VALIDATION_ERRORS_GUIDE.md` - Error reference
- `SETUP_AND_USAGE_GUIDE.md` - Integration guide
- `IMPLEMENTATION_SUMMARY.md` - What was delivered

---

## 🔧 Installation

The only new package was installed automatically:

```bash
npm install zod
```

If you need to reinstall:
```bash
cd c:\Projects\CRM
npm install zod
```

---

## 📝 Basic Usage Examples

### Create a Donor

```javascript
const response = await fetch('/api/donors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'John Doe',
    email: 'john@example.com',
    status: 'Active'
  })
});

const donor = await response.json();
console.log('Donor created:', donor);
```

### Create a Donation (auto-updates donor total)

```javascript
const response = await fetch('/api/donations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 500,
    date: new Date().toISOString(),
    donorId: 1,
    campaignId: 1
  })
});

const donation = await response.json();
// Donor's total and campaign's raised amount are automatically updated!
```

### Get Data with Filters

```javascript
// Get all donations from a specific donor
const donations = await fetch('/api/donations?donorId=1').then(r => r.json());

// Get unread notifications only
const unread = await fetch('/api/notifications?unread=true').then(r => r.json());

// Get a specific resource by ID
const admin = await fetch('/api/admins?id=1').then(r => r.json());
```

### Handle Validation Errors

```javascript
const response = await fetch('/api/donors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane',
    email: 'invalid-email', // ❌ Invalid email format
    status: 'Unknown' // ❌ Invalid status
  })
});

if (response.status === 400) {
  const { details } = await response.json();
  details.forEach(error => {
    console.error(`${error.field}: ${error.message}`);
  });
  // Output:
  // email: Invalid email address
  // status: Status must be Active, Inactive, or Pending
}
```

---

## 📊 API Endpoints Overview

### All endpoints follow this pattern:
```
GET     /api/{resource}              - Get all
GET     /api/{resource}?id=X         - Get one by ID
POST    /api/{resource}              - Create new
PUT     /api/{resource}              - Update existing
DELETE  /api/{resource}?id=X         - Delete
```

**Resources:** admins, donors, campaigns, events, donations, notifications

**Special filters:**
- `/api/donations?donorId=1` - Get donations for a donor
- `/api/donations?campaignId=1` - Get donations for a campaign
- `/api/notifications?unread=true` - Get unread notifications

---

## ✅ What Gets Validated

**Every request is checked for:**

| Validation | Examples |
|-----------|----------|
| Required fields | name, email, amount |
| Email format | Must be `user@domain.com` |
| Positive numbers | donation amounts, campaign goals |
| String length | Admin name max 100 chars |
| Date format | Must be ISO 8601: `2026-01-15T10:00:00Z` |
| Date logic | End date must be after start date |
| Enum values | Role: Super Admin, Admin, Manager, Viewer |
| URL format | For image URLs in events |
| Foreign keys | Donor/Campaign must exist |
| Uniqueness | Email cannot be duplicated |

---

## 🎯 Key Features

### Auto-Calculations
When you create a donation, the system automatically:
1. ✅ Saves the donation
2. ✅ Updates the donor's total amount
3. ✅ Updates the donor's last donation date
4. ✅ Updates the campaign's raised amount

**Delete or update a donation?** All calculations update automatically!

### Error Codes

| Code | Meaning | Example |
|------|---------|---------|
| 201 | Created successfully | New record added |
| 200 | Success | GET/PUT/DELETE successful |
| 400 | Invalid data | Missing field, wrong format |
| 404 | Not found | Record doesn't exist |
| 409 | Conflict | Email already exists |
| 500 | Server error | Database connection failed |

---

## 📚 Documentation Reference

**Need to know about a specific endpoint?**
→ Read `API_DOCUMENTATION.md`

**Want a quick lookup?**
→ Check `API_QUICK_REFERENCE.txt`

**Getting validation errors?**
→ See `VALIDATION_ERRORS_GUIDE.md`

**Setting up in your frontend?**
→ Follow `SETUP_AND_USAGE_GUIDE.md`

**Want to know what was delivered?**
→ Read `IMPLEMENTATION_SUMMARY.md`

---

## 🧪 Testing the API

### Using Postman/Thunder Client:
1. Open your HTTP client
2. Set method to `POST`
3. URL: `http://localhost:3000/api/donors`
4. Headers: `Content-Type: application/json`
5. Body:
```json
{
  "name": "Test Donor",
  "email": "test@example.com",
  "status": "Active"
}
```
6. Send → See the result!

### Using cURL:
```bash
curl -X POST http://localhost:3000/api/donors \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Donor",
    "email": "test@example.com",
    "status": "Active"
  }'
```

### Using JavaScript:
```javascript
const donor = await fetch('/api/donors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Test Donor',
    email: 'test@example.com',
    status: 'Active'
  })
}).then(r => r.json());

console.log(donor);
```

---

## 🔐 Security Features

- ✅ **Input validation** - Bad data is rejected before database
- ✅ **Email uniqueness** - No duplicate emails allowed
- ✅ **Foreign key checks** - Can't reference non-existent records
- ✅ **Type safety** - TypeScript with Zod validation
- ✅ **Transaction support** - Donations update atomically
- ✅ **No info leakage** - Error messages don't expose sensitive data

---

## 🐛 Common Issues & Solutions

### "Invalid email address"
**Problem:** Email format is wrong
**Solution:** Use format like `user@domain.com`

### "A donor with this email already exists" (409)
**Problem:** Email is already in use
**Solution:** Use a different email or update the existing donor instead

### "Donor not found"
**Problem:** The donor ID doesn't exist
**Solution:** Create the donor first or use the correct ID

### "End date must be after start date"
**Problem:** Campaign end date is before start date
**Solution:** Make sure endDate is later than startDate

### "Status must be Active, Inactive, or Pending"
**Problem:** Invalid status value
**Solution:** Use one of the allowed values

---

## 📋 Next Steps

1. **Test the API** with the examples provided
2. **Read the documentation** for your specific endpoint
3. **Update your components** to handle validation errors
4. **Test error cases** to see validation in action
5. **Implement frontend validation** that matches the API

---

## 💡 Pro Tips

1. **Always use `new Date().toISOString()`** for dates
2. **Check `response.ok`** before using the data
3. **Handle validation errors gracefully** in your UI
4. **Verify IDs exist** before creating related records
5. **Test with invalid data** to understand the errors

---

## 📞 Need Help?

1. **Check the relevant documentation file** - It probably has the answer
2. **Look at the example code** - Copy and adapt
3. **Test with the examples** - Make sure your data matches the format
4. **Read the error message** - It usually tells you what's wrong

---

## ✨ Summary

You now have:
- **7 API endpoints** (admins, donors, campaigns, events, donations, notifications, logins)
- **28 total operations** (GET, POST, PUT, DELETE on each)
- **Complete validation** on every field
- **Automatic calculations** for donations
- **Production-ready error handling**
- **Comprehensive documentation**

**Status: Ready to Use!** 🎉

---
