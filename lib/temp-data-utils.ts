// Utility functions for managing temporary/static data

/**
 * Clears all temporary data when a user registers or logs in
 * This includes:
 * - Browser localStorage
 * - Browser sessionStorage
 * - API call to backend to clear server-side caches
 * - Reports and report-related data
 */
export async function clearTemporaryData() {
  try {
    // Preserve the currentAdmin data before clearing
    const currentAdmin = sessionStorage.getItem('currentAdmin');
    
    // Clear client-side storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Restore the currentAdmin data after clearing
    if (currentAdmin) {
      sessionStorage.setItem('currentAdmin', currentAdmin);
    }

    // Call backend API to clear server-side temporary data
    const response = await fetch('/api/clear-temp-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.warn('Failed to clear server-side temporary data:', response.statusText);
    }

    return true;
  } catch (error) {
    console.error('Error clearing temporary data:', error);
    return false;
  }
}

/**
 * Clears specific localStorage items
 * @param keys - Array of localStorage keys to clear
 */
export function clearLocalStorageItems(keys: string[]) {
  keys.forEach(key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove localStorage item: ${key}`, error);
    }
  });
}

/**
 * Clears specific sessionStorage items
 * @param keys - Array of sessionStorage keys to clear
 */
export function clearSessionStorageItems(keys: string[]) {
  keys.forEach(key => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Failed to remove sessionStorage item: ${key}`, error);
    }
  });
}

/**
 * Gets all keys from localStorage that match a pattern
 * @param pattern - String or RegExp pattern to match
 */
export function getLocalStorageKeysByPattern(pattern: string | RegExp): string[] {
  const keys: string[] = [];
  const regexPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && regexPattern.test(key)) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Gets all keys from sessionStorage that match a pattern
 * @param pattern - String or RegExp pattern to match
 */
export function getSessionStorageKeysByPattern(pattern: string | RegExp): string[] {
  const keys: string[] = [];
  const regexPattern = pattern instanceof RegExp ? pattern : new RegExp(pattern);

  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key && regexPattern.test(key)) {
      keys.push(key);
    }
  }

  return keys;
}

/**
 * Clears all temporary data related to donations
 * Useful when starting fresh with a new organization
 */
export function clearDonationTempData() {
  // Clear donations from localStorage
  const donationKeys = getLocalStorageKeysByPattern(/donation/i);
  const campaignKeys = getLocalStorageKeysByPattern(/campaign/i);
  const filterKeys = getLocalStorageKeysByPattern(/filter|sort|search/i);

  clearLocalStorageItems([...donationKeys, ...campaignKeys, ...filterKeys]);

  // Clear from sessionStorage
  const sessionDonationKeys = getSessionStorageKeysByPattern(/donation/i);
  const sessionCampaignKeys = getSessionStorageKeysByPattern(/campaign/i);
  const sessionFilterKeys = getSessionStorageKeysByPattern(/filter|sort|search/i);

  clearSessionStorageItems([...sessionDonationKeys, ...sessionCampaignKeys, ...sessionFilterKeys]);
}

/**
 * Clears all temporary data related to reports
 * Useful when starting fresh with a new organization
 */
export function clearReportsTempData() {
  // Clear reports from localStorage
  const reportKeys = getLocalStorageKeysByPattern(/report/i);
  const followUpKeys = getLocalStorageKeysByPattern(/followup|follow-up|follow_up/i);
  const actionKeys = getLocalStorageKeysByPattern(/action/i);

  clearLocalStorageItems([...reportKeys, ...followUpKeys, ...actionKeys]);

  // Clear from sessionStorage
  const sessionReportKeys = getSessionStorageKeysByPattern(/report/i);
  const sessionFollowUpKeys = getSessionStorageKeysByPattern(/followup|follow-up|follow_up/i);
  const sessionActionKeys = getSessionStorageKeysByPattern(/action/i);

  clearSessionStorageItems([...sessionReportKeys, ...sessionFollowUpKeys, ...sessionActionKeys]);
}

/**
 * Clears all form data and input values
 * Useful for resetting the application state
 */
export function clearFormData() {
  // Remove all form-related data from storage
  const formKeys = getLocalStorageKeysByPattern(/form|input|data/i);
  clearLocalStorageItems(formKeys);

  const sessionFormKeys = getSessionStorageKeysByPattern(/form|input|data/i);
  clearSessionStorageItems(sessionFormKeys);
}

/**
 * Resets application state completely
 * Called when a new user registers or logs in
 */
export async function resetApplicationState() {
  try {
    // Clear all temporary data
    clearTemporaryData();

    // Clear specific data categories
    clearDonationTempData();
    clearReportsTempData();
    clearFormData();

    // Reset any in-memory caches (if you have them)
    // Example: window.__cache__ = null;

    console.log('Application state reset successfully');
    return true;
  } catch (error) {
    console.error('Error resetting application state:', error);
    return false;
  }
}
