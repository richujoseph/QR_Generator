/**
 * ══════════════════════════════════════════════════
 *  App Configuration — Constants & Defaults
 * ══════════════════════════════════════════════════
 */

export const CONFIG = Object.freeze({
    /** QR code generation defaults */
    qr: {
        defaultSize: 220,
        sizes: {
            small:  150,
            medium: 220,
            large:  300,
            xlarge: 400,
        },
        defaultColorDark:  '#0a0a1a',
        defaultColorLight: '#ffffff',
        defaultCorrectLevel: 'H',   // L, M, Q, H
        downloadPadding: 32,
    },

    /** Toast auto-hide duration (ms) */
    toastDuration: 2500,

    /** History */
    history: {
        maxItems: 20,
        storageKey: 'qr_generator_history',
    },

    /** Validation */
    validation: {
        maxUrlLength: 2048,
        urlPattern: /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=%]*)?$/i,
    },
});

/**
 * Map string error-correction level to QRCode library constant.
 * @param {string} level - One of 'L', 'M', 'Q', 'H'
 * @returns {number}
 */
export function getCorrectLevel(level) {
    const map = { L: 1, M: 0, Q: 3, H: 2 }; // QRCode lib uses these values
    return map[level] ?? map.H;
}
