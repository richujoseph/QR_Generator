/**
 * ══════════════════════════════════════════════════
 *  QR Code Generator Engine
 *
 *  Wraps the third-party QRCode.js library with
 *  app-specific logic: size, colors, error level,
 *  download (PNG/SVG), and image-based sharing.
 * ══════════════════════════════════════════════════
 */

import { CONFIG, getCorrectLevel } from './config.js';

/** @type {QRCode|null} */
let qrInstance = null;

/** Currently generated URL */
let currentURL = '';

/** Last used colors for SVG export */
let lastColorDark = CONFIG.qr.defaultColorDark;
let lastColorLight = CONFIG.qr.defaultColorLight;

/**
 * Get the currently generated URL.
 * @returns {string}
 */
export function getCurrentURL() {
    return currentURL;
}

/**
 * Get the QR instance (for accessing internal model data).
 * @returns {QRCode|null}
 */
export function getInstance() {
    return qrInstance;
}

/**
 * Generate a QR code inside the target element.
 *
 * @param {HTMLElement} container - element to render the QR into
 * @param {string} url
 * @param {Object} [options]
 * @param {number}  [options.size]
 * @param {string}  [options.colorDark]
 * @param {string}  [options.colorLight]
 * @param {string}  [options.correctLevel]
 */
export function generate(container, url, options = {}) {
    const {
        size = CONFIG.qr.defaultSize,
        colorDark = CONFIG.qr.defaultColorDark,
        colorLight = CONFIG.qr.defaultColorLight,
        correctLevel = CONFIG.qr.defaultCorrectLevel,
    } = options;

    // Clear previous
    container.innerHTML = '';
    qrInstance = null;

    qrInstance = new QRCode(container, {
        text: url,
        width: size,
        height: size,
        colorDark,
        colorLight,
        correctLevel: getCorrectLevel(correctLevel),
    });

    currentURL = url;
    lastColorDark = colorDark;
    lastColorLight = colorLight;
}

/**
 * Download the current QR code as a PNG image with padding.
 * @param {HTMLElement} container
 * @param {string} [filename='qr-code.png']
 * @returns {boolean} success
 */
export function downloadPNG(container, filename = 'qr-code.png') {
    const canvas = container.querySelector('canvas');
    if (!canvas) return false;

    const pad = CONFIG.qr.downloadPadding;
    const dlCanvas = document.createElement('canvas');
    dlCanvas.width = canvas.width + pad * 2;
    dlCanvas.height = canvas.height + pad * 2;

    const ctx = dlCanvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, dlCanvas.width, dlCanvas.height);
    ctx.drawImage(canvas, pad, pad);

    const link = document.createElement('a');
    link.download = filename;
    link.href = dlCanvas.toDataURL('image/png');
    link.click();
    return true;
}

/**
 * Download the current QR code as a proper SVG file.
 * Uses the QRCode.js internal model (`_oQRCode`) to read the exact
 * module grid — this is 100% accurate unlike pixel-scanning.
 *
 * @param {HTMLElement} _container - unused, kept for API compat
 * @param {string} [filename='qr-code.svg']
 * @returns {boolean}
 */
export function downloadSVG(_container, filename = 'qr-code.svg') {
    if (!qrInstance) return false;

    // Access the internal QRCode model
    const qrModel = qrInstance._oQRCode;
    if (!qrModel) return false;

    const moduleCount = qrModel.getModuleCount();
    if (!moduleCount || moduleCount <= 0) return false;

    const quietZone = 4; // standard QR quiet zone in modules
    const totalSize = moduleCount + quietZone * 2;

    // Build SVG rects for each dark module
    let rects = '';
    for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
            if (qrModel.isDark(row, col)) {
                rects += `<rect x="${col + quietZone}" y="${row + quietZone}" width="1" height="1"/>`;
            }
        }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" 
     width="${totalSize * 10}" height="${totalSize * 10}" shape-rendering="crispEdges">
  <rect width="${totalSize}" height="${totalSize}" fill="${lastColorLight}"/>
  <g fill="${lastColorDark}">${rects}</g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();

    // Clean up the object URL after a short delay
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return true;
}

/**
 * Copy the QR code image to the clipboard (if supported).
 * @param {HTMLElement} container
 * @returns {Promise<boolean>}
 */
export async function copyImageToClipboard(container) {
    const canvas = container.querySelector('canvas');
    if (!canvas) return false;

    try {
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png');
        });
        await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
        ]);
        return true;
    } catch {
        return false;
    }
}

/**
 * Share the current URL via Web Share API or fallback to clipboard.
 * @returns {Promise<'shared'|'copied'|'failed'>}
 */
export async function shareUrl() {
    if (!currentURL) return 'failed';

    if (navigator.share) {
        try {
            await navigator.share({ title: 'QR Code Link', url: currentURL });
            return 'shared';
        } catch {
            return 'failed'; // user cancelled
        }
    }

    try {
        await navigator.clipboard.writeText(currentURL);
        return 'copied';
    } catch {
        return 'failed';
    }
}

/**
 * Get a data URL of the current QR code (for fullscreen preview).
 * @param {HTMLElement} container
 * @returns {string|null}
 */
export function getDataURL(container) {
    const canvas = container.querySelector('canvas');
    if (!canvas) return null;
    return canvas.toDataURL('image/png');
}
