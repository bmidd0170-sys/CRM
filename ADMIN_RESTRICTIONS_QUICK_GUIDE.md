# Admin Restrictions - Quick Start Guide

## Overview
Super admins can now create restricted admin accounts directly from the Settings page. When restricted admins log in, they only see screens they have access to.

## Creating an Admin with Restrictions

### Step 1: Navigate to Settings
- Click "Settings" in the sidebar (or go to `/settings`)
- Ensure you're logged in as a Super Admin

### Step 2: Fill in Admin Form
```
Name:              [Admin Name]
Email:             [admin@example.com]
Password:          [min 6 characters]
Confirm Password:  [must match]
Role:              [Admin or Super Admin]
Restrictions:      [Check any applicable]
```

### Step 3: Select Restrictions
Available restrictions:
- ☐ **No Delete** - Cannot delete any records
- ☐ **No Edit Donors** - Cannot edit donor information or access Donors page
- ☐ **No Access Reports** - Cannot view Reports page
- ☐ **No Manage Events** - Cannot manage events or access Events page
- ☐ **No Manage Notifications** - Cannot view Notifications page
- ☐ **No Manage Admins** - Cannot manage admins, access Settings, or view AI policy

### Step 4: Click "Create Admin"
The admin is now saved to the database with restrictions applied.

## What Happens When Restricted Admin Logs In

### In the Sidebar
- Restricted screens are **hidden** from the navigation menu
- They only see accessible screens
- Menu automatically updates based on their restrictions

### If They Try to Access Restricted Screen via URL
- Page shows: "🔒 Access Restricted - You don't have permission to access this page"
- Automatically redirects to Dashboard after 2 seconds

## Restriction Mappings

| Restriction | Blocked Screens | Blocked Actions |
|---|---|---|
| No Edit Donors | Donors page | Edit/create donors |
| No Access Reports | Reports page | View reports |
| No Manage Events | Events page | Create/edit/delete events |
| No Manage Notifications | Notifications page | View notifications |
| No Manage Admins | Admins, Settings, AI policy | Manage other admins |
| No Delete | All pages | Delete any records |

## Example Scenarios

### Scenario 1: Donor Manager
```
Restrictions: None (or only "No Access Reports")
Can access: All screens except Reports
Use case: Manages donor information, donations, events
```

### Scenario 2: Report Viewer
```
Restrictions: "No Delete", "No Edit Donors", "No Manage Events"
Can access: Dashboard, Reports, Notifications
Cannot: Modify donors, delete records, manage events
Use case: Views reports and analytics, read-only access
```

### Scenario 3: Events Coordinator
```
Restrictions: "No Access Reports", "No Manage Admins", "No Edit Donors"
Can access: Dashboard, Donations, Campaigns, Events, Notifications
Cannot: View reports, manage admins, edit donors
Use case: Manages campaigns and events only
```

## How Restrictions Are Enforced

### 1. **Sidebar Level** (UX)
   - Restricted menu items are hidden
   - Admin doesn't see blocked screens in navigation

### 2. **Page Level** (Client-Side)
   - ProtectedPage component checks access
   - Blocks direct URL access to restricted pages
   - Shows access denied message and redirects

### 3. **API Level** (Server-Side)
   - API endpoints validate admin permissions
   - Requests with insufficient permissions are rejected
   - Returns 403 Forbidden error

## Testing Restrictions

### Quick Test
1. Create admin "TestUser" with "No Access Reports"
2. Logout and login as TestUser
3. Verify:
   - ✅ Reports not visible in sidebar
   - ✅ Cannot access `/reports` directly
   - ✅ Other screens work normally

### Full Test
1. Create admin with multiple restrictions
2. Try accessing each restricted screen
3. Try performing restricted actions (delete, edit, etc.)
4. All should be blocked with appropriate messages

## Common Issues & Solutions

### Issue: Can still see restricted screen in sidebar
**Solution**: Clear browser cache/sessionStorage and reload

### Issue: Admin can still access page via direct URL
**Solution**: Ensure ProtectedPage component wraps the page component

### Issue: Wrong restrictions applied
**Solution**: Verify restrictions array in database for that admin

## Security Notes

✅ **Passwords are hashed** - Never stored in plain text
✅ **Multi-layer protection** - UI, page-level, and API validation
✅ **Session-based** - Restrictions checked on every page load
✅ **Server-side enforcement** - API doesn't trust client restrictions

## What's NOT Restricted Yet

- Dashboard (all admins can view)
- Donations (all admins can view)
- Campaigns (all admins can view)

These can be restricted in future updates if needed.

## Admin Password Requirements

- Minimum 6 characters
- No maximum character limit
- Stored securely with PBKDF2 hashing
- Salt + 100,000 iterations for security

## For Admins

### You're a Restricted Admin? Here's What to Know:
- Your access is limited to protect sensitive areas
- Contact your Super Admin if you need more access
- You can still perform your assigned duties normally
- Your access changes are applied immediately on next login
