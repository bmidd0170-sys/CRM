# Account Switching Implementation

## Overview
When using a different account (login/switching users), the system now automatically updates the account name to the current user's name in the session storage.

## Changes Made

### 1. **lib/admin-storage.ts**
Added a new dedicated function for updating the admin name when switching accounts:

```typescript
/**
 * Update admin name when switching accounts
 * @param name - The new admin name
 */
export function updateAdminName(name: string): void {
  updateAdminField('name', name);
}
```

**Benefit**: Provides a clear, explicit API for updating the admin name when switching accounts.

### 2. **app/components/LoginOverlay.tsx**
Updated both login and registration flows to explicitly update the admin name:

#### During Login:
```typescript
if (loginData.admin) {
    storeAdminData(loginData.admin);
    // Ensure the name is set to the current user's name
    updateAdminName(loginData.admin.name);
}
```

#### During Registration:
```typescript
if (adminData.admin || adminData.data) {
    const admin = adminData.admin || adminData.data;
    storeAdminData(admin);
    // Ensure the name is set to the current user's name
    updateAdminName(admin.name);
}
```

## How It Works

1. When a user logs in with a different account, the login API returns the admin data (which includes their name)
2. The `LoginOverlay` component receives this data and:
   - Stores the complete admin data using `storeAdminData()`
   - Explicitly updates the name field using `updateAdminName()`
3. The session storage now contains the correct name for the currently logged-in user
4. All UI components using `getAdminName()` will display the current user's name

## Functions Available

### Getting Admin Name
```typescript
import { getAdminName } from '@/lib/admin-storage';

const currentUserName = getAdminName(); // Returns the current user's name
```

### Updating Admin Name
```typescript
import { updateAdminName } from '@/lib/admin-storage';

updateAdminName('New Name'); // Updates the stored admin name
```

## Session Storage Structure
The admin data stored in `sessionStorage` under the key `currentAdmin` includes:
- `id`: Admin ID
- `name`: Admin name (now explicitly updated on account switch)
- `email`: Admin email
- `role`: Admin role
- `restrictions`: Array of restrictions
- `online`: Online status
- `changes`: Array of changes log
- `organizationName`: Organization name

## Testing

To verify the implementation:
1. Register or login with one account
2. Logout and login with a different account
3. The stored `currentAdmin` in sessionStorage should have the new account's name
4. All components displaying the admin name should show the correct current user's name

Example in browser console:
```javascript
JSON.parse(sessionStorage.getItem('currentAdmin')).name // Should show current user's name
```
