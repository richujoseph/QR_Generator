/**
 * ══════════════════════════════════════════════════
 *  QR History — persisted via localStorage
 * ══════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';

/**
 * @typedef {Object} HistoryEntry
 * @property {string} url
 * @property {number} timestamp
 * @property {string} id
 */

/**
 * Load history from localStorage.
 * @returns {HistoryEntry[]}
 */
export function loadHistory() {
    try {
        const raw = localStorage.getItem(CONFIG.history.storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

/**
 * Save history array to localStorage.
 * @param {HistoryEntry[]} entries
 */
function persist(entries) {
    try {
        localStorage.setItem(CONFIG.history.storageKey, JSON.stringify(entries));
    } catch {
        // storage full — silently drop
    }
}

/**
 * Add a URL to the history. Deduplicates and caps at maxItems.
 * @param {string} url
 * @returns {HistoryEntry[]} updated list
 */
export function addToHistory(url) {
    let entries = loadHistory();

    // Remove duplicate if exists
    entries = entries.filter(e => e.url !== url);

    // Prepend new entry
    entries.unshift({
        url,
        timestamp: Date.now(),
        id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    });

    // Cap
    if (entries.length > CONFIG.history.maxItems) {
        entries = entries.slice(0, CONFIG.history.maxItems);
    }

    persist(entries);
    return entries;
}

/**
 * Remove an entry by id.
 * @param {string} id
 * @returns {HistoryEntry[]}
 */
export function removeFromHistory(id) {
    let entries = loadHistory();
    entries = entries.filter(e => e.id !== id);
    persist(entries);
    return entries;
}

/**
 * Clear all history entries.
 * @returns {HistoryEntry[]}
 */
export function clearHistory() {
    persist([]);
    return [];
}

/**
 * Format a timestamp to a short relative string.
 * @param {number} ts
 * @returns {string}
 */
/**
 * Get all history entries (alias for loadHistory).
 * @returns {HistoryEntry[]}
 */
export function getHistory() {
    return loadHistory();
}

export function formatTimeAgo(ts) {
    const seconds = Math.floor((Date.now() - ts) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}
