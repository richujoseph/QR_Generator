/**
 * ══════════════════════════════════════════════════
 *  Smart Paste — Auto-detects content type from
 *  pasted text and switches to the right QR tab.
 * ══════════════════════════════════════════════════
 */

/**
 * @typedef {'url'|'email'|'phone'|'wifi'|'text'} DetectedType
 */

/**
 * Detect what type of content a string is.
 * @param {string} text
 * @returns {{ type: DetectedType, data: Object }}
 */
export function detectContentType(text) {
    const trimmed = text.trim();
    if (!trimmed) return { type: 'text', data: { value: '' } };

    // WiFi config string
    if (/^WIFI:/i.test(trimmed)) {
        const ssidMatch = trimmed.match(/S:([^;]*)/);
        const passMatch = trimmed.match(/P:([^;]*)/);
        const encMatch = trimmed.match(/T:([^;]*)/);
        return {
            type: 'wifi',
            data: {
                ssid: ssidMatch ? ssidMatch[1] : '',
                password: passMatch ? passMatch[1] : '',
                encryption: encMatch ? encMatch[1] : 'WPA',
            },
        };
    }

    // Email address
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        return { type: 'email', data: { address: trimmed } };
    }

    // mailto: link
    if (/^mailto:/i.test(trimmed)) {
        const addr = trimmed.replace(/^mailto:/i, '').split('?')[0];
        return { type: 'email', data: { address: addr } };
    }

    // Phone number (international or common formats)
    if (/^(\+?\d[\d\s\-().]{6,15})$/.test(trimmed)) {
        return { type: 'phone', data: { value: trimmed } };
    }

    // tel: link
    if (/^tel:/i.test(trimmed)) {
        return { type: 'phone', data: { value: trimmed.replace(/^tel:/i, '') } };
    }

    // URL (starts with http/https or looks like a domain)
    if (/^https?:\/\//i.test(trimmed) || /^[\w-]+(\.[\w-]+)+/.test(trimmed)) {
        return { type: 'url', data: { value: trimmed } };
    }

    // Default: plain text
    return { type: 'text', data: { value: trimmed } };
}
