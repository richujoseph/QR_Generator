/**
 * ══════════════════════════════════════════════════
 *  QR Data Encoder — Encodes different data types
 *  into QR-compatible strings.
 * ══════════════════════════════════════════════════
 */

/**
 * @typedef {'url'|'text'|'wifi'|'email'|'phone'|'sms'} QRDataType
 */

/**
 * All supported QR data types with labels and icons.
 */
export const QR_TYPES = [
    { id: 'url', label: 'URL', icon: '🔗', placeholder: 'https://example.com' },
    { id: 'text', label: 'Text', icon: '📝', placeholder: 'Enter any text message...' },
    { id: 'wifi', label: 'WiFi', icon: '📶', placeholder: '' },
    { id: 'email', label: 'Email', icon: '✉️', placeholder: 'hello@example.com' },
    { id: 'phone', label: 'Phone', icon: '📞', placeholder: '+1 234 567 8900' },
    { id: 'sms', label: 'SMS', icon: '💬', placeholder: '+1 234 567 8900' },
];

/**
 * Encode WiFi credentials into a QR-compatible string.
 * @param {Object} opts
 * @param {string} opts.ssid - Network name
 * @param {string} opts.password - Network password
 * @param {string} [opts.encryption='WPA'] - WPA, WEP, or nopass
 * @param {boolean} [opts.hidden=false]
 * @returns {string}
 */
export function encodeWifi({ ssid, password, encryption = 'WPA', hidden = false }) {
    const esc = (s) => s.replace(/[\\;,:""]/g, '\\$&');
    return `WIFI:T:${encryption};S:${esc(ssid)};P:${esc(password)};H:${hidden ? 'true' : 'false'};;`;
}

/**
 * Encode an email into a mailto: QR string.
 * @param {Object} opts
 * @param {string} opts.address
 * @param {string} [opts.subject='']
 * @param {string} [opts.body='']
 * @returns {string}
 */
export function encodeEmail({ address, subject = '', body = '' }) {
    const params = [];
    if (subject) params.push(`subject=${encodeURIComponent(subject)}`);
    if (body) params.push(`body=${encodeURIComponent(body)}`);
    const query = params.length ? '?' + params.join('&') : '';
    return `mailto:${address}${query}`;
}

/**
 * Encode a phone number for QR.
 * @param {string} phone
 * @returns {string}
 */
export function encodePhone(phone) {
    return `tel:${phone.replace(/\s/g, '')}`;
}

/**
 * Encode an SMS for QR.
 * @param {Object} opts
 * @param {string} opts.phone
 * @param {string} [opts.message='']
 * @returns {string}
 */
export function encodeSMS({ phone, message = '' }) {
    const num = phone.replace(/\s/g, '');
    return message ? `smsto:${num}:${message}` : `smsto:${num}`;
}

/**
 * Encode data based on type.
 * @param {QRDataType} type
 * @param {Object} data
 * @returns {{ valid: boolean, encoded?: string, error?: string }}
 */
export function encodeData(type, data) {
    try {
        switch (type) {
            case 'url': {
                let url = (data.value || '').trim();
                if (!url) return { valid: false, error: 'Please enter a URL' };
                if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
                // Validate with URL constructor
                try { new URL(url); } catch { return { valid: false, error: 'Please enter a valid URL' }; }
                return { valid: true, encoded: url };
            }
            case 'text': {
                const text = (data.value || '').trim();
                if (!text) return { valid: false, error: 'Please enter some text' };
                if (text.length > 4296) return { valid: false, error: 'Text is too long for a QR code (max ~4296 chars)' };
                return { valid: true, encoded: text };
            }
            case 'wifi': {
                if (!data.ssid?.trim()) return { valid: false, error: 'Please enter a network name (SSID)' };
                return { valid: true, encoded: encodeWifi(data) };
            }
            case 'email': {
                const addr = (data.address || data.value || '').trim();
                if (!addr) return { valid: false, error: 'Please enter an email address' };
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(addr)) return { valid: false, error: 'Please enter a valid email' };
                return { valid: true, encoded: encodeEmail({ address: addr, subject: data.subject, body: data.body }) };
            }
            case 'phone': {
                const phone = (data.value || '').trim();
                if (!phone) return { valid: false, error: 'Please enter a phone number' };
                return { valid: true, encoded: encodePhone(phone) };
            }
            case 'sms': {
                const phone = (data.phone || data.value || '').trim();
                if (!phone) return { valid: false, error: 'Please enter a phone number' };
                return { valid: true, encoded: encodeSMS({ phone, message: data.message }) };
            }
            default:
                return { valid: false, error: 'Unknown QR type' };
        }
    } catch (e) {
        return { valid: false, error: e.message || 'Encoding failed' };
    }
}
