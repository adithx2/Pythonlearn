/**
 * Base URL for all API requests.
 *
 * In development (via Vite proxy) this is empty so '/api/...' routes
 * go through the local proxy configured in vite.config.js.
 *
 * In production on Vercel, VITE_API_URL must be set to the Render
 * server URL (e.g. https://pythonlearn-api.onrender.com).
 */
export const API_BASE = import.meta.env.VITE_API_URL ?? '';

/**
 * Build an absolute API path that works in both dev and prod.
 * @param {string} path - must start with /api/
 */
export const apiUrl = (path) => `${API_BASE}${path}`;
