/**
 * ══════════════════════════════════════════════════
 *  History UI Renderer
 * ══════════════════════════════════════════════════
 */

import { loadHistory, removeFromHistory, clearHistory, formatTimeAgo } from './history.js';

/** @type {Function|null} callback when user clicks a history URL */
let onSelectCallback = null;

/**
 * Initialise the history renderer.
 * @param {Function} onSelect - called with (url) when a history item is clicked
 */
export function initHistoryUI(onSelect) {
    onSelectCallback = onSelect;
    render();

    // Clear button
    const clearBtn = document.getElementById('clearHistoryBtn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            clearHistory();
            render();
        });
    }
}

/**
 * Re-render the history list.
 */
export function render() {
    const container = document.getElementById('historyList');
    const badge = document.getElementById('historyBadge');
    const section = document.getElementById('historySection');
    if (!container) return;

    const entries = loadHistory();

    // Update badge count
    if (badge) badge.textContent = entries.length;

    // Show/hide section
    if (section) {
        section.style.display = entries.length > 0 ? 'block' : 'none';
    }

    if (entries.length === 0) {
        container.innerHTML = '<p class="history-empty">No recent QR codes</p>';
        return;
    }

    container.innerHTML = entries.map((entry, i) => `
        <div class="history-item" data-url="${escapeAttr(entry.url)}" data-id="${entry.id}"
             style="animation-delay: ${i * 0.05}s" role="button" tabindex="0"
             aria-label="Regenerate QR for ${escapeAttr(entry.url)}">
            <span class="history-item__url" title="${escapeAttr(entry.url)}">${escapeHtml(entry.url)}</span>
            <span class="history-item__time">${formatTimeAgo(entry.timestamp)}</span>
            <button class="history-item__delete" data-delete-id="${entry.id}" 
                    aria-label="Delete" title="Remove from history">
                <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
        </div>
    `).join('');

    // Delegated events
    container.addEventListener('click', handleClick, { capture: false });
    container.addEventListener('keydown', handleKeydown, { capture: false });
}

/**
 * Handle click events inside the history list (event delegation).
 */
function handleClick(e) {
    // Delete button
    const deleteBtn = e.target.closest('[data-delete-id]');
    if (deleteBtn) {
        e.stopPropagation();
        removeFromHistory(deleteBtn.dataset.deleteId);
        render();
        return;
    }

    // Item click → regenerate
    const item = e.target.closest('.history-item');
    if (item && onSelectCallback) {
        onSelectCallback(item.dataset.url);
    }
}

/**
 * Handle keyboard events for accessibility.
 */
function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        const item = e.target.closest('.history-item');
        if (item && onSelectCallback) {
            e.preventDefault();
            onSelectCallback(item.dataset.url);
        }
    }
}

/* ── Escape helpers ────────────────────────────── */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
