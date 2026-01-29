/**
 * Admin Storage Utilities
 * Functions to manage and retrieve logged-in admin data from session storage
 */

export interface AdminData {
  id: number;
  name: string;
  email: string;
  role: string;
  restrictions: string[];
  online: boolean;
  changes: string[];
}

/**
 * Store admin data in sessionStorage after login/registration
 * @param admin - Admin data to store
 */
export function storeAdminData(admin: AdminData): void {
  try {
    sessionStorage.setItem('currentAdmin', JSON.stringify(admin));
  } catch (error) {
    console.error('Error storing admin data:', error);
  }
}

/**
 * Retrieve admin data from sessionStorage
 * @returns Admin data or null if not found
 */
export function getAdminData(): AdminData | null {
  try {
    const adminData = sessionStorage.getItem('currentAdmin');
    return adminData ? JSON.parse(adminData) : null;
  } catch (error) {
    console.error('Error retrieving admin data:', error);
    return null;
  }
}

/**
 * Check if admin is logged in (data exists in storage)
 * @returns true if admin is logged in
 */
export function isAdminLoggedIn(): boolean {
  return getAdminData() !== null;
}

/**
 * Clear admin data from sessionStorage (logout)
 */
export function clearAdminData(): void {
  try {
    sessionStorage.removeItem('currentAdmin');
  } catch (error) {
    console.error('Error clearing admin data:', error);
  }
}

/**
 * Logout admin and redirect to home page
 */
export function handleLogout(): void {
  clearAdminData();
  if (typeof window !== 'undefined') {
    window.location.href = '/';
  }
}

/**
 * Update specific admin field in storage
 * @param field - Field name to update
 * @param value - New value
 */
export function updateAdminField<K extends keyof AdminData>(field: K, value: AdminData[K]): void {
  try {
    const admin = getAdminData();
    if (admin) {
      admin[field] = value;
      storeAdminData(admin);
    }
  } catch (error) {
    console.error('Error updating admin field:', error);
  }
}

/**
 * Get specific admin field
 * @param field - Field name to retrieve
 * @returns Field value or null if not found
 */
export function getAdminField(field: keyof AdminData): any {
  try {
    const admin = getAdminData();
    return admin ? admin[field] : null;
  } catch (error) {
    console.error('Error getting admin field:', error);
    return null;
  }
}

/**
 * Update admin name when switching accounts
 * @param name - The new admin name
 */
export function updateAdminName(name: string): void {
  updateAdminField('name', name);
}

/**
 * Get admin name
 * @returns Admin name or empty string
 */
export function getAdminName(): string {
  return getAdminField('name') || '';
}

/**
 * Get admin email
 * @returns Admin email or empty string
 */
export function getAdminEmail(): string {
  return getAdminField('email') || '';
}

/**
 * Get admin role
 * @returns Admin role or empty string
 */
export function getAdminRole(): string {
  return getAdminField('role') || '';
}

/**
 * Check if admin is online
 * @returns true if admin is online
 */
export function isAdminOnline(): boolean {
  return getAdminField('online') || false;
}

/**
 * Get admin restrictions
 * @returns Array of restrictions or empty array
 */
export function getAdminRestrictions(): string[] {
  return getAdminField('restrictions') || [];
}

/**
 * Get admin changes log
 * @returns Array of changes or empty array
 */
export function getAdminChanges(): string[] {
  return getAdminField('changes') || [];
}

/**
 * Get admin ID
 * @returns Admin ID or null
 */
export function getAdminId(): number | null {
  return getAdminField('id');
}

/**
 * Check if the current admin is a Super Admin
 * @returns true if admin is a Super Admin
 */
export function isSuperAdmin(): boolean {
  const role = (getAdminRole() || '').toLowerCase().replace(/\s+/g, '');
  return role === 'superadmin';
}

/**
 * Check if admin has permission to perform an action
 * Super Admins always have full permissions
 * @param action - Action to perform: 'create', 'read', 'update', 'delete'
 * @param resource - Resource to act on: 'donors', 'campaigns', 'events', etc.
 * @returns true if admin has permission
 */
export function hasPermission(action: 'create' | 'read' | 'update' | 'delete', resource?: string): boolean {
  // Super Admins always have all permissions
  if (isSuperAdmin()) {
    return true;
  }

  const restrictions = getAdminRestrictions();
  
  // Check for "No Delete" restriction
  if (action === 'delete' && restrictions.includes('No Delete')) {
    return false;
  }

  // Check for "No Edit" restriction (covers both create and update)
  if ((action === 'create' || action === 'update') && restrictions.includes('No Edit')) {
    return false;
  }

  // Check for resource-specific restrictions
  if (resource && restrictions.includes(resource)) {
    return false;
  }

  // Check for combined restrictions (e.g., "No Delete donors")
  if (resource) {
    const combinedRestriction = `No ${action.charAt(0).toUpperCase() + action.slice(1)} ${resource}`;
    if (restrictions.some(r => r.toLowerCase() === combinedRestriction.toLowerCase())) {
      return false;
    }
  }

  return true;
}

/**
 * Check if admin can delete
 * @param resource - Optional specific resource
 * @returns true if admin can delete
 */
export function canDelete(resource?: string): boolean {
  return hasPermission('delete', resource);
}

/**
 * Check if admin can edit (create or update)
 * @param resource - Optional specific resource
 * @returns true if admin can edit
 */
export function canEdit(resource?: string): boolean {
  return hasPermission('update', resource);
}

/**
 * Check if admin can create
 * @param resource - Optional specific resource
 * @returns true if admin can create
 */
export function canCreate(resource?: string): boolean {
  return hasPermission('create', resource);
}
/**
 * Check if admin can access a specific screen/page
 * @param screenName - Name of the screen (e.g., 'Donors', 'Reports', 'Events', 'Notifications')
 * @returns true if admin can access the screen
 */
export function canAccessScreen(screenName: string): boolean {
  // Super Admins always have access to all screens
  if (isSuperAdmin()) {
    return true;
  }

  const restrictions = getAdminRestrictions();
  const screenLower = screenName.toLowerCase();

  // Check for screen-specific restrictions
  const restrictionMappings: Record<string, string[]> = {
    'Donors': ['No Edit Donors'],
    'Reports': ['No Access Reports'],
    'Events': ['No Manage Events'],
    'Notifications': ['No Manage Notifications'],
    'Admins': ['No Manage Admins'],
    'Settings': ['No Manage Admins']
  };

  const screenRestrictions = restrictionMappings[screenName] || [];
  
  // If any restriction applies to this screen, deny access
  if (screenRestrictions.some(r => restrictions.includes(r))) {
    return false;
  }

  return true;
}

/**
 * Get accessible screens for current admin
 * @returns Array of accessible screen names
 */
export function getAccessibleScreens(): string[] {
  const allScreens = ['Dashboard', 'Donors', 'Donations', 'Campaigns', 'Events', 'Reports', 'Notifications', 'Settings'];
  
  if (isSuperAdmin()) {
    return [...allScreens, 'Admins', 'AI policy page'];
  }

  return allScreens.filter(screen => canAccessScreen(screen));
}