# CRM API Documentation

## Overview
This document outlines all available API endpoints for the CRM system with complete validation details and usage examples.

---

## Table of Contents
1. [Admins](#admins)
2. [Donors](#donors)
3. [Campaigns](#campaigns)
4. [Events](#events)
5. [Donations](#donations)
6. [Notifications](#notifications)
7. [Logins](#logins)
8. [Error Handling](#error-handling)

---

## Admins

### GET - Fetch Admins
**Endpoint:** `GET /api/admins`

**Query Parameters:**
- `id` (optional): Get a specific admin by ID

**Response (Success):**
```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Super Admin",
    "restrictions": [],
    "online": true,
    "changes": []
  }
]
```

**Response (Single by ID):**
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Super Admin",
  "restrictions": [],
  "online": true,
  "changes": []
}
```

---

### POST - Create Admin
**Endpoint:** `POST /api/admins`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Admin",
  "restrictions": ["reports", "settings"],
  "online": false,
  "changes": []
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, max 100 characters |
| `email` | String | Required, must be valid email, unique |
| `role` | Enum | Required, must be: "Super Admin", "Admin", "Manager", or "Viewer" |
| `restrictions` | Array | Optional, array of strings |
| `online` | Boolean | Optional, defaults to false |
| `changes` | Array | Optional, array of strings |

**Response (Success):** 201
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "Admin",
  "restrictions": ["reports", "settings"],
  "online": false,
  "changes": []
}
```

**Error Responses:**
- **400 Bad Request** - Validation failed
```json
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

- **409 Conflict** - Email already exists
```json
{
  "error": "An admin with this email already exists"
}
```

---

### PUT - Update Admin
**Endpoint:** `PUT /api/admins`

**Request Body:**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "role": "Manager"
}
```

**Notes:** All fields except `id` are optional. Same validation rules apply as POST.

**Response (Success):**
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "john@example.com",
  "role": "Manager",
  "restrictions": ["reports", "settings"],
  "online": false,
  "changes": []
}
```

---

### DELETE - Delete Admin
**Endpoint:** `DELETE /api/admins?id=1`

**Response (Success):**
```json
{
  "message": "Admin deleted successfully"
}
```

---

## Donors

### GET - Fetch Donors
**Endpoint:** `GET /api/donors`

**Query Parameters:**
- `id` (optional): Get a specific donor by ID

**Response (Success):**
```json
[
  {
    "id": 1,
    "name": "Jane Smith",
    "email": "jane@example.com",
    "total": 5000,
    "lastDonation": "2026-01-10T14:30:00Z",
    "status": "Active",
    "tags": ["major-donor", "recurring"],
    "donations": [...]
  }
]
```

---

### POST - Create Donor
**Endpoint:** `POST /api/donors`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "total": 0,
  "status": "Active",
  "tags": ["new"]
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, max 100 characters |
| `email` | String | Required, must be valid email, unique |
| `total` | Number | Optional, defaults to 0, must be non-negative |
| `lastDonation` | DateTime | Optional, ISO 8601 format |
| `status` | Enum | Required, must be: "Active", "Inactive", or "Pending" |
| `tags` | Array | Optional, array of strings |

**Response (Success):** 201
```json
{
  "id": 1,
  "name": "Jane Smith",
  "email": "jane@example.com",
  "total": 0,
  "lastDonation": null,
  "status": "Active",
  "tags": ["new"],
  "donations": []
}
```

---

### PUT - Update Donor
**Endpoint:** `PUT /api/donors`

**Request Body:**
```json
{
  "id": 1,
  "status": "Inactive",
  "tags": ["major-donor", "inactive"]
}
```

**Notes:** All fields except `id` are optional. Same validation rules apply as POST.

---

### DELETE - Delete Donor
**Endpoint:** `DELETE /api/donors?id=1`

**Response (Success):**
```json
{
  "message": "Donor deleted successfully"
}
```

---

## Campaigns

### GET - Fetch Campaigns
**Endpoint:** `GET /api/campaigns`

**Query Parameters:**
- `id` (optional): Get a specific campaign by ID

**Response (Success):**
```json
[
  {
    "id": 1,
    "name": "Water Project 2026",
    "goal": 50000,
    "raised": 35000,
    "startDate": "2026-01-01T00:00:00Z",
    "endDate": "2026-12-31T23:59:59Z",
    "description": "Building a water well in rural areas",
    "events": [...],
    "donations": [...]
  }
]
```

---

### POST - Create Campaign
**Endpoint:** `POST /api/campaigns`

**Request Body:**
```json
{
  "name": "Water Project 2026",
  "goal": 50000,
  "raised": 0,
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T23:59:59Z",
  "description": "Building a water well in rural areas"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, max 200 characters |
| `goal` | Number | Required, must be positive |
| `raised` | Number | Optional, defaults to 0, must be non-negative |
| `startDate` | DateTime | Required, ISO 8601 format |
| `endDate` | DateTime | Required, ISO 8601 format, must be after startDate |
| `description` | String | Required |

**Response (Success):** 201
```json
{
  "id": 1,
  "name": "Water Project 2026",
  "goal": 50000,
  "raised": 0,
  "startDate": "2026-01-01T00:00:00Z",
  "endDate": "2026-12-31T23:59:59Z",
  "description": "Building a water well in rural areas",
  "events": [],
  "donations": []
}
```

---

### PUT - Update Campaign
**Endpoint:** `PUT /api/campaigns`

**Request Body:**
```json
{
  "id": 1,
  "goal": 60000,
  "description": "Updated description"
}
```

**Notes:** All fields except `id` are optional. Date validation applies when updating dates.

---

### DELETE - Delete Campaign
**Endpoint:** `DELETE /api/campaigns?id=1`

**Response (Success):**
```json
{
  "message": "Campaign deleted successfully"
}
```

---

## Events

### GET - Fetch Events
**Endpoint:** `GET /api/events`

**Query Parameters:**
- `id` (optional): Get a specific event by ID

**Response (Success):**
```json
[
  {
    "id": 1,
    "name": "Fundraising Gala",
    "date": "2026-02-15T19:00:00Z",
    "description": "Annual fundraising gala event",
    "image": "https://example.com/image.jpg",
    "campaignId": 1,
    "campaign": {...}
  }
]
```

---

### POST - Create Event
**Endpoint:** `POST /api/events`

**Request Body:**
```json
{
  "name": "Fundraising Gala",
  "date": "2026-02-15T19:00:00Z",
  "description": "Annual fundraising gala event",
  "image": "https://example.com/image.jpg",
  "campaignId": 1
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `name` | String | Required, max 200 characters |
| `date` | DateTime | Required, ISO 8601 format |
| `description` | String | Required |
| `image` | String | Optional, must be valid URL |
| `campaignId` | Number | Optional, must be valid campaign ID if provided |

**Response (Success):** 201
```json
{
  "id": 1,
  "name": "Fundraising Gala",
  "date": "2026-02-15T19:00:00Z",
  "description": "Annual fundraising gala event",
  "image": "https://example.com/image.jpg",
  "campaignId": 1,
  "campaign": {...}
}
```

**Error Response - Campaign not found:**
```json
{
  "error": "Campaign not found"
}
```

---

### PUT - Update Event
**Endpoint:** `PUT /api/events`

**Request Body:**
```json
{
  "id": 1,
  "name": "Annual Gala 2026"
}
```

---

### DELETE - Delete Event
**Endpoint:** `DELETE /api/events?id=1`

**Response (Success):**
```json
{
  "message": "Event deleted successfully"
}
```

---

## Donations

### GET - Fetch Donations
**Endpoint:** `GET /api/donations`

**Query Parameters:**
- `id` (optional): Get a specific donation by ID
- `donorId` (optional): Get donations by a specific donor
- `campaignId` (optional): Get donations for a specific campaign

**Response (Success):**
```json
[
  {
    "id": 1,
    "amount": 500,
    "date": "2026-01-10T14:30:00Z",
    "donorId": 1,
    "campaignId": 1,
    "donor": {...},
    "campaign": {...}
  }
]
```

---

### POST - Create Donation
**Endpoint:** `POST /api/donations`

**Request Body:**
```json
{
  "amount": 500,
  "date": "2026-01-10T14:30:00Z",
  "donorId": 1,
  "campaignId": 1
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `amount` | Number | Required, must be positive |
| `date` | DateTime | Required, ISO 8601 format |
| `donorId` | Number | Required, must be valid donor ID |
| `campaignId` | Number | Optional, must be valid campaign ID if provided |

**Response (Success):** 201
```json
{
  "id": 1,
  "amount": 500,
  "date": "2026-01-10T14:30:00Z",
  "donorId": 1,
  "campaignId": 1,
  "donor": {...},
  "campaign": {...}
}
```

**Auto-Updates on Creation:**
- Donor's `total` amount is recalculated
- Donor's `lastDonation` is updated
- Campaign's `raised` amount is recalculated (if campaignId provided)

---

### PUT - Update Donation
**Endpoint:** `PUT /api/donations`

**Request Body:**
```json
{
  "id": 1,
  "amount": 750
}
```

**Notes:** Updating a donation automatically recalculates donor totals and campaign raised amounts.

---

### DELETE - Delete Donation
**Endpoint:** `DELETE /api/donations?id=1`

**Response (Success):**
```json
{
  "message": "Donation deleted successfully"
}
```

**Auto-Updates on Deletion:**
- Donor's `total` amount is recalculated
- Campaign's `raised` amount is recalculated

---

## Notifications

### GET - Fetch Notifications
**Endpoint:** `GET /api/notifications`

**Query Parameters:**
- `id` (optional): Get a specific notification by ID
- `unread` (optional): Set to "true" to get only unread notifications

**Response (Success):**
```json
[
  {
    "id": 1,
    "type": "Success",
    "message": "Donation received successfully",
    "date": "2026-01-15T10:00:00Z",
    "read": false
  }
]
```

---

### POST - Create Notification
**Endpoint:** `POST /api/notifications`

**Request Body:**
```json
{
  "type": "Success",
  "message": "Donation received successfully",
  "date": "2026-01-15T10:00:00Z",
  "read": false
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `type` | Enum | Required, must be: "Info", "Warning", "Error", or "Success" |
| `message` | String | Required, max 500 characters |
| `date` | DateTime | Required, ISO 8601 format |
| `read` | Boolean | Optional, defaults to false |

**Response (Success):** 201
```json
{
  "id": 1,
  "type": "Success",
  "message": "Donation received successfully",
  "date": "2026-01-15T10:00:00Z",
  "read": false
}
```

---

### PUT - Update Notification
**Endpoint:** `PUT /api/notifications`

**Request Body:**
```json
{
  "id": 1,
  "read": true
}
```

---

### DELETE - Delete Notification
**Endpoint:** `DELETE /api/notifications?id=1`

**Response (Success):**
```json
{
  "message": "Notification deleted successfully"
}
```

---

## Logins

### POST - Login
**Endpoint:** `POST /api/logins`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Validation Rules:**
| Field | Type | Rules |
|-------|------|-------|
| `email` | String | Required, must be valid email |
| `password` | String | Required, minimum 6 characters |

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "restrictions": [],
    "online": true
  }
}
```

**Error Response - Invalid credentials:**
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

**Note:** Password verification is currently a basic implementation. In production, implement proper password hashing (bcrypt, argon2, etc.) and secure comparison.

---

### PUT - Update Login Status
**Endpoint:** `PUT /api/logins`

**Request Body:**
```json
{
  "adminId": 1,
  "online": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "admin": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "Admin",
    "restrictions": [],
    "online": false,
    "changes": []
  }
}
```

---

## Error Handling

### Common Error Responses

**400 Bad Request - Missing ID:**
```json
{
  "error": "Admin ID is required"
}
```

**400 Bad Request - Validation Failed:**
```json
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

**404 Not Found:**
```json
{
  "error": "Admin not found"
}
```

**409 Conflict - Unique Constraint:**
```json
{
  "error": "A donor with this email already exists"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Failed to create admin",
  "details": "Database connection error"
}
```

---

## Usage Examples

### Example 1: Create a Donor and Add a Donation

```javascript
// Step 1: Create a donor
const donorResponse = await fetch('/api/donors', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'Active'
  })
});

const donor = await donorResponse.json();

// Step 2: Create a donation for this donor
const donationResponse = await fetch('/api/donations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 500,
    date: new Date().toISOString(),
    donorId: donor.id,
    campaignId: 1
  })
});

const donation = await donationResponse.json();
console.log('Donation created:', donation);
```

### Example 2: Get All Unread Notifications

```javascript
const response = await fetch('/api/notifications?unread=true');
const notifications = await response.json();
console.log('Unread notifications:', notifications);
```

### Example 3: Update a Campaign

```javascript
const response = await fetch('/api/campaigns', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 1,
    goal: 60000,
    description: 'Updated campaign description'
  })
});

const updatedCampaign = await response.json();
console.log('Campaign updated:', updatedCampaign);
```

---

## Data Type Reference

### DateTime Format
All date/time fields must be in ISO 8601 format:
- `"2026-01-15T10:30:00Z"`
- `"2026-01-15T10:30:00.000Z"`
- `new Date().toISOString()` in JavaScript

### Enums

**Admin Role:**
- `Super Admin`
- `Admin`
- `Manager`
- `Viewer`

**Donor Status:**
- `Active`
- `Inactive`
- `Pending`

**Notification Type:**
- `Info`
- `Warning`
- `Error`
- `Success`

---

## Validation Summary

All APIs validate:
- ✅ Required fields are present
- ✅ Data types match schema
- ✅ String length constraints
- ✅ Number ranges (positive, non-negative)
- ✅ Email format validation
- ✅ URL format validation
- ✅ Enum values
- ✅ Date comparisons (end > start)
- ✅ Foreign key references (donor exists, campaign exists, etc.)
- ✅ Unique constraints (email uniqueness)

---
