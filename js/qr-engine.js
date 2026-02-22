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

/**
 * Get the currently generated URL.
 * @returns {string}
 */
export function getCurrentURL() {
    return currentURL;
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
 * Download the current QR code as an SVG file.
 * @param {HTMLElement} container
 * @param {string} [filename='qr-code.svg']
 * @returns {boolean}
 */
export function downloadSVG(container, filename = 'qr-code.svg') {
    const canvas = container.querySelector('canvas');
    if (!canvas) return false;

    const size = canvas.width;
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Determine the module size by checking pixels
    // Find the first dark pixel
    let moduleSize = 1;
    for (let x = 0; x < size; x++) {
        const idx = x * 4;
        if (data[idx] < 128) {  // dark pixel
            // Count consecutive dark pixels
            let count = 0;
            for (let xx = x; xx < size; xx++) {
                const idx2 = xx * 4;
                if (data[idx2] < 128) count++;
                else break;
            }
            moduleSize = count;
            break;
        }
    }

    const modules = Math.round(size / moduleSize);
    const padding = 4;
    const svgSize = modules + padding * 2;

    let rects = '';
    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            const px = Math.floor(col * moduleSize + moduleSize / 2);
            const py = Math.floor(row * moduleSize + moduleSize / 2);
            const idx = (py * size + px) * 4;
            if (data[idx] < 128) { // dark module
                rects += `<rect x="${col + padding}" y="${row + padding}" width="1" height="1"/>`;
            }
        }
    }

    const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${size}" height="${size}">
  <rect width="${svgSize}" height="${svgSize}" fill="#ffffff"/>
  <g fill="#0a0a1a">${rects}</g>
</svg>`;

    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = filename;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
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
