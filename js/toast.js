/**
 * ══════════════════════════════════════════════════
 *  Toast Notification Manager
 * ══════════════════════════════════════════════════
 */

import { CONFIG } from './config.js';

/** @type {number|null} */
let hideTimeout = null;

/**
 * Show a toast message.
 * @param {string} message
 * @param {'success'|'error'|'info'} [variant='success']
 * @param {number} [duration]
 */
export function showToast(message, variant = 'success', duration = CONFIG.toastDuration) {
    const toast = document.getElementById('toast');
    if (!toast) return;

    // Clear any pending hide
    if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
    }

    // Reset classes
    toast.className = 'toast';
    toast.classList.add(`toast--${variant}`);
    toast.textContent = message;

    // Force reflow then show
    void toast.offsetWidth;
    toast.classList.add('is-visible');

    hideTimeout = setTimeout(() => {
        toast.classList.remove('is-visible');
        hideTimeout = null;
    }, duration);
}
