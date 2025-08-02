/**
 * CSRF Protection utility
 * Generate and validate CSRF tokens for forms
 */

const CSRF_TOKEN_KEY = 'csrf_token';
const CSRF_TOKEN_HEADER = 'X-CSRF-Token';

/**
 * Generate a CSRF token and store it in sessionStorage
 */
export function generateCSRFToken(): string {
  // Use crypto.randomUUID for better randomness if available
  const token = crypto.randomUUID?.() || 
    crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
  
  sessionStorage.setItem(CSRF_TOKEN_KEY, token);
  return token;
}

/**
 * Get the current CSRF token from sessionStorage
 */
export function getCSRFToken(): string | null {
  return sessionStorage.getItem(CSRF_TOKEN_KEY);
}

/**
 * Validate CSRF token
 */
export function validateCSRFToken(token: string): boolean {
  const storedToken = getCSRFToken();
  return storedToken !== null && storedToken === token;
}

/**
 * Add CSRF token to request headers
 */
export function addCSRFHeaders(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken();
  if (token) {
    return {
      ...headers,
      [CSRF_TOKEN_HEADER]: token
    };
  }
  return headers;
}

/**
 * Create a hidden CSRF input for forms
 */
export function createCSRFInput(): HTMLInputElement {
  const input = document.createElement('input');
  input.type = 'hidden';
  input.name = 'csrf_token';
  input.value = getCSRFToken() || generateCSRFToken();
  return input;
}