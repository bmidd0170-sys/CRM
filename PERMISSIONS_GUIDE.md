# Permission System Guide

## Overview

The CRM now has a comprehensive permission system that controls what actions admins can perform based on their role and restrictions. This ensures proper access control across all areas of the system.

## How It Works

### Permission Hierarchy

1. **Super Admins**: Have full access to all features and can perform any action
2. **Regular Admins**: Have permissions based on their assigned restrictions

### Admin Restrictions

Restrictions are stored as an array of strings in the Admin model. They can be:

1. **Action-based restrictions**:
   - `"No Delete"` - Cannot delete any resources
   - `"No Edit"` - Cannot create or update any resources

2. **Resource-based restrictions**:
   - `"donors"` - No access to donors area
   - `"campaigns"` - No access to campaigns area
   - `"events"` - No access to events area
   - `"donations"` - No access to donations area
   - `"notifications"` - No access to notifications area
   - `"admins"` - No access to admin management
   - `"reports"` - No access to reports
   - `"settings"` - No access to settings

3. **Combined restrictions** (more specific):
   - `"No Delete donors"` - Can view/edit donors but cannot delete them
   - `"No Edit campaigns"` - Can view campaigns but cannot create/edit them
   - `"No Create events"` - Can view/edit/delete events but cannot create new ones

### Permission Levels

The system checks permissions from most specific to least specific:

1. Combined restrictions (e.g., "No Delete donors")
2. Resource restrictions (e.g., "donors")
3. Action restrictions (e.g., "No Delete")
4. Super Admin override (always allowed)

## Backend Implementation

### Database Helper Functions

Located in `lib/db.ts`:

```typescript
// Check if admin has permission
await checkPermission(adminId, 'donors', 'delete')
// Returns: { allowed: boolean, reason?: string }

// Verify permission (with error response)
await verifyPermission(adminId, 'donors', 'create')
// Returns: { authorized: true } | { authorized: false, status: number, error: string }
```

### API Route Usage

All API routes now check permissions before performing operations:

```typescript
export async function DELETE(request: Request) {
  // Check permissions
  const adminId = getAdminIdFromRequest(request);
  const permission = await verifyPermission(adminId, 'donors', 'delete');
  
  if (!permission.authorized) {
    return NextResponse.json(
      { error: permission.error }, 
      { status: permission.status }
    );
  }
  
  // Proceed with operation...
}
```

### Protected Endpoints

All create, update, and delete operations are now protected:

- **Donors API**: Create, Update, Delete
- **Campaigns API**: Create, Update, Delete
- **Events API**: Create, Update, Delete
- **Donations API**: Create, Update, Delete
- **Notifications API**: Create, Update, Delete
- **Admins API**: Create, Update

## Frontend Implementation

### Client-Side Permission Checks

Located in `lib/admin-storage.ts`:

```typescript
// Import permission functions
import { canDelete, canEdit, canCreate, hasPermission } from '@/lib/admin-storage';

// Check specific permissions
const canDeleteDonors = canDelete('donors');
const canEditCampaigns = canEdit('campaigns');
const canCreateEvents = canCreate('events');

// General permission check
const hasAccess = hasPermission('update', 'donors');
```

### UI Component Integration

Components automatically hide/show actions based on permissions:

```tsx
export default function DonorsPage() {
  const [canDeleteDonors, setCanDeleteDonors] = useState(false);
  
  useEffect(() => {
    setCanDeleteDonors(canDelete('donors'));
  }, []);
  
  return (
    // Only show delete button if admin has permission
    {canDeleteDonors && (
      <button onClick={handleDelete}>Delete</button>
    )}
  );
}
```

## Examples

### Example 1: Admin with "No Delete" Restriction

```json
{
  "name": "Bob Lee",
  "role": "Admin",
  "restrictions": ["No Delete"]
}
```

**Allowed**: View, Create, Update all resources
**Denied**: Delete any resource

### Example 2: Admin Restricted from Donors

```json
{
  "name": "Jane Smith",
  "role": "Admin",
  "restrictions": ["donors"]
}
```

**Allowed**: Full access to campaigns, events, donations, etc.
**Denied**: Any action on donors (create, read, update, delete)

### Example 3: Admin with Specific Restrictions

```json
{
  "name": "John Doe",
  "role": "Admin",
  "restrictions": ["No Delete donors", "campaigns"]
}
```

**Allowed**: 
- View, Create, Update donors (but not delete)
- Full access to events, donations, notifications

**Denied**:
- Delete donors
- Any access to campaigns

### Example 4: Super Admin

```json
{
  "name": "Alice Smith",
  "role": "Super Admin",
  "restrictions": []
}
```

**Allowed**: Everything - restrictions are ignored for Super Admins

## API Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized: Admin authentication required"
}
```
Returned when no admin ID is provided or admin is not logged in.

### 403 Forbidden
```json
{
  "error": "Forbidden: Admin does not have delete permissions"
}
```
Returned when admin lacks the required permission.

Possible reasons:
- "Admin not found"
- "Admin does not have delete permissions"
- "Admin does not have edit permissions"
- "Admin does not have access to {resource}"
- "Admin cannot {action} {resource}"

## Testing Permissions

### Creating Test Admins

```javascript
// Super Admin (full access)
{
  email: "superadmin@test.com",
  role: "Super Admin",
  restrictions: []
}

// Admin with no delete rights
{
  email: "nodelete@test.com",
  role: "Admin",
  restrictions: ["No Delete"]
}

// Admin restricted from donors
{
  email: "nocustomers@test.com",
  role: "Admin",
  restrictions: ["donors"]
}
```

### Testing API Endpoints

```bash
# Test with admin header
curl -X DELETE "http://localhost:3000/api/donors?id=1" \
  -H "x-admin-id: 2"

# Expected responses:
# - 200: Success (if admin has permission)
# - 401: Unauthorized (if no admin ID)
# - 403: Forbidden (if admin lacks permission)
```

## Best Practices

1. **Always check permissions on both client and server**
   - Client-side: Hide UI elements
   - Server-side: Enforce actual restrictions

2. **Use specific restrictions when possible**
   - Prefer `"No Delete donors"` over `"No Delete"`
   - More granular control

3. **Test permission boundaries**
   - Create test admins with various restrictions
   - Verify both allowed and denied actions

4. **Log permission denials**
   - All 403 responses include the reason
   - Use for auditing and debugging

5. **Update UI dynamically**
   - Hide buttons/forms when permissions change
   - Show appropriate messages to users

## Migration Notes

### Existing Admins

All existing admins will retain their current roles and restrictions. The system is backward compatible.

### Super Admins

Super Admins continue to have unrestricted access regardless of any restrictions in their array (which should be empty anyway).

### New Restrictions

You can add new restrictions at any time by updating the Admin model through the API or directly in the database.

## Future Enhancements

Potential additions to the permission system:

1. **Read permissions**: Control who can view certain resources
2. **Field-level permissions**: Control access to specific fields
3. **Time-based permissions**: Temporary access grants
4. **Approval workflows**: Require approval for certain actions
5. **Audit logging**: Track all permission checks and denials
