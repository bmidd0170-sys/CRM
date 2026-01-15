# Validation Errors Reference Guide

This guide explains all possible validation errors you may encounter when using the CRM API.

## Common Validation Errors

### Email Validation
**Error Message:** `"Invalid email address"`
**Cause:** The email field doesn't match a valid email format
**Example Invalid Values:**
- `"john@"`
- `"@example.com"`
- `"john.example.com"` (missing @)
- `"john @example.com"` (space)

**Valid Format:** `user@domain.com`

---

### Required Field Missing
**Error Message:** `"{fieldName} is required"`
**Cause:** A required field was not provided in the request
**Example Invalid:**
```json
{
  "name": "John Doe"
  // Missing "email" field
}
```

---

### String Length Validation

#### Too Short
**Error Message:** `"{fieldName} must be at least X characters"`
**Cause:** String is shorter than minimum allowed length

#### Too Long
**Error Message:** `"{fieldName} must be less than X characters"`
**Cause:** String exceeds maximum allowed length

**Examples:**
- Admin name: max 100 characters
- Campaign name: max 200 characters
- Notification message: max 500 characters

---

### Enum Validation
**Error Message:** `"{fieldName} must be {option1}, {option2}, or {option3}"`
**Cause:** The value provided is not one of the allowed options

#### Admin Role
**Valid values:** "Super Admin", "Admin", "Manager", "Viewer"
**Invalid example:** "Superuser"

#### Donor Status
**Valid values:** "Active", "Inactive", "Pending"
**Invalid example:** "Suspended"

#### Notification Type
**Valid values:** "Info", "Warning", "Error", "Success"
**Invalid example:** "Notification"

---

### Number Validation

#### Positive Numbers Required
**Error Message:** `"{fieldName} must be a positive number"`
**Cause:** Value is zero, negative, or not a number

**Used for:**
- `Campaign.goal` - campaign target amount
- `Donation.amount` - donation amount

**Invalid examples:** `-100`, `0`, `"abc"`

#### Non-Negative Numbers
**Error Message:** `"{fieldName} must be non-negative"`
**Cause:** Value is negative or not a number

**Used for:**
- `Campaign.raised` - campaign amount raised
- `Donor.total` - donor total amount

**Invalid examples:** `-50`, `-0.01`

---

### Date/DateTime Validation

#### Invalid Format
**Error Message:** `"Invalid {fieldName} format"`
**Cause:** Date is not in ISO 8601 format

**Valid ISO 8601 formats:**
- `"2026-01-15T10:30:00Z"`
- `"2026-01-15T10:30:00.000Z"`
- `new Date().toISOString()` (JavaScript)

**Invalid examples:**
- `"01/15/2026"` (US format)
- `"2026-13-01T00:00:00Z"` (invalid month)
- `"2026-01-15"` (missing time)
- `"January 15, 2026"`

#### Date Comparison Error
**Error Message:** `"End date must be after start date"`
**Cause:** End date is before or equal to start date

**Used for:**
- Campaign: `endDate` must be after `startDate`

**Invalid example:**
```json
{
  "startDate": "2026-12-31T00:00:00Z",
  "endDate": "2026-01-01T00:00:00Z"
}
```

---

### URL Validation
**Error Message:** `"Invalid image URL"`
**Cause:** The URL format is invalid or doesn't start with http:// or https://

**Valid examples:**
- `"https://example.com/image.jpg"`
- `"http://example.com/image.png"`

**Invalid examples:**
- `"example.com/image.jpg"` (missing protocol)
- `"not a url"`
- `"ftp://example.com/image.jpg"` (only http/https allowed)

---

### Foreign Key Validation

#### Donor Not Found
**Error Message:** `"Donor not found"`
**Cause:** The provided `donorId` doesn't exist in the database

**When used:**
- Creating/updating a donation

#### Campaign Not Found
**Error Message:** `"Campaign not found"`
**Cause:** The provided `campaignId` doesn't exist in the database

**When used:**
- Creating/updating an event
- Creating/updating a donation

---

### Unique Constraint Violations

#### Email Already Exists
**Error:** 409 Conflict
**Error Message:** `"An {model} with this email already exists"`
**Cause:** Attempting to create/update with an email that's already in use

**Applies to:**
- Admin (email must be unique)
- Donor (email must be unique)

**Example error response:**
```json
{
  "error": "An admin with this email already exists"
}
```

**Fix:** Use a different email address, or update the existing record instead

---

## Complete Validation Example

### POST Admin - All Possible Errors

```javascript
// Attempting to create an admin with invalid data:
const response = await fetch('/api/admins', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "a", // TOO SHORT - but actually name has min of 1, so valid
    email: "invalid-email", // INVALID FORMAT
    role: "InvalidRole" // NOT IN ENUM
    // Missing password if required in future
  })
});

// Response: 400 Bad Request
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    },
    {
      "field": "role",
      "message": "Role must be Super Admin, Admin, Manager, or Viewer"
    }
  ]
}
```

---

## Validation Checklist

Before sending a request, ensure:

### Admins
- [ ] `name` - 1-100 characters
- [ ] `email` - valid email format, unique
- [ ] `role` - one of: Super Admin, Admin, Manager, Viewer
- [ ] `restrictions` - array of strings (optional)
- [ ] `online` - boolean (optional)
- [ ] `changes` - array of strings (optional)

### Donors
- [ ] `name` - 1-100 characters
- [ ] `email` - valid email format, unique
- [ ] `total` - non-negative number (optional)
- [ ] `lastDonation` - ISO 8601 datetime (optional)
- [ ] `status` - one of: Active, Inactive, Pending
- [ ] `tags` - array of strings (optional)

### Campaigns
- [ ] `name` - 1-200 characters
- [ ] `goal` - positive number
- [ ] `raised` - non-negative number (optional)
- [ ] `startDate` - ISO 8601 datetime
- [ ] `endDate` - ISO 8601 datetime, must be after startDate
- [ ] `description` - required, any length

### Events
- [ ] `name` - 1-200 characters
- [ ] `date` - ISO 8601 datetime
- [ ] `description` - required, any length
- [ ] `image` - valid URL or null (optional)
- [ ] `campaignId` - valid campaign ID or null (optional)

### Donations
- [ ] `amount` - positive number
- [ ] `date` - ISO 8601 datetime
- [ ] `donorId` - valid donor ID
- [ ] `campaignId` - valid campaign ID or null (optional)

### Notifications
- [ ] `type` - one of: Info, Warning, Error, Success
- [ ] `message` - 1-500 characters
- [ ] `date` - ISO 8601 datetime
- [ ] `read` - boolean (optional)

### Login
- [ ] `email` - valid email format
- [ ] `password` - minimum 6 characters

---

## Testing Validation

### Using cURL
```bash
# Test email validation
curl -X POST http://localhost:3000/api/admins \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "invalid-email",
    "role": "Admin"
  }'

# Expected response:
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email address"
    }
  ]
}
```

### Using JavaScript/Fetch
```javascript
const testValidation = async () => {
  try {
    const response = await fetch('/api/admins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: "Test Admin",
        email: "test@example.com",
        role: "InvalidRole"
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Validation errors:', error.details);
    } else {
      const admin = await response.json();
      console.log('Success:', admin);
    }
  } catch (err) {
    console.error('Request failed:', err);
  }
};
```

---

## Tips for Avoiding Validation Errors

1. **Always validate on the frontend** before sending to the API
2. **Use the quick reference** for allowed enum values
3. **Format dates** using `new Date().toISOString()` in JavaScript
4. **Check email uniqueness** before creating/updating records
5. **Verify foreign keys** exist before creating related records
6. **Test thoroughly** with edge cases (empty strings, null, undefined, etc.)
7. **Handle all error codes** in your frontend (400, 404, 409, 500)

---
