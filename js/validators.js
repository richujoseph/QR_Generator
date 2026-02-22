/**
 * ══════════════════════════════════════════════════
 *  URL Validation Utilities
 * ══════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';

/**
 * Normalise a URL — adds https:// if protocol is missing.
 * @param {string} raw
 * @returns {string}
 */
export function normalizeUrl(raw) {
    const trimmed = raw.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return 'https://' + trimmed;
}

/**
 * Validate a URL string.
 * Returns an object: { valid: boolean, error?: string, url?: string }
 * @param {string} raw
 * @returns {{ valid: boolean, error?: string, url?: string }}
 */
export function validateUrl(raw) {
    const trimmed = raw.trim();

    if (!trimmed) {
        return { valid: false, error: 'Please enter a URL' };
    }

    if (trimmed.length > CONFIG.validation.maxUrlLength) {
        return { valid: false, error: `URL is too long (max ${CONFIG.validation.maxUrlLength} characters)` };
    }

    const url = normalizeUrl(trimmed);

    // Use the built-in URL constructor for robust validation
    try {
        const parsed = new URL(url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return { valid: false, error: 'Only HTTP and HTTPS URLs are supported' };
        }
        return { valid: true, url };
    } catch {
        return { valid: false, error: 'Please enter a valid URL' };
    }
}
