# Database Connection & Super Admin Delete Implementation

## Overview
This document outlines the changes made to ensure all features are connected to the PostgreSQL database and to implement delete functionality for Super Admins.

## Changes Made

### 1. Database Schema Updates (schema.prisma)
- **Cascade Delete Rules**: Added `onDelete` rules to relationships
  - `Event.campaign`: `onDelete: SetNull` - Events stay when campaign is deleted
  - `Donation.campaign`: `onDelete: SetNull` - Donations stay when campaign is deleted
  - `Donation.donor`: `onDelete: Cascade` - Donations are deleted when donor is deleted

### 2. Authorization Helpers (lib/db.ts)
Added new helper functions for authorization:
- `checkIsSuperAdmin(adminId: number)`: Verifies if an admin is a Super Admin
- `getAdminIdFromRequest(request: Request)`: Extracts admin ID from request headers

### 3. API Routes - Authorization for DELETE Operations

#### Campaigns API (app/api/campaigns/route.ts)
- Added Super Admin authorization check to DELETE endpoint
- Returns 401 if admin is not authenticated
- Returns 403 if admin is not a Super Admin
- Deletes campaign and related data based on cascade rules

#### Donors API (app/api/donors/route.ts)
- Added Super Admin authorization check to DELETE endpoint
- Returns 401 if admin is not authenticated
- Returns 403 if admin is not a Super Admin
- Deletes donor and cascades to delete all their donations

#### Events API (app/api/events/route.ts)
- Added Super Admin authorization check to DELETE endpoint
- Returns 401 if admin is not authenticated
- Returns 403 if admin is not a Super Admin
- Deletes event

### 4. Frontend Updates

#### Admin Storage Utilities (lib/admin-storage.ts)
Added new helper functions:
- `getAdminId()`: Retrieves the current admin's ID
- `isSuperAdmin()`: Checks if current admin is a Super Admin

#### Campaigns Page (app/campaigns/page.tsx)
- ✅ Already connected to database (fetches from /api/campaigns)
- Added Super Admin delete functionality
- Delete button appears only for Super Admins
- Includes confirmation dialog
- Sends admin ID in request headers
- Refreshes list after deletion

#### Events Page (app/events/page.tsx)
- ✅ Connected to database (fetches from /api/events)
- Updated to use API for creating events
- Added Super Admin delete functionality
- Delete button appears only for Super Admins
- Includes confirmation dialog
- Sends admin ID in request headers
- Refreshes list after deletion

#### Donors Page (app/donors/page.tsx)
- ✅ Already connected to database (fetches from /api/donors)
- Added Super Admin delete functionality
- Delete button in table row (Actions column) for Super Admins
- Includes confirmation dialog
- Sends admin ID in request headers
- Refreshes list after deletion

#### Donations Page (app/donations/page.tsx)
- ✅ Connected to database (fetches from /api/donations)
- Updated to display donor and campaign relationships
- Simplified filters to match database structure
- Proper date formatting

#### Notifications Page (app/notifications/page.tsx)
- ✅ Connected to database (fetches from /api/notifications)
- Proper date formatting for display

## Database Migration
A new migration was created and applied:
- Migration: `20260115204033_add_cascade_deletes`
- Successfully applied to the database

## Security Features

### Authorization Flow
1. Frontend checks if user is Super Admin to show delete buttons
2. Backend validates admin authentication via `x-admin-id` header
3. Backend verifies Super Admin role from database
4. Only Super Admins can execute delete operations

### Delete Behavior
- **Campaigns**: Deletion removes campaign; related donations and events set to null
- **Donors**: Deletion cascades to remove all their donations
- **Events**: Deletion removes event only

### Error Handling
- 401 Unauthorized: No admin authentication
- 403 Forbidden: Admin is not a Super Admin
- 404 Not Found: Resource doesn't exist
- 500 Internal Server Error: Database or server errors

## Testing Recommendations

1. **Authentication Test**
   - Try deleting without being logged in (should fail)
   - Try deleting as a regular admin (should fail)
   - Try deleting as a Super Admin (should succeed)

2. **Cascade Test**
   - Create a donor with donations, then delete the donor
   - Verify all donations are removed
   - Create a campaign with events and donations, then delete the campaign
   - Verify events and donations remain but have null campaign references

3. **Frontend Test**
   - Verify delete buttons only appear for Super Admins
   - Verify confirmation dialogs work
   - Verify lists refresh after deletion
   - Verify error messages display correctly

## API Usage

### Delete Endpoints

#### Delete Campaign
```http
DELETE /api/campaigns?id={campaignId}
Headers:
  x-admin-id: {adminId}
```

#### Delete Donor
```http
DELETE /api/donors?id={donorId}
Headers:
  x-admin-id: {adminId}
```

#### Delete Event
```http
DELETE /api/events?id={eventId}
Headers:
  x-admin-id: {adminId}
```

## Summary
- ✅ All features connected to PostgreSQL database
- ✅ Super Admin delete functionality implemented for campaigns, donors, and events
- ✅ Proper authorization checks in place
- ✅ Cascade delete rules configured
- ✅ Frontend UI updated with delete buttons
- ✅ Database migration applied successfully
