/**
 * Customer session management using localStorage
 */

const SESSION_KEY = 'customer_session';

export interface StoredSession {
  guestSessionId: string;
  restaurantId: number;
  branchId: number;
  tableId: number;
  createdAt: string;
}

/**
 * Store customer session in localStorage
 */
export const saveCustomerSession = (session: StoredSession): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch (error) {
    console.error('[CustomerSession] Failed to save session', error);
  }
};

/**
 * Get customer session from localStorage
 */
export const getCustomerSession = (): StoredSession | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(SESSION_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as StoredSession;
  } catch (error) {
    console.error('[CustomerSession] Failed to read session', error);
    return null;
  }
};

/**
 * Clear customer session from localStorage
 */
export const clearCustomerSession = (): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (error) {
    console.error('[CustomerSession] Failed to clear session', error);
  }
};

/**
 * Check if session exists and is valid
 */
export const hasValidSession = (): boolean => {
  const session = getCustomerSession();
  return session !== null && session.guestSessionId !== undefined;
};

