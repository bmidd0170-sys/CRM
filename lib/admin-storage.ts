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
  return getAdminRole() === 'Super Admin';
}
