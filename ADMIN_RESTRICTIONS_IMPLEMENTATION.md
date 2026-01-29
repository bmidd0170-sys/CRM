# Admin Creation & Screen Access Restrictions Implementation

## Overview
This system allows super admins to create new admin accounts with specific restrictions directly from the Settings page. When admins log in, they are limited to only the screens that their restrictions permit.

## How It Works

### 1. Creating Admins from Settings

#### In `/app/settings/page.tsx`:
- Super admins can fill in the form with:
  - **Name**: Admin's full name
  - **Email**: Login email address
  - **Password**: Login password (minimum 6 characters)
  - **Confirm Password**: Password confirmation
  - **Role**: Super Admin or Admin
  - **Restrictions**: Checkboxes for specific restrictions

#### Restrictions Available:
- **No Delete**: Cannot delete records
- **No Edit Donors**: Cannot edit donor information
- **No Access Reports**: Cannot view the Reports page
- **No Manage Events**: Cannot manage events
- **No Manage Admins**: Cannot manage admins or access settings

### 2. Admin Storage in Database

When an admin is created:
1. The form data is sent to `/api/admins` (POST request)
2. The password is hashed using PBKDF2 with 100,000 iterations
3. Admin record is saved to the database with:
   - Name, email, hashed password
   - Role (Admin or Super Admin)
   - Restrictions array
   - Organization name
   - Online status (initially false)
   - Changes log (empty array)

### 3. Login with Restrictions

When an admin logs in at `/api/logins`:
1. Email and password are verified
2. Admin data is returned including the restrictions array
3. Admin data is stored in `sessionStorage` (client-side)
4. The restrictions array is available throughout the session

### 4. Screen Access Control

#### Sidebar Filtering (`/app/components/Sidebar.tsx`):
- The sidebar dynamically filters menu items based on admin restrictions
- Restricted screens are hidden from the navigation menu
- Uses `canAccessScreen()` helper function from `admin-storage.ts`

#### Page-Level Protection (`/app/components/ProtectedPage.tsx`):
- A wrapper component that protects individual pages
- If an admin tries to access a restricted page directly (via URL):
  1. Access check is performed
  2. If restricted, shows "Access Restricted" message
  3. Automatically redirects to dashboard after 2 seconds
- Implemented on: Donors, Events, Reports, Notifications

### 5. Screen Access Mapping

The system maps restrictions to specific screens:

```typescript
{
  '/donors': ['No Edit Donors'],
  '/reports': ['No Access Reports'],
  '/events': ['No Manage Events'],
  '/notifications': ['No Manage Notifications'],
  '/admins': ['No Manage Admins'],
  '/settings': ['No Manage Admins'],
  '/ai-policy': ['No Manage Admins']
}
```

## Key Files & Functions

### Core Files Modified/Created:

1. **`lib/admin-storage.ts`** (Updated)
   - `canAccessScreen(screenName: string)`: Check if admin can access a screen
   - `getAccessibleScreens()`: Get list of accessible screens for current admin

2. **`lib/page-access.ts`** (New)
   - `isPathAllowed()`: Verify path access based on restrictions
   - `getRedirectUrl()`: Get safe redirect URL

3. **`app/components/ProtectedPage.tsx`** (New)
   - Wrapper component for protecting pages
   - Shows restriction message and redirects if needed

4. **`app/settings/page.tsx`** (Updated)
   - Added password fields (password, confirm password)
   - Form now sends data to `/api/admins` endpoint
   - Shows success/error messages

5. **`app/components/Sidebar.tsx`** (Updated)
   - Filters menu items based on `canAccessScreen()`
   - Only shows accessible screens in navigation

6. **`app/reports/page.tsx`** (Updated)
   - Wrapped with `<ProtectedPage screenName="Reports">`

7. **`app/events/page.tsx`** (Updated)
   - Wrapped with `<ProtectedPage screenName="Events">`

8. **`app/notifications/page.tsx`** (Updated)
   - Wrapped with `<ProtectedPage screenName="Notifications">`

9. **`app/donors/page.tsx`** (Updated)
   - Wrapped with `<ProtectedPage screenName="Donors">`

## Usage Example

### Creating a Restricted Admin

1. Log in as Super Admin
2. Go to Settings → Manage Admins
3. Fill in admin details:
   - Name: "John Smith"
   - Email: "john@example.com"
   - Password: "secure123"
   - Role: "Admin"
   - Restrictions: Check "No Delete", "No Access Reports"
4. Click "Create Admin"
5. Admin is saved to database with restrictions

### Using Restricted Admin Account

1. Admin logs in with created credentials
2. In sidebar:
   - Can see: Dashboard, Donors, Donations, Campaigns, Events, Notifications, Settings
   - Cannot see: Reports (restricted by "No Access Reports"), Admins (restricted by "No Manage Admins")
3. If admin tries to access Reports via URL:
   - ProtectedPage component prevents access
   - Shows restriction message
   - Redirects to dashboard

## Security Features

- ✅ Passwords hashed with PBKDF2 (100,000 iterations)
- ✅ Client-side session storage for restrictions
- ✅ Server-side validation of permissions
- ✅ Multiple layers of access control:
  1. Sidebar filtering (UX)
  2. Page-level protection (client-side)
  3. API endpoint validation (server-side)

## Future Enhancements

- Add edit/update functionality for existing admin restrictions
- Add ability to revoke admin access
- Add audit logging for admin creation and modifications
- Add role-based permissions (beyond Super Admin/Admin)
- Add batch admin creation
- Add admin deactivation instead of deletion
